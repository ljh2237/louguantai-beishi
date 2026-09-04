"use client";

import Link from "next/link";
import type { SearchResult } from "@/lib/search";
import { Highlight } from "@/components/Highlight";

// 检索结果：文献检索列表风格（上/下细线分隔，克制的悬停底色）
export function SearchSnippet({
  result,
  query,
}: {
  result: SearchResult;
  query: string;
}) {
  const t = result.tablet;
  return (
    <Link
      href={`/tablets/${t.slug}`}
      className="group block border-b border-ink-200 py-5 first:border-t transition-colors hover:bg-paper-light/70"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg text-ink-900">
          <Highlight text={t.title} query={query} />
        </h3>
        <div className="flex shrink-0 items-center gap-2 text-xs text-ink-400">
          {t.dynasty && (
            <span className="rounded-sm border border-cinnabar/40 px-1.5 py-0.5 text-cinnabar-dark">
              {t.dynasty}
            </span>
          )}
          {t.video && <span className="text-ink-400">▶ 影像</span>}
          {result.matchCount > 0 && <span>{result.matchCount} 处</span>}
        </div>
      </div>

      {result.snippets.length > 0 && (
        <div className="mt-3 space-y-2">
          {result.snippets.map((s, i) => (
            <div key={i} className="text-[15px] leading-relaxed text-ink-600">
              <span className="mr-2 text-xs text-ink-400">〔{s.fieldLabel}〕</span>
              <Highlight text={s.before + s.match + s.after} query={query} />
            </div>
          ))}
        </div>
      )}

      {result.snippets.length === 0 && t.introduction && (
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink-600">
          {t.introduction}
        </p>
      )}

      <div className="mt-3 text-right text-xs text-ink-400 opacity-0 transition-opacity group-hover:opacity-100">
        查看详情 →
      </div>
    </Link>
  );
}
