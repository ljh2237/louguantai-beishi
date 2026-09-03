"use client";

import Link from "next/link";
import type { SearchResult } from "@/lib/search";
import { Highlight } from "@/components/Highlight";

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
      className="block rounded-lg border border-ink-200 bg-paper-50 p-4 transition hover:border-gold-500 hover:shadow-sm"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg text-ink-800">
          <Highlight text={t.title} query={query} />
        </h3>
        <div className="flex shrink-0 items-center gap-2 text-xs text-ink-400">
          {t.dynasty && (
            <span className="rounded bg-gold-400/30 px-2 py-0.5 text-ink-600">{t.dynasty}</span>
          )}
          {t.video && (
            <span className="rounded bg-ink-100 px-2 py-0.5 text-ink-500">▶ 有影像</span>
          )}
          {result.matchCount > 0 && <span>{result.matchCount} 处匹配</span>}
        </div>
      </div>

      {result.snippets.length > 0 && (
        <div className="mt-3 space-y-2">
          {result.snippets.map((s, i) => (
            <div key={i} className="text-sm leading-relaxed text-ink-600">
              <span className="mr-1 text-xs text-ink-400">[{s.fieldLabel}]</span>
              <Highlight text={s.before + s.match + s.after} query={query} />
            </div>
          ))}
        </div>
      )}

      {result.snippets.length === 0 && t.introduction && (
        <p className="mt-2 line-clamp-2 text-sm text-ink-600">{t.introduction}</p>
      )}
    </Link>
  );
}
