# -*- coding: utf-8 -*-
"""
校验 data/tablets.json 的数据完整性，输出 data_validation_report.json。

检查项：id 重复、slug 重复、title 为空、fullText 为空、source、图片路径存在、
PDF 页码合法、dynasty 异常、needsReview 与 reviewIssues 一致性、重复碑名、乱码、极短正文。
"""
import json
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")
PUBLIC = os.path.join(BASE, "public")


def main():
    with open(os.path.join(DATA, "tablets.json"), "r", encoding="utf-8") as f:
        tablets = json.load(f)

    issues = []
    seen_id, seen_slug, seen_title = {}, {}, {}

    for tb in tablets:
        tid = tb["id"]
        # id 重复
        seen_id.setdefault(tid, []).append(tb["title"])
        # slug 重复 / 空
        if not tb.get("slug"):
            issues.append({"type": "empty_slug", "id": tid, "title": tb["title"]})
        else:
            seen_slug.setdefault(tb["slug"], []).append(tb["title"])
        # title 空
        if not tb.get("title", "").strip():
            issues.append({"type": "empty_title", "id": tid})
        else:
            seen_title.setdefault(tb["title"], []).append(tid)
        # fullText 空
        ft = tb.get("inscription", {}).get("fullText", "")
        if not ft.strip():
            issues.append({"type": "empty_fulltext", "id": tid, "title": tb["title"]})
        # 极短正文（< 5 字，可能异常）
        elif len(ft.strip()) < 5:
            issues.append({"type": "too_short_fulltext", "id": tid, "title": tb["title"], "len": len(ft)})
        # source
        src = tb.get("source", {})
        if not src.get("textFile"):
            issues.append({"type": "missing_source_textfile", "id": tid, "title": tb["title"]})
        # 图片路径存在性
        for img in tb.get("images", []):
            p = img.get("path", "")
            if not p:
                issues.append({"type": "empty_image_path", "id": tid, "title": tb["title"]})
                continue
            # path 形如 /tablets/pages/page-001.jpg
            local = os.path.join(PUBLIC, p.lstrip("/").replace("/", os.sep))
            if not os.path.exists(local):
                issues.append({"type": "image_not_found", "id": tid, "title": tb["title"], "path": p})
        # PDF 页码合法性
        for pg in src.get("pdfPages", []):
            if not (1 <= pg <= 112):
                issues.append({"type": "invalid_pdf_page", "id": tid, "title": tb["title"], "page": pg})
        # dynasty 异常
        d = tb.get("dynasty")
        if d is not None and d not in ("唐", "宋", "元", "明", "清", "隋", "汉", "周", "秦", "晋", "南北朝"):
            issues.append({"type": "unusual_dynasty", "id": tid, "title": tb["title"], "dynasty": d})
        # needsReview 与 reviewIssues 一致性
        if tb.get("needsReview") and not tb.get("reviewIssues"):
            issues.append({"type": "needsReview_without_issues", "id": tid, "title": tb["title"]})
        # 乱码检测（出现大量替换字符或异常符号）
        garbled = re.findall(r"[�ÂÃ]{3,}", tb.get("title", "") + ft)
        if garbled:
            issues.append({"type": "possible_garbled", "id": tid, "title": tb["title"]})

    # 汇总重复
    for k, v in seen_id.items():
        if len(v) > 1:
            issues.append({"type": "duplicate_id", "value": k, "titles": v})
    for k, v in seen_slug.items():
        if len(v) > 1:
            issues.append({"type": "duplicate_slug", "value": k, "titles": v})
    for k, v in seen_title.items():
        if len(v) > 1:
            issues.append({"type": "duplicate_title", "value": k, "ids": v})

    report = {
        "checkedTablets": len(tablets),
        "issueCount": len(issues),
        "issues": issues,
        "byType": {},
    }
    for it in issues:
        report["byType"][it["type"]] = report["byType"].get(it["type"], 0) + 1

    with open(os.path.join(DATA, "data_validation_report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print("校验完成：共", len(tablets), "块，问题", len(issues), "处")
    print("按类型:", report["byType"])


if __name__ == "__main__":
    main()
