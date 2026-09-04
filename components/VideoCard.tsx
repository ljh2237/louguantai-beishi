import Link from "next/link";
import type { Tablet } from "@/types/tablet";

// 影像卡片：只渲染卡片链接，跳转到详情页播放，不在此页加载 iframe
export function VideoCard({ tablet }: { tablet: Tablet }) {
  const v = tablet.video;
  if (!v) return null;

  return (
    <Link
      href={`/tablets/${tablet.slug}#video`}
      className="group flex items-center gap-4 rounded-md border border-ink-200 bg-paper-light p-4 transition-all duration-200 hover:border-cinnabar/50 hover:shadow-soft"
    >
      {/* 播放指示 */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-ink-200 bg-paper-deep text-ink-500 transition-colors group-hover:border-cinnabar/40 group-hover:bg-cinnabar/5 group-hover:text-cinnabar">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="truncate font-serif text-lg text-ink-900">{tablet.title}</h3>
          {tablet.dynasty && (
            <span className="shrink-0 rounded-sm border border-cinnabar/40 px-1.5 py-0.5 text-xs text-cinnabar-dark">
              {tablet.dynasty}
            </span>
          )}
        </div>
        {v.title && v.title !== tablet.title && (
          <p className="mt-1 truncate text-sm text-ink-500">{v.title}</p>
        )}
        <p className="mt-1 text-xs text-ink-400">点击前往详情页观看影像</p>
      </div>

      <span className="shrink-0 text-sm text-cinnabar-dark opacity-0 transition-opacity group-hover:opacity-100">
        播放 →
      </span>
    </Link>
  );
}
