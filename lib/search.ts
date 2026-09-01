import type { Tablet } from "@/types/tablet";

export interface Snippet {
  field: string;
  fieldLabel: string;
  before: string;
  match: string;
  after: string;
}

export interface SearchResult {
  tablet: Tablet;
  matchCount: number;
  matchedFields: string[];
  snippets: Snippet[];
}

export interface SearchField {
  key: string;
  label: string;
  get: (t: Tablet) => string;
}

export const SEARCH_FIELDS: SearchField[] = [
  { key: "title", label: "碑名", get: (t) => t.title },
  { key: "alternativeTitles", label: "别名", get: (t) => t.alternativeTitles.join("、") },
  { key: "dynasty", label: "朝代", get: (t) => t.dynasty || "" },
  { key: "dateText", label: "年代", get: (t) => t.dateText || "" },
  { key: "location", label: "地点", get: (t) => t.location || "" },
  { key: "author", label: "撰文", get: (t) => t.author || "" },
  { key: "calligrapher", label: "书写", get: (t) => t.calligrapher || "" },
  { key: "engraver", label: "篆刻", get: (t) => t.engraver || "" },
  { key: "introduction", label: "简介", get: (t) => t.introduction || "" },
  { key: "fullText", label: "碑文", get: (t) => t.inscription.fullText },
  { key: "front", label: "碑阳", get: (t) => t.inscription.front || "" },
  { key: "back", label: "碑阴", get: (t) => t.inscription.back || "" },
];

const SNIPPET_WINDOW = 30;
const MAX_SNIPPETS_PER_TABLET = 3;

function indexOfIgnoreCase(haystack: string, needle: string, from = 0): number {
  return haystack.toLowerCase().indexOf(needle.toLowerCase(), from);
}

function buildSnippets(field: SearchField, text: string, query: string): Snippet[] {
  const snippets: Snippet[] = [];
  if (!text) return snippets;
  let pos = indexOfIgnoreCase(text, query);
  while (pos !== -1 && snippets.length < MAX_SNIPPETS_PER_TABLET) {
    const start = Math.max(0, pos - SNIPPET_WINDOW);
    const end = Math.min(text.length, pos + query.length + SNIPPET_WINDOW);
    const before = text.slice(start, pos);
    const match = text.slice(pos, pos + query.length);
    const after = text.slice(pos + query.length, end);
    snippets.push({
      field: field.key,
      fieldLabel: field.label,
      before: (start > 0 ? "…" : "") + before,
      match,
      after: after + (end < text.length ? "…" : ""),
    });
    pos = indexOfIgnoreCase(text, query, pos + query.length);
  }
  return snippets;
}

// 全文检索：跨 title / 碑文 / 人物 / 地点 / 简介等字段，支持朝代筛选
export function searchTablets(
  query: string,
  dynastyFilter: string[] = [],
  all: Tablet[] = []
): SearchResult[] {
  const q = query.trim();
  const dynasties = dynastyFilter.filter(Boolean);
  const results: SearchResult[] = [];

  for (const tablet of all) {
    // 朝代筛选
    if (dynasties.length > 0) {
      if (!tablet.dynasty || !dynasties.includes(tablet.dynasty)) continue;
    }

    // 空搜索词：返回全部（无匹配片段）
    if (!q) {
      results.push({
        tablet,
        matchCount: 0,
        matchedFields: [],
        snippets: [],
      });
      continue;
    }

    let matchCount = 0;
    const matchedFields: string[] = [];
    const snippets: Snippet[] = [];

    for (const field of SEARCH_FIELDS) {
      const text = field.get(tablet);
      if (!text) continue;
      const lower = text.toLowerCase();
      const ql = q.toLowerCase();
      let count = 0;
      let idx = lower.indexOf(ql);
      while (idx !== -1) {
        count++;
        idx = lower.indexOf(ql, idx + ql.length);
      }
      if (count > 0) {
        matchCount += count;
        matchedFields.push(field.label);
        snippets.push(...buildSnippets(field, text, q));
      }
    }

    if (matchCount > 0) {
      results.push({
        tablet,
        matchCount,
        matchedFields,
        snippets: snippets.slice(0, MAX_SNIPPETS_PER_TABLET),
      });
    }
  }

  // 按匹配数量降序（空查询保持原顺序）
  if (q) {
    results.sort((a, b) => b.matchCount - a.matchCount);
  }
  return results;
}
