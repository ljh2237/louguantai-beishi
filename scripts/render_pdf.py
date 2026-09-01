# -*- coding: utf-8 -*-
"""
将扫描版《楼观台道教碑石.pdf》逐页渲染为网页图片，并生成 pdf_index.json。

- PDF 无文本层（纯扫描），每页一张嵌入扫描图。
- 逐页渲染为 max-dimension 1600px 的 JPEG（网页适用，兼顾清晰度与体积）。
- 生成 data/pdf_index.json，记录每页尺寸/图片路径/待人工核对标记。
"""
import json
import os
import fitz

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(BASE)
PDF = os.path.join(ROOT, "楼观台道教碑石.pdf")
DATA = os.path.join(BASE, "data")
IMG_DIR = os.path.join(BASE, "public", "tablets", "pages")
os.makedirs(DATA, exist_ok=True)
os.makedirs(IMG_DIR, exist_ok=True)

MAX_DIM = 1600
JPEG_QUALITY = 82


def main():
    doc = fitz.open(PDF)
    n = doc.page_count
    index = []

    for i in range(n):
        page = doc.load_page(i)
        w, h = page.rect.width, page.rect.height
        # 缩放矩阵，使最大边 <= MAX_DIM
        scale = MAX_DIM / max(w, h)
        if scale > 1.0:
            scale = 1.0
        pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
        fname = f"page-{i+1:03d}.jpg"
        fpath = os.path.join(IMG_DIR, fname)
        pix.save(fpath, jpg_quality=JPEG_QUALITY)

        orientation = "竖" if h > w else "横"
        index.append({
            "page": i + 1,
            "orientation": orientation,
            "width": int(pix.width),
            "height": int(pix.height),
            "imagePath": f"/tablets/pages/{fname}",
            "possibleTabletTitles": [],
            "description": "",
            "needsReview": True,
            "reviewIssues": ["扫描页无文本层，碑名与页码对应关系需人工核对"],
        })
        if (i + 1) % 20 == 0:
            print(f"  已渲染 {i+1}/{n} 页")

    with open(os.path.join(DATA, "pdf_index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    total_bytes = sum(os.path.getsize(os.path.join(IMG_DIR, fn)) for fn in os.listdir(IMG_DIR))
    print(f"渲染完成：共 {n} 页 -> {IMG_DIR}")
    print(f"图片总大小：{total_bytes/1024/1024:.1f} MB")


if __name__ == "__main__":
    main()
