"use client";

import type { Tablet } from "@/types/tablet";
import { SearchBar } from "@/components/SearchBar";
import { imagePath } from "@/lib/base-path";

const DYNASTY_ORDER = ["隋", "唐", "宋", "元", "明", "清"];

export function HeroSection({
  heroTablet,
  total,
  withVideo,
  dynastyCounts,
  onSearch,
}: {
  heroTablet: Tablet | undefined;
  total: number;
  withVideo: number;
  dynastyCounts: Record<string, number>;
  onSearch: (q: string) => void;
}) {
  const heroImage = heroTablet?.images[0];

  const dynastyLine = Object.entries(dynastyCounts)
    .sort((a, b) => {
      const ia = DYNASTY_ORDER.indexOf(a[0]);
      const ib = DYNASTY_ORDER.indexOf(b[0]);
      if (ia === -1 && ib === -1) return a[0].localeCompare(b[0], "zh");
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    })
    .map(([dyn, n]) => `${dyn} ${n}`)
    .join(" · ");

  return (
    <section className="relative py-8 sm:py-12">
      <div className="grid items-center gap-10 lg:grid-cols-[11fr_9fr]">
        {/* 左侧文字区 */}
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 text-sm tracking-[0.2em] text-cinnabar-dark">
            <span className="h-px w-6 bg-cinnabar" aria-hidden="true" />
            楼观台 · 数字碑刻典藏
          </p>

          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-[0.1em] text-ink-900 sm:text-5xl">
            楼观台碑刻
          </h1>
          <p className="mt-2 font-serif text-2xl tracking-[0.42em] text-ink-600 sm:text-[1.7rem]">
            数字典藏
          </p>

          <p className="mt-5 text-lg leading-relaxed text-ink-600">
            对楼观台历代碑刻进行数字化典藏与整理，提供碑文全文检索、碑石图像与影像资料浏览。
          </p>

          <div className="mt-7">
            <SearchBar onSearch={onSearch} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500">
            <span>
              已整理 <b className="font-semibold text-cinnabar-dark">{total}</b> 方碑刻
            </span>
            {dynastyLine && <span className="text-ink-400">{dynastyLine}</span>}
            <span>
              含影像 <b className="font-semibold text-cinnabar-dark">{withVideo}</b> 条
            </span>
          </div>
        </div>

        {/* 右侧碑拓图像 */}
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-md border border-ink-200 bg-paper-light p-3 shadow-soft">
            <div className="overflow-hidden rounded-sm bg-paper-deep">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePath(heroImage.path)}
                  alt={heroTablet?.title || "碑拓图像"}
                  className="h-[420px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[420px] w-full items-center justify-center">
                  <span className="font-serif text-6xl text-ink-300">碑</span>
                </div>
              )}
            </div>
            {heroTablet && (
              <p className="mt-3 flex items-center justify-between px-1 text-sm text-ink-500">
                <span className="font-serif text-ink-700">《{heroTablet.title}》</span>
                {heroTablet.dynasty && (
                  <span className="rounded-sm border border-cinnabar/40 px-1.5 py-0.5 text-xs text-cinnabar-dark">
                    {heroTablet.dynasty}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
