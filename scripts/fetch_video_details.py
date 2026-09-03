# -*- coding: utf-8 -*-
"""
对已有的 BV 号逐个用 yt-dlp 抓取视频标题/时长/发布时间/封面，
生成完整的 data/bilibili_videos.json（走代理，带重试）。
"""
import json
import os
import subprocess
import sys

PROXY = "http://127.0.0.1:7897"
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")

VIDEOS_PATH = os.path.join(DATA, "bilibili_videos.json")


def fmt_duration(seconds):
    try:
        s = int(round(float(seconds)))
        return f"{s // 60}:{s % 60:02d}"
    except Exception:
        return ""


def get_video_info(bvid, max_tries=8):
    url = f"https://www.bilibili.com/video/{bvid}"
    for i in range(1, max_tries + 1):
        p = subprocess.run(
            ["yt-dlp", "--proxy", PROXY, "--dump-json", "--skip-download",
             "--no-warnings", "--print", "after_move:dump_single_json", url],
            capture_output=True, text=True, encoding="utf-8", timeout=60,
        )
        out = (p.stdout or "").strip()
        if not out:
            continue
        try:
            d = json.loads(out)
        except Exception:
            # 可能输出多行，取最后一行 JSON
            for line in out.splitlines()[::-1]:
                try:
                    d = json.loads(line)
                    break
                except Exception:
                    continue
            else:
                continue
        title = d.get("title")
        if title:
            return {
                "title": title,
                "bvid": bvid,
                "url": f"https://www.bilibili.com/video/{bvid}",
                "publishDate": d.get("upload_date") or "",
                "duration": fmt_duration(d.get("duration")),
                "cover": d.get("thumbnail") or "",
            }
    return None


def main():
    with open(VIDEOS_PATH, "r", encoding="utf-8") as f:
        existing = json.load(f)

    bvids = [v["bvid"] for v in existing if v.get("bvid")]
    print(f"待处理 {len(bvids)} 个 BV 号")

    videos = []
    failed = []
    for idx, bvid in enumerate(bvids, 1):
        info = get_video_info(bvid)
        if info:
            videos.append(info)
            print(f"  [{idx}/{len(bvids)}] ✅ {info['title']}")
        else:
            failed.append(bvid)
            print(f"  [{idx}/{len(bvids)}] ❌ {bvid} 失败")
        if idx % 5 == 0:
            # 中间保存进度
            with open(VIDEOS_PATH, "w", encoding="utf-8") as f:
                json.dump(videos, f, ensure_ascii=False, indent=2)

    videos.sort(key=lambda v: v["publishDate"], reverse=True)
    with open(VIDEOS_PATH, "w", encoding="utf-8") as f:
        json.dump(videos, f, ensure_ascii=False, indent=2)

    print(f"\n完成：{len(videos)}/{len(bvids)} 个视频")
    if failed:
        print("失败的 BV 号:", failed)


if __name__ == "__main__":
    main()
