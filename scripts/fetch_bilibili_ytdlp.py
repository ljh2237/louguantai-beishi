# -*- coding: utf-8 -*-
"""
用 yt-dlp 抓取 B 站空间视频列表（走代理绕过 IP 风控），生成 data/bilibili_videos.json。
只抓元数据，不下载视频。
"""
import json
import os
import subprocess
import sys

UID = "2038989985"
PROXY = "http://127.0.0.1:7897"
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")
os.makedirs(DATA, exist_ok=True)

SPACE_URL = f"https://space.bilibili.com/{UID}/video"


def fetch_raw(max_tries=20):
    for i in range(1, max_tries + 1):
        p = subprocess.run(
            ["yt-dlp", "--proxy", PROXY, "--dump-json",
             "--sleep-requests", "0.5", "--no-warnings", SPACE_URL],
            capture_output=True, text=True, timeout=300,
        )
        out = p.stdout.strip()
        if out:
            lines = out.splitlines()
            # 验证是完整视频 JSON（含 title 和 id）
            good = [l for l in lines if '"title"' in l and '"id"' in l and '"url"' in l]
            if len(good) >= 20:
                return good
            print(f"  第 {i} 次不完整（{len(good)}/{len(lines)} 条），重试...", file=sys.stderr)
        else:
            print(f"  第 {i} 次失败（可能风控），重试...", file=sys.stderr)
    return []


def fmt_duration(seconds):
    try:
        s = int(round(float(seconds)))
        return f"{s // 60}:{s % 60:02d}"
    except Exception:
        return ""


def main():
    lines = fetch_raw()
    if not lines:
        print("抓取失败，请稍后再试")
        return

    videos = []
    seen = set()
    for line in lines:
        try:
            d = json.loads(line)
        except Exception:
            continue
        bvid = d.get("id") or ""
        if not bvid or bvid in seen:
            continue
        seen.add(bvid)
        videos.append({
            "title": d.get("title") or "",
            "bvid": bvid,
            "url": f"https://www.bilibili.com/video/{bvid}",
            "publishDate": d.get("upload_date") or "",
            "duration": fmt_duration(d.get("duration")),
            "cover": d.get("thumbnail") or "",
        })

    # 按发布时间排序（新→旧）
    videos.sort(key=lambda v: v["publishDate"], reverse=True)

    with open(os.path.join(DATA, "bilibili_videos.json"), "w", encoding="utf-8") as f:
        json.dump(videos, f, ensure_ascii=False, indent=2)

    print(f"抓取到 {len(videos)} 个视频\n")
    for i, v in enumerate(videos, 1):
        print(f"{i:2d}. {v['title']}  {v['bvid']}  {v['duration']}")


if __name__ == "__main__":
    main()
