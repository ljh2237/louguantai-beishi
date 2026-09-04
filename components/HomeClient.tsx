"use client";

import { useMemo, useState } from "react";
import type { Tablet } from "@/types/tablet";
import { searchTablets } from "@/lib/search";
import type { ArchiveStats } from "@/lib/tablets";
import { HeroSection } from "@/components/HeroSection";
import { ArchiveStats as ArchiveStatsBand } from "@/components/ArchiveStats";
import { SectionHeading } from "@/components/SectionHeading";
import { SearchBar } from "@/components/SearchBar";
import { DynastyFilter } from "@/components/DynastyFilter";
import { TabletCard } from "@/components/TabletCard";
import { SearchSnippet } from "@/components/SearchSnippet";
import { MessageBoard } from "@/components/MessageBoard";

export function HomeClient({
  tablets,
  stats,
}: {
  tablets: Tablet[];
  stats: ArchiveStats;
}) {
  const [query, setQuery] = useState("");
  const [selectedDynasties, setSelectedDynasties] = useState<string[]>([]);

  const results = useMemo(
    () => searchTablets(query, selectedDynasties, tablets),
    [query, selectedDynasties, tablets]
  );

  const hasQuery = query.trim().length > 0 || selectedDynasties.length > 0;

  // Hero 展示图：优先选《大唐宗圣观记》，否则取第一块有图像的碑
  const heroTablet =
    tablets.find((t) => t.title === "大唐宗圣观记" && t.images.length > 0) ||
    tablets.find((t) => t.images.length > 0);

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* 首屏 Hero */}
      <HeroSection
        heroTablet={heroTablet}
        total={stats.total}
        withVideo={stats.withVideo}
        dynastyCounts={stats.dynastyCounts}
        onSearch={setQuery}
      />

      {/* 数据概览 */}
      <ArchiveStatsBand
        total={stats.total}
        dynasties={stats.dynasties.length}
        withVideo={stats.withVideo}
      />

      {/* 检索 / 碑刻总览 */}
      <section id="search" className="scroll-mt-24">
        {hasQuery ? (
          <SectionHeading title="碑文检索" subtitle="在石刻文字中寻找历史的踪迹" />
        ) : (
          <SectionHeading title="碑刻总览" subtitle="石刻无言，文脉有声" />
        )}

        <div className="space-y-5">
          <SearchBar initialValue={query} onSearch={setQuery} />
          <DynastyFilter
            dynasties={stats.dynasties}
            selected={selectedDynasties}
            onChange={setSelectedDynasties}
          />
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
          ) : results.length === 0 ? (
            <div className="rounded-md border border-ink-200 bg-paper-light py-20 text-center text-ink-400">
              当前筛选条件下暂无碑刻。
            </div>
          ) : (
            <div>
              <p className="mb-5 text-sm text-ink-500">
                共 <b className="text-cinnabar-dark">{results.length}</b> 块碑刻
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((r) => (
                  <TabletCard key={r.tablet.id} tablet={r.tablet} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 留言互动 */}
      <section id="messages" className="scroll-mt-24">
        <SectionHeading title="留言" subtitle="访碑题记，如晤古人" />
        <MessageBoard />
      </section>
    </div>
  );
}
