# -*- coding: utf-8 -*-
"""
从 Bilibili 账号公开投稿列表抓取视频元数据（标题/BV号/链接/封面/时长/发布时间）。
只抓元数据，不下载视频文件。

- 使用 B 站空间视频列表接口（x/space/wbi/arc/search）
- 实现 WBI 签名（-352 风控）
- 走代理 127.0.0.1:7897
"""
import hashlib
import json
import os
import time
import urllib.parse

import requests

UID = "2038989985"
PROXY = {"http": "http://127.0.0.1:7897", "https": "http://127.0.0.1:7897"}

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")
os.makedirs(DATA, exist_ok=True)

MIXIN_KEY_ENC_TAB = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
    33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
    61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
    36, 20, 34, 44, 52,
]

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")


def get_mixin_key(img_key: str, sub_key: str) -> str:
    s = img_key + sub_key
    return "".join(s[i] for i in MIXIN_KEY_ENC_TAB)[:32]


def wbi_sign(params: dict, img_key: str, sub_key: str) -> str:
    mixin_key = get_mixin_key(img_key, sub_key)
    params = dict(params)
    params["wts"] = int(time.time())
    filtered = {
        k: "".join(ch for ch in str(v) if ch not in "!'()*")
        for k, v in params.items()
    }
    query = urllib.parse.urlencode(sorted(filtered.items()))
    return hashlib.md5((query + mixin_key).encode()).hexdigest()


def main():
    session = requests.Session()
    session.headers.update({"User-Agent": UA, "Referer": "https://www.bilibili.com/"})

    # 1) 拿 cookie
    try:
        session.get("https://www.bilibili.com/", timeout=20)
    except Exception as e:
        print("首页 cookie 获取失败:", repr(e)[:100])

    # 2) 拿 wbi keys
    try:
        nav = session.get("https://api.bilibili.com/x/web-interface/nav",
                         timeout=20).json()
    except Exception as e:
        print("nav 接口失败:", repr(e)[:100])
        return
    wbi = nav.get("data", {}).get("wbi_img", {})
    img_url = wbi.get("img_url", "")
    sub_url = wbi.get("sub_url", "")
    if not img_url or not sub_url:
        print("无法获取 wbi_img:", json.dumps(nav, ensure_ascii=False)[:200])
        return

    def key_from(url):
        return url.rsplit("/", 1)[-1].split(".")[0]

    img_key = key_from(img_url)
    sub_key = key_from(sub_url)
    print("img_key:", img_key)
    print("sub_key:", sub_key)

    # 3) 分页抓取
    all_videos = []
    page_count = None
    for pn in range(1, 6):
        params = {"mid": UID, "ps": 30, "pn": pn, "order": "pubdate"}
        w_rid = wbi_sign(params, img_key, sub_key)
        params["w_rid"] = w_rid
        url = "https://api.bilibili.com/x/space/wbi/arc/search?" + urllib.parse.urlencode(params)
        r = session.get(url, timeout=20)
        print(f"  第 {pn} 页 HTTP {r.status_code} content-type={r.headers.get('content-type')}")
        try:
            d = r.json()
        except Exception:
            print("  响应非 JSON:", r.text[:200])
            break
        if d.get("code") != 0:
            print(f"第 {pn} 页失败: code={d.get('code')} message={d.get('message')}")
            if d.get("code") == -799:
                print("  被限流，等待 30 秒重试...")
                time.sleep(30)
                pn -= 1
                continue
            break
        data = d["data"]
        vlist = data.get("list", {}).get("vlist", [])
        page_count = data.get("page", {}).get("count", 0)
        for v in vlist:
            all_videos.append({
                "title": v.get("title", ""),
                "bvid": v.get("bvid", ""),
                "url": f"https://www.bilibili.com/video/{v.get('bvid', '')}",
                "publishDate": time.strftime("%Y-%m-%d", time.localtime(v.get("created", 0))) if v.get("created") else "",
                "duration": v.get("length", ""),
                "cover": v.get("pic", ""),
            })
        if len(all_videos) >= page_count or not vlist:
            break

    print(f"总投稿数(接口报告): {page_count}")
    print(f"实际抓取: {len(all_videos)} 个")

    with open(os.path.join(DATA, "bilibili_videos.json"), "w", encoding="utf-8") as f:
        json.dump(all_videos, f, ensure_ascii=False, indent=2)

    print("\n=== 视频标题 ===")
    for i, v in enumerate(all_videos, 1):
        print(f"{i:2d}. {v['title']}  {v['bvid']}")


if __name__ == "__main__":
    main()
