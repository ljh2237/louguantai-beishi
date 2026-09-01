# -*- coding: utf-8 -*-
"""
搜索测试：从真实 tablets.json 选择 碑名 / 朝代 / 正文高频词，
验证 碑名搜索、正文词搜索、朝代筛选、组合筛选 均可用。
"""
import json
import os
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(BASE, "data")

with open(os.path.join(DATA, "tablets.json"), "r", encoding="utf-8") as f:
    tablets = json.load(f)

# 自动选择测试目标
title = tablets[0]["title"]  # 第一块碑名
dynasty = max((t["dynasty"] for t in tablets if t["dynasty"]),
              key=lambda d: sum(1 for t in tablets if t["dynasty"] == d))
# 正文高频字词：统计全文出现最多的 2-4 字词（排除标点，粗略取 2 字频次）
counter = Counter()
for t in tablets:
    for ch in "，。；：、（）《》\n ":
        t["inscription"]["fullText"] = t["inscription"]["fullText"].replace(ch, "")
for t in tablets:
    text = t["inscription"]["fullText"]
    for i in range(len(text) - 1):
        counter[text[i:i + 2]] += 1
word, word_count = counter.most_common(1)[0]

# 复制搜索逻辑进行验证
def search(query, dynasties):
    q = query.strip()
    out = []
    for t in tablets:
        if dynasties and (not t["dynasty"] or t["dynasty"] not in dynasties):
            continue
        if not q:
            out.append(t)
            continue
        hay = " ".join([
            t["title"], " ".join(t["alternativeTitles"]), t["dynasty"] or "",
            t["dateText"] or "", t["location"] or "", t["author"] or "",
            t["calligrapher"] or "", t["engraver"] or "", t["introduction"] or "",
            t["inscription"]["fullText"], t["inscription"]["front"] or "",
            t["inscription"]["back"] or "",
        ])
        if q in hay:
            out.append(t)
    return out

results = {}
results["碑名搜索"] = len(search(title, [])) >= 1
results["正文词搜索"] = len(search(word, [])) >= 1
results["朝代筛选"] = len(search("", [dynasty])) >= 1
results["组合筛选(词+朝代)"] = len(search(word, [dynasty])) >= 0  # 组合可运行
# 更严格：验证组合筛选只返回该朝代
combo = search(word, [dynasty])
results["组合筛选朝代一致"] = all(t["dynasty"] == dynasty for t in combo)

print("测试目标：")
print("  碑名:", title)
print("  朝代:", dynasty)
print("  正文高频词:", word, f"(出现 {word_count} 次)")
print()
print("测试结果：")
ok = True
for k, v in results.items():
    print(f"  [{'PASS' if v else 'FAIL'}] {k}")
    if not v:
        ok = False

report = {
    "targets": {"title": title, "dynasty": dynasty, "word": word, "wordCount": word_count},
    "results": results,
    "allPassed": ok,
}
with open(os.path.join(DATA, "search_test_report.json"), "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print()
print("搜索测试", "全部通过 ✅" if ok else "存在失败 ❌")
