# -*- coding: utf-8 -*-
"""
并行分段下载 npm 大体积 tarball（代理对单连接不稳定）。
- 512KB 小分段 + 每段独立重试循环（检查文件大小）
- 组装后校验 gzip 完整性
"""
import os
import subprocess
import gzip
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

PROXY = "http://127.0.0.1:7897"
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "local-packages")

TARBALLS = [
    ("https://registry.npmjs.org/next/-/next-14.2.15.tgz", "next-14.2.15.tgz", 20692089),
    ("https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-14.2.15.tgz",
     "swc-win32-x64-msvc-14.2.15.tgz", 41486991),
    ("https://registry.npmjs.org/typescript/-/typescript-5.5.4.tgz", "typescript-5.5.4.tgz", 4043150),
]

CHUNK_SIZE = 512 * 1024  # 512KB


def is_valid_gzip(path):
    try:
        with gzip.open(path, "rb") as f:
            while f.read(1024 * 1024):
                pass
        return True
    except Exception:
        return False


def download_chunk(url, start, end, dest, max_tries=40):
    """下载一个分段，重试直到文件大小正确。"""
    expected = end - start + 1
    for attempt in range(1, max_tries + 1):
        if os.path.exists(dest) and os.path.getsize(dest) == expected:
            return True
        cmd = ["curl", "-s", "-m", "90", "-x", PROXY, "-r", f"{start}-{end}",
               "--retry", "2", "--retry-delay", "1", "-o", dest, url]
        subprocess.run(cmd, check=False)
        # 大小不对则删除重来
        if os.path.exists(dest) and os.path.getsize(dest) != expected:
            os.remove(dest)
    return os.path.exists(dest) and os.path.getsize(dest) == expected


def download_file(url, name, total):
    dest = os.path.join(OUT_DIR, name)
    if os.path.exists(dest) and is_valid_gzip(dest):
        print(f"[SKIP] {name} 已存在且完整", flush=True)
        return True

    n = max(1, (total + CHUNK_SIZE - 1) // CHUNK_SIZE)
    chunks = []
    for i in range(n):
        start = i * CHUNK_SIZE
        end = min(start + CHUNK_SIZE - 1, total - 1)
        chunks.append((start, end, f"{dest}.part{i}"))

    print(f"[{name}] {total/1024/1024:.1f} MB，{n} 段并行下载", flush=True)

    def run(c):
        start, end, cdest = c
        return (c, download_chunk(url, start, end, cdest))

    ok = True
    with ThreadPoolExecutor(max_workers=12) as ex:
        futures = [ex.submit(run, c) for c in chunks]
        done_count = 0
        for fut in as_completed(futures):
            c, success = fut.result()
            done_count += 1
            if not success:
                ok = False
            if done_count % 10 == 0 or done_count == n:
                print(f"  [{name}] {done_count}/{n} 段完成", flush=True)

    if not ok:
        print(f"[FAIL] {name} 部分分段下载失败", flush=True)
        return False

    with open(dest, "wb") as out:
        for _, _, cdest in chunks:
            with open(cdest, "rb") as f:
                out.write(f.read())
            os.remove(cdest)

    if is_valid_gzip(dest):
        print(f"[OK] {name}: {os.path.getsize(dest)/1024/1024:.1f} MB", flush=True)
        return True
    print(f"[FAIL] {name} gzip 校验失败", flush=True)
    os.remove(dest)
    return False


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    ok = True
    for url, name, size in TARBALLS:
        if not download_file(url, name, size):
            ok = False
    print("ALL_DONE" if ok else "SOME_FAILED", flush=True)


if __name__ == "__main__":
    main()
