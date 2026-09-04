# -*- coding: utf-8 -*-
"""
从 文本.docx 提取碑刻篇目，生成 data/tablets_raw.json 等数据文件。

数据原则：
- 历史信息只来自 文本.docx 原文，不做任何模型记忆式补全。
- 不确定的字段保持 null / 空，并标记 needsReview。
- 附录一(佚碑存文)、附录二(佚碑存目) 中的条目也作为碑刻收录，但标注 category。
"""
import json
import os
import re
import docx
from pypinyin import lazy_pinyin, Style

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(BASE)  # beishi 根目录
DOCX = os.path.join(ROOT, "文本.docx")
DATA = os.path.join(BASE, "data")
os.makedirs(DATA, exist_ok=True)


def slugify(title):
    py = lazy_pinyin(title, style=Style.NORMAL, errors="ignore")
    parts = [re.sub(r"[^a-z0-9]+", "", s.lower()) for s in py]
    parts = [s for s in parts if s]
    s = "-".join(parts)
    return re.sub(r"-+", "-", s).strip("-") or f"tablet-{abs(hash(title)) % 100000}"


DYNASTY_PREFIXES = [
    ("大唐", "唐"), ("大元", "元"), ("大明", "明"), ("大清", "清"), ("大宋", "宋"),
    ("隋", "隋"), ("唐", "唐"), ("宋", "宋"), ("元", "元"), ("明", "明"), ("清", "清"),
]


def detect_dynasty(title):
    t = title.lstrip("*").strip()
    for prefix, dyn in DYNASTY_PREFIXES:
        if t.startswith(prefix):
            return dyn
    return None


def detect_date(text):
    m = re.search(r"([唐宋元明清隋]{1,3}朝?)([^，。；,;]{0,14}?年)", text)
    if m:
        return (m.group(1) + m.group(2)).strip()
    return None


def clean_title(raw):
    return raw.strip().lstrip("*").strip()


def main():
    doc = docx.Document(DOCX)
    paras = [(p.style.name, p.text) for p in doc.paragraphs]

    tablets = []
    section = "main"
    current = None
    app2_items = []  # (idx, text)

    def flush():
        nonlocal current
        if current is None:
            return
        current["fullText"] = "\n".join(current["fullText"]).strip()
        if current["fullText"]:
            tablets.append(current)
        current = None

    for idx, (style, raw) in enumerate(paras, 1):
        t = raw.strip()
        if not t:
            continue
        if style.startswith("Heading 1") or (style.startswith("Heading 2") and t.startswith("*")):
            if t == "附录一：佚碑存文":
                flush(); section = "佚碑存文"; continue
            if t == "附录二：佚碑存目":
                flush(); section = "佚碑存目"; continue
            flush()
            current = {
                "title": clean_title(t),
                "rawTitle": t,
                "alternativeTitles": [],
                "category": section,
                "dynasty": detect_dynasty(t),
                "dateText": None,
                "fullText": [],
                "source": {"textFile": "文本.docx", "paragraphStart": idx},
                "needsReview": True,
                "reviewIssues": [],
            }
            if t.startswith("*"):
                current["reviewIssues"].append("标题含'*'前缀，可能为刻石类，需人工核对分类")
            continue

        if section == "佚碑存目":
            app2_items.append((idx, t))
            continue

        if current is not None:
            current["fullText"].append(t)

    flush()

    # 解析 附录二：标题行 + 说明行
    # 说明行特征：以时间/朝代词开头，或含"刻立/早佚/刻于/残卷/道藏/金石"等
    def is_app2_desc(line):
        return (line.startswith(("刻", "元", "宋", "明", "清", "唐"))
                or "刻立" in line or "早佚" in line or "刻于" in line
                or "残卷" in line or "道藏" in line or "金石" in line)

    app2 = []
    for idx, t in app2_items:
        if not is_app2_desc(t):
            app2.append({"title": t, "idx": idx, "desc": []})
        else:
            if app2:
                app2[-1]["desc"].append(t)
            else:
                app2.append({"title": t, "idx": idx, "desc": []})

    for it in app2:
        tablets.append({
            "title": it["title"],
            "rawTitle": it["title"],
            "alternativeTitles": [],
            "category": "佚碑存目",
            "dynasty": detect_dynasty(it["title"]),
            "dateText": None,
            "fullText": "\n".join(it["desc"]).strip(),
            "source": {"textFile": "文本.docx", "paragraphStart": it["idx"]},
            "needsReview": True,
            "reviewIssues": ["佚碑存目，仅存目录信息"],
        })

    # 稳定 id 与 slug
    for j, tb in enumerate(tablets, 1):
        tb["id"] = j

    slug_count = {}
    for tb in tablets:
        tb["slug"] = slugify(tb["title"])
        slug_count.setdefault(tb["slug"], []).append(tb["id"])
    for s, ids in slug_count.items():
        if len(ids) > 1:
            for k, tid in enumerate(ids):
                for tb in tablets:
                    if tb["id"] == tid:
                        tb["slug"] = f"{s}-{k+1}"

    # dateText 从正文首段提取
    for tb in tablets:
        if not tb["dateText"] and tb["fullText"]:
            tb["dateText"] = detect_date(tb["fullText"].split("\n")[0])

    # 朝代补充：若标题无朝代字样，但 dateText 开头含朝代字，则据 dateText 推断（来自原文）
    for tb in tablets:
        if not tb["dynasty"] and tb["dateText"]:
            m = re.match(r"^([唐宋元明清隋])", tb["dateText"])
            if m:
                tb["dynasty"] = m.group(1)
                tb["reviewIssues"].append("朝代据年代文本开头推断，需人工核对")

    # 报告
    report = {
        "sourceFile": "文本.docx",
        "totalTablets": len(tablets),
        "titles": [tb["title"] for tb in tablets],
        "byCategory": {},
        "clearBoundaries": [],
        "unclearBoundaries": [],
        "possibleDuplicateTitles": [],
        "possibleMisses": [],
    }
    for tb in tablets:
        report["byCategory"][tb["category"]] = report["byCategory"].get(tb["category"], 0) + 1

    title_count = {}
    for tb in tablets:
        title_count.setdefault(tb["title"], []).append(tb["id"])
    for ttl, ids in title_count.items():
        if len(ids) > 1:
            report["possibleDuplicateTitles"].append({"title": ttl, "ids": ids})

    for tb in tablets:
        if len(tb["fullText"].strip()) < 10:
            report["unclearBoundaries"].append(tb["title"])
            tb["needsReview"] = True
            tb["reviewIssues"].append("正文过短或缺失，篇目边界待人工核对")
        else:
            report["clearBoundaries"].append(tb["title"])

    review_queue = [
        {"id": tb["id"], "title": tb["title"], "category": tb["category"],
         "issues": tb["reviewIssues"], "needsReview": tb["needsReview"]}
        for tb in tablets if tb["needsReview"] or tb["reviewIssues"]
    ]

    with open(os.path.join(DATA, "tablets_raw.json"), "w", encoding="utf-8") as f:
        json.dump(tablets, f, ensure_ascii=False, indent=2)
    with open(os.path.join(DATA, "extraction_report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    with open(os.path.join(DATA, "review_queue.json"), "w", encoding="utf-8") as f:
        json.dump(review_queue, f, ensure_ascii=False, indent=2)

    print("识别碑刻总数:", len(tablets))
    print("分类统计:", report["byCategory"])
    print("重复标题:", report["possibleDuplicateTitles"])
    print("边界不明确:", len(report["unclearBoundaries"]), report["unclearBoundaries"])


if __name__ == "__main__":
    main()
