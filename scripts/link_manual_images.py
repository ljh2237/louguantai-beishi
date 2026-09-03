# -*- coding: utf-8 -*-
"""
人工图片关联脚本：扫描 public/tablets/manual/ 下的图片，按文件名匹配碑刻，
更新 data/tablets.json 的 images 字段，替换掉之前"按书页顺序假设"的图片。

命名规则（用户在 manual 文件夹里放图时遵守）：
  1. 用碑名命名：                大唐宗圣观记.jpg
  2. 一块碑多张图加后缀：        大唐宗圣观记-碑阳.jpg  / 大唐宗圣观记-碑阴.jpg / 大唐宗圣观记-1.jpg
  3. 重名碑用 id 前缀区分：      49-佚名楼观题咏刻石.jpg  （id 见验收报告碑名清单）

脚本会自动：
  - 按 id 或碑名匹配
  - 把匹配到的图片写入对应碑的 images（替换原假设图片）
  - 生成 data/manual_images_report.json 报告（匹配成功 / 未匹配 / 歧义）
"""
import json
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")
MANUAL = os.path.join(BASE, "public", "tablets", "manual")

IMG_EXTS = (".jpg", ".jpeg", ".png", ".webp")


def main():
    if not os.path.isdir(MANUAL):
        print("manual 文件夹不存在：", MANUAL)
        return

    with open(os.path.join(DATA, "tablets.json"), "r", encoding="utf-8") as f:
        tablets = json.load(f)

    files = [f for f in os.listdir(MANUAL) if f.lower().endswith(IMG_EXTS)]
    if not files:
        print("manual 文件夹里还没有图片。请把截图按碑名命名后放入：")
        print("  ", MANUAL)
        return

    report = {"matched": [], "unmatched": [], "ambiguous": []}

    # 先清空所有碑的 images，重建（manual 优先，无 manual 则保留原假设图片）
    # 记录每块碑原有的（假设）图片，用于 fallback
    original = {t["id"]: t.get("images", []) for t in tablets}

    # 收集 manual 图片 -> 每块碑
    manual_map = {}  # id -> [(文件名, 后缀, 路径)]
    for fname in files:
        name = os.path.splitext(fname)[0]  # 去扩展名
        tid = None
        base = name
        section = None

        # 解析 id-前缀（重名碑区分）
        m = re.match(r"^(\d+)-(.+)$", name)
        if m:
            tid = int(m.group(1))
            base = m.group(2)

        # 解析 -后缀（碑阳/碑阴/1/2 等）
        if "-" in base:
            base, section = base.split("-", 1)

        if tid is not None:
            # 按 id 精确匹配
            tablet = next((t for t in tablets if t["id"] == tid), None)
            if tablet:
                manual_map.setdefault(tid, []).append((fname, section, base))
                report["matched"].append({"file": fname, "id": tid, "title": tablet["title"]})
            else:
                report["unmatched"].append({"file": fname, "reason": f"id {tid} 不存在"})
        else:
            # 按碑名/slug 匹配
            matches = [t for t in tablets if t["title"] == base or t["slug"] == base]
            if len(matches) == 1:
                t = matches[0]
                manual_map.setdefault(t["id"], []).append((fname, section, base))
                report["matched"].append({"file": fname, "id": t["id"], "title": t["title"]})
            elif len(matches) > 1:
                report["ambiguous"].append({
                    "file": fname,
                    "reason": f"同名碑有 {len(matches)} 块（id: {[t['id'] for t in matches]}），请用 'id-碑名' 命名",
                })
            else:
                report["unmatched"].append({"file": fname, "reason": "未匹配到碑名，请检查命名"})

    # 更新每块碑的 images
    for t in tablets:
        if t["id"] in manual_map:
            imgs = []
            for fname, section, base in manual_map[t["id"]]:
                ext = os.path.splitext(fname)[1]
                path = f"/tablets/manual/{fname}"
                caption = t["title"] + (f" · {section}" if section else "")
                imgs.append({
                    "path": path,
                    "type": "rubbing",
                    "caption": caption,
                    "sourcePdfPages": [],
                })
            t["images"] = imgs
            # 人工核对过的图片，清除相关 review 提示
            t["needsReview"] = any(
                "图片" not in iss for iss in t.get("reviewIssues", [])
            ) or t.get("needsReview", False)
            t["reviewIssues"] = [iss for iss in t.get("reviewIssues", []) if "图片与PDF页码" not in iss]

    with open(os.path.join(DATA, "tablets.json"), "w", encoding="utf-8") as f:
        json.dump(tablets, f, ensure_ascii=False, indent=2)

    # 同步到 public/data（供浏览器读取）
    public_data = os.path.join(BASE, "public", "data", "tablets.json")
    os.makedirs(os.path.dirname(public_data), exist_ok=True)
    with open(public_data, "w", encoding="utf-8") as f:
        json.dump(tablets, f, ensure_ascii=False, indent=2)

    with open(os.path.join(DATA, "manual_images_report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"扫描到 {len(files)} 张图片")
    print(f"匹配成功：{len(report['matched'])} 张")
    print(f"未匹配：{len(report['unmatched'])} 张")
    print(f"歧义（需用 id 前缀）：{len(report['ambiguous'])} 张")
    if report["unmatched"]:
        print("\n未匹配的图片：")
        for u in report["unmatched"]:
            print("  -", u["file"], "→", u["reason"])
    if report["ambiguous"]:
        print("\n歧义的图片：")
        for a in report["ambiguous"]:
            print("  -", a["file"], "→", a["reason"])


if __name__ == "__main__":
    main()
