# -*- coding: utf-8 -*-
"""
合并 文本.docx 提取结果 + PDF 扫描页索引，生成最终 data/tablets.json 与 data/tablets.csv。

图片对应关系说明（重要）：
- PDF 无文本层，无法自动 OCR 匹配碑名。
- 采用「书页顺序假设」：现存碑刻（category=main）按 Word 中的顺序，
  依次对应 PDF 第 2 页起（第 1 页为封面）的扫描图。
- 全部图片对应关系标记 needsReview=true，供人工核对。
- 佚碑存文 / 佚碑存目（碑已佚）不分配图片。
"""
import json
import os
import csv

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")


def load(name):
    with open(os.path.join(DATA, name), "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    raw = load("tablets_raw.json")
    pdf_index = load("pdf_index.json")

    # 主类碑刻（现存，按文档顺序）
    main_tablets = [tb for tb in raw if tb["category"] == "main"]
    # PDF 第 1 页为封面，第 2 页起对应主类碑刻第 1 块
    image_start_page = 2  # PDF 页码从 1 开始

    final = []
    for tb in raw:
        images = []
        pdf_pages = []
        cat = tb["category"]

        if cat == "main":
            order_idx = main_tablets.index(tb)
            pdf_page = image_start_page + order_idx
            if pdf_page <= len(pdf_index):
                images.append({
                    "path": pdf_index[pdf_page - 1]["imagePath"],
                    "type": "rubbing",
                    "caption": f"《楼观台道教碑石》扫描图（第{pdf_page}页）",
                    "sourcePdfPages": [pdf_page],
                })
                pdf_pages.append(pdf_page)

        entry = {
            "id": tb["id"],
            "slug": tb["slug"],
            "title": tb["title"],
            "alternativeTitles": tb.get("alternativeTitles", []),
            "category": cat,
            "dynasty": tb.get("dynasty"),
            "dateText": tb.get("dateText"),
            "location": None,
            "author": None,
            "calligrapher": None,
            "engraver": None,
            "otherPeople": [],
            "introduction": None,
            "inscription": {
                "front": None,
                "back": None,
                "otherSections": [],
                "fullText": tb["fullText"],
            },
            "images": images,
            "source": {
                "textFile": "文本.docx",
                "pdfFile": "楼观台道教碑石.pdf" if images else None,
                "pdfPages": pdf_pages,
            },
            "needsReview": tb.get("needsReview", True),
            "reviewIssues": list(tb.get("reviewIssues", [])),
        }

        # 简介：取正文第一段（说明文字）作为摘要
        first = tb["fullText"].split("\n")[0].strip() if tb["fullText"] else ""
        if first and len(first) <= 200:
            entry["introduction"] = first
        elif first:
            entry["introduction"] = first[:200] + "…"

        # 图片对应关系为假设，标记待核
        if images:
            entry["needsReview"] = True
            entry["reviewIssues"].append("碑刻图片与PDF页码对应关系为按书页顺序的假设，需人工核对")
        if cat in ("佚碑存文", "佚碑存目"):
            entry["needsReview"] = True
            entry["reviewIssues"].append(f"此为{ '佚碑存文' if cat=='佚碑存文' else '佚碑存目'}，原碑已佚，无存图")

        final.append(entry)

    with open(os.path.join(DATA, "tablets.json"), "w", encoding="utf-8") as f:
        json.dump(final, f, ensure_ascii=False, indent=2)

    # 更新 review_queue.json
    review_queue = [
        {"id": tb["id"], "title": tb["title"], "category": tb["category"],
         "issues": tb["reviewIssues"], "needsReview": tb["needsReview"]}
        for tb in final if tb["needsReview"] or tb["reviewIssues"]
    ]
    with open(os.path.join(DATA, "review_queue.json"), "w", encoding="utf-8") as f:
        json.dump(review_queue, f, ensure_ascii=False, indent=2)

    # 生成 tablets.csv
    csv_path = os.path.join(DATA, "tablets.csv")
    cols = ["id", "碑名", "别名", "朝代", "年代", "地点", "撰文人", "书写人", "篆刻人",
            "简介是否存在", "正文长度", "碑阳是否存在", "碑阴是否存在", "图片数量",
            "PDF页码", "needsReview", "reviewIssues"]
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(cols)
        for tb in final:
            w.writerow([
                tb["id"],
                tb["title"],
                "、".join(tb["alternativeTitles"]),
                tb["dynasty"] or "",
                tb["dateText"] or "",
                tb["location"] or "",
                tb["author"] or "",
                tb["calligrapher"] or "",
                tb["engraver"] or "",
                "是" if tb["introduction"] else "否",
                len(tb["inscription"]["fullText"]),
                "是" if tb["inscription"]["front"] else "否",
                "是" if tb["inscription"]["back"] else "否",
                len(tb["images"]),
                ",".join(str(p) for p in tb["source"]["pdfPages"]),
                "是" if tb["needsReview"] else "否",
                "；".join(tb["reviewIssues"]),
            ])

    n_img = sum(1 for tb in final if tb["images"])
    print("生成 tablets.json：共", len(final), "块碑刻")
    print("  有图片:", n_img, "块")
    print("  朝代分布:", {d: sum(1 for t in final if t['dynasty'] == d) for d in sorted(set(t['dynasty'] for t in final) - {None})})
    print("生成 tablets.csv:", csv_path)
    print("生成 review_queue.json：共", len(review_queue), "条待核")


if __name__ == "__main__":
    main()
