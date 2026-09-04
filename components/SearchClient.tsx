"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Tablet } from "@/types/tablet";
import { searchTablets } from "@/lib/search";
import { SectionHeading } from "@/components/SectionHeading";
import { SearchBar } from "@/components/SearchBar";
import { DynastyFilter } from "@/components/DynastyFilter";
import { SearchSnippet } from "@/components/SearchSnippet";

function SearchBody({
  tablets,
  dynasties,
}: {
  tablets: Tablet[];
  dynasties: string[];
}) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params?.get("q") || "");
  const [selected, setSelected] = useState<string[]>([]);

  const results = useMemo(
    () => searchTablets(query, selected, tablets),
    [query, selected, tablets]
  );

  const hasQuery = query.trim().length > 0 || selected.length > 0;

  return (
    <div className="mx-auto max-w-shell space-y-8">
      <nav className="text-sm text-ink-400">
        <a href="/" className="transition-colors hover:text-cinnabar-dark">
          碑刻总览
        </a>
        <span className="mx-2">/</span>
        <span className="text-ink-600">全文检索</span>
      </nav>

      <SectionHeading title="碑文检索" subtitle="在石刻文字中寻找历史的踪迹" />

      <div className="space-y-5">
        <SearchBar initialValue={query} onSearch={setQuery} />
        <DynastyFilter dynasties={dynasties} selected={selected} onChange={setSelected} />
      </div>

      <div className="mt-8">
        {hasQuery ? (
          results.length === 0 ? (
            <div className="rounded-md border border-ink-200 bg-paper-light py-20 text-center text-ink-400">
              未找到与“{query}”相关的碑刻，请尝试其他关键词。
            </div>
          ) : (
            <div>
              <p className="mb-2 text-sm text-ink-500">
                共找到 <b className="text-cinnabar-dark">{results.length}</b> 条相关结果
              </p>
              <div>
                {results.map((r) => (
                  <SearchSnippet key={r.tablet.id} result={r} query={query} />
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="rounded-md border border-ink-200 bg-paper-light py-20 text-center text-ink-400">
            请输入关键词，检索碑名、碑文、人物、地点或朝代。
          </div>
        )}
      </div>
    </div>
  );
}

export function SearchClient({
  tablets,
  dynasties,
}: {
  tablets: Tablet[];
  dynasties: string[];
}) {
  return (
    <Suspense fallback={<p className="text-ink-400">加载中……</p>}>
      <SearchBody tablets={tablets} dynasties={dynasties} />
    </Suspense>
  );
}
