# -*- coding: utf-8 -*-
"""
将 B 站视频标题匹配到碑刻数据库，更新 tablets.json 的 video 字段，
生成 video_mapping_report.json / 更新 review_queue.json。
"""
import json
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")


def load(name):
    with open(os.path.join(DATA, name), "r", encoding="utf-8") as f:
        return json.load(f)


def clean_title(s):
    """清理视频标题：去 '视频N:' 前缀、引号、书名号、空格、标点。"""
    s = re.sub(r"^视频\d+\s*[:：]\s*", "", s.strip())
    s = re.sub(r"[\s《》〈〉「」『』【】（）()·．.、，,。:：;；\-—_\"'“”‘’]+", "", s)
    return s


def core(s):
    """提取核心：去掉常见前缀（人名+书/撰）和后缀（碑/碑记/刻石/题记/题咏刻石）。"""
    s = clean_title(s)
    s = re.sub(r"^[^书刻撰]{2,4}(书|撰)", "", s)  # 去 '赵孟頫书' '吴琚书' 等前缀
    s = re.sub(r"(碑记|碑刻|石碑|题咏刻石|题记|刻石|残碑|墓碑|碑)$", "", s)
    return s


# 手动映射：视频标题（清理后）→ 碑名（处理简称/年号前缀等）
MANUAL_MAP = {
    "苏轼楼观台题记": "苏轼楼观题记",
    "上善池碑": "赵孟頫书上善池刻石",
    "天下第一福地碑": "吴琚书天下第一福地刻石",
    "乾隆五十八年重修楼观碑记": "重修楼观碑记",
    "嘉庆重修楼观台记": "重修楼观台记",
    "老君显见碑": "老君显见碑",
}

# 同名碑歧义：视频标题（清理后）→ 在候选碑中按内容选出正确的那块
def match_minguo_shuojingtai(tablets):
    """民国重修说经台记：introduction 或 dateText 含"民国"的那块《重修说经台记》。"""
    for t in tablets:
        if t["title"] == "重修说经台记":
            blob = (t.get("introduction") or "") + (t.get("dateText") or "")
            if "民国" in blob:
                return t
    return None


def find_by_title(tablets, title):
    """按标题找碑，返回 (list of tablets, 匹配类型)。"""
    c = clean_title(title)
    # 0) 同名碑特殊歧义：民国重修说经台记（不再硬编码 id，避免 id 变动导致错配）
    if "民国" in c and "重修说经台记" in c:
        t = match_minguo_shuojingtai(tablets)
        if t:
            return [t], "manual_id"
    # 1) 完全一致（返回所有同名碑，供歧义检测）
    exact_matches = [t for t in tablets if t["title"] == c]
    if exact_matches:
        return exact_matches, "exact"
    # 2) 手动映射
    if c in MANUAL_MAP:
        mapped = MANUAL_MAP[c]
        for t in tablets:
            if t["title"] == mapped:
                return [t], "manual"
    # 3) core 匹配
    for t in tablets:
        if core(t["title"]) and core(c) and core(t["title"]) == core(c):
            return [t], "core"
    # 4) 包含关系
    cc = clean_title(c)
    for t in tablets:
        tc = clean_title(t["title"])
        if cc and tc and (cc in tc or tc in cc):
            ratio = min(len(cc), len(tc)) / max(len(cc), len(tc))
            if ratio >= 0.7:
                return [t], "fuzzy"
    return [], None


def main():
    tablets = load("tablets.json")
    videos = load("bilibili_videos.json")

    report = {"matched": [], "uncertain": [], "unmatchedVideos": [], "tabletsWithoutVideo": []}

    for t in tablets:
        t["video"] = None

    # 环境/地图/多碑类视频：不匹配碑刻
    env_keywords = ("环境", "地图", "四块碑图", "古银杏")

    used_video_ids = set()

    for v in videos:
        vtitle = v["title"]
        c = clean_title(vtitle)

        # 环境类视频跳过（不匹配碑刻）
        if any(k in c for k in env_keywords):
            report["unmatchedVideos"].append({"videoTitle": vtitle, "bvid": v["bvid"], "reason": "环境/地图/多碑视频"})
            continue

        matches, mtype = find_by_title(tablets, c)
        if not matches:
            report["unmatchedVideos"].append({"videoTitle": vtitle, "bvid": v["bvid"], "reason": "未匹配到碑名"})
            continue

        # 同名碑歧义
        if len(matches) > 1:
            report["uncertain"].append({
                "videoTitle": vtitle, "bvid": v["bvid"],
                "possibleTablet": "、".join(m["title"] for m in matches),
                "confidence": 0.8, "reason": "同名碑有多块，需人工确认",
            })
            continue

        t = matches[0]
        # 如果该碑已有视频（重复视频标题）
        if t["id"] in used_video_ids:
            report["uncertain"].append({
                "videoTitle": vtitle, "bvid": v["bvid"],
                "possibleTablet": t["title"], "confidence": 0.9,
                "reason": "该碑已有另一视频匹配",
            })
            continue

        used_video_ids.add(t["id"])
        embed = f"https://player.bilibili.com/player.html?bvid={v['bvid']}&page=1"
        t["video"] = {
            "platform": "bilibili",
            "title": vtitle,
            "bvid": v["bvid"],
            "url": v["url"],
            "embedUrl": embed,
        }
        report["matched"].append({
            "videoTitle": vtitle, "bvid": v["bvid"],
            "tabletTitle": t["title"], "matchType": mtype,
        })

    report["tabletsWithoutVideo"] = [{"id": t["id"], "title": t["title"]} for t in tablets if not t["video"]]

    with open(os.path.join(DATA, "tablets.json"), "w", encoding="utf-8") as f:
        json.dump(tablets, f, ensure_ascii=False, indent=2)
    public_data = os.path.join(BASE, "public", "data", "tablets.json")
    os.makedirs(os.path.dirname(public_data), exist_ok=True)
    with open(public_data, "w", encoding="utf-8") as f:
        json.dump(tablets, f, ensure_ascii=False, indent=2)

    with open(os.path.join(DATA, "video_mapping_report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    # 更新 review_queue
    rq_path = os.path.join(DATA, "review_queue.json")
    try:
        rq = json.load(open(rq_path, "r", encoding="utf-8"))
    except Exception:
        rq = []
    for u in report["uncertain"]:
        rq.append({
            "type": "video_mapping",
            "videoTitle": u["videoTitle"],
            "possibleTablet": u["possibleTablet"],
            "confidence": u.get("confidence"),
            "needsReview": True,
        })
    with open(rq_path, "w", encoding="utf-8") as f:
        json.dump(rq, f, ensure_ascii=False, indent=2)

    print(f"视频总数：{len(videos)}")
    print(f"自动匹配：{len(report['matched'])}")
    print(f"不确定：{len(report['uncertain'])}")
    print(f"未匹配（环境/其他）：{len(report['unmatchedVideos'])}")
    print(f"无视频碑刻：{len(report['tabletsWithoutVideo'])}")
    print("\n=== 匹配 ===")
    for m in report["matched"]:
        print(f"  ✅ {m['videoTitle']} → {m['tabletTitle']} ({m['matchType']})")
    print("\n=== 不确定 ===")
    for u in report["uncertain"]:
        print(f"  ⚠️ {u['videoTitle']} → {u['possibleTablet']}（{u['reason']}）")
    print("\n=== 未匹配 ===")
    for u in report["unmatchedVideos"]:
        print(f"  ❌ {u['videoTitle']}（{u['reason']}）")


if __name__ == "__main__":
    main()
