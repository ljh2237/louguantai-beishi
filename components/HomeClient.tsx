"use client";

import { useMemo, useState } from "react";
import type { Tablet } from "@/types/tablet";
import { searchTablets } from "@/lib/search";
import { SearchBar } from "@/components/SearchBar";
import { DynastyFilter } from "@/components/DynastyFilter";
import { TabletCard } from "@/components/TabletCard";
import { SearchSnippet } from "@/components/SearchSnippet";
import { EnvironmentSection } from "@/components/EnvironmentSection";
import { MessageBoard } from "@/components/MessageBoard";

export function HomeClient({
  tablets,
  dynasties,
  stats,
}: {
  tablets: Tablet[];
  dynasties: string[];
  stats: { total: number; withImage: number; withReview: number };
}) {
  const [query, setQuery] = useState("");
  const [selectedDynasties, setSelectedDynasties] = useState<string[]>([]);

  const results = useMemo(
    () => searchTablets(query, selectedDynasties, tablets),
    [query, selectedDynasties, tablets]
  );

  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* 标题与简介 */}
      <section className="py-6 text-center">
        <h1 className="font-serif text-3xl text-ink-900 sm:text-4xl">楼观台碑刻数字平台</h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-600">
          本平台对楼观台碑刻资料进行数字化整理，提供碑文全文检索、图像浏览和资料查询等功能。
        </p>
        <div className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
          <span>已整理 <b className="text-gold-600">{stats.total}</b> 块碑刻</span>
          <span>含碑石图像 <b className="text-gold-600">{stats.withImage}</b> 块</span>
          <span>待人工复核 <b className="text-gold-600">{stats.withReview}</b> 块</span>
        </div>
      </section>

      {/* 搜索与筛选 */}
      <section className="space-y-4">
        <SearchBar initialValue={query} onSearch={setQuery} />
        <DynastyFilter dynasties={dynasties} selected={selectedDynasties} onChange={setSelectedDynasties} />
      </section>

      {/* 搜索结果 */}
      <section>
        {hasQuery ? (
          results.length === 0 ? (
            <div className="rounded-lg border border-ink-200 bg-paper-50 py-16 text-center text-ink-400">
              未找到与“{query}”相关的碑刻，请尝试其他关键词。
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-ink-500">
                共找到 <b>{results.length}</b> 条相关结果
              </p>
              {results.map((r) => (
                <SearchSnippet key={r.tablet.id} result={r} query={query} />
              ))}
            </div>
          )
        ) : (
          <>
            {results.length === 0 ? (
              <div className="rounded-lg border border-ink-200 bg-paper-50 py-16 text-center text-ink-400">
                当前筛选条件下暂无碑刻。
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-ink-500">
                  共 <b>{results.length}</b> 块碑刻
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((r) => (
                    <TabletCard key={r.tablet.id} tablet={r.tablet} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* 环境概览 */}
      <EnvironmentSection />

      {/* 留言互动 */}
      <section id="messages" className="scroll-mt-20">
        <h2 className="mb-4 font-serif text-xl text-ink-800">留言互动</h2>
        <MessageBoard />
      </section>
    </div>
  );
}
