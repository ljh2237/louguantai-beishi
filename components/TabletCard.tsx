import Link from "next/link";
import type { Tablet } from "@/types/tablet";
import { imagePath } from "@/lib/base-path";

function shorten(text: string, max = 80): string {
  const t = text.replace(/\s+/g, " ");
  return t.length > max ? t.slice(0, max) + "…" : t;
}

// 碑刻卡片：博物馆文献展签风格（暖白底 + 1px 细边 + 4~6px 圆角）
export function TabletCard({ tablet }: { tablet: Tablet }) {
  const thumb = tablet.images[0];
  const href = `/tablets/${tablet.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-md border border-ink-200 bg-paper-light transition-all duration-200 hover:border-cinnabar/50 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-deep">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePath(thumb.path)}
            alt={tablet.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="select-none font-serif text-4xl text-ink-300">碑</span>
          </div>
        )}
        {tablet.video && (
          <span className="absolute left-2 top-2 rounded-sm bg-paper-light/90 px-1.5 py-0.5 text-xs text-ink-600">
            ▶ 影像
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-lg leading-snug text-ink-900">{tablet.title}</h3>
          {tablet.dynasty && (
            <span className="shrink-0 rounded-sm border border-cinnabar/40 px-1.5 py-0.5 text-xs text-cinnabar-dark">
              {tablet.dynasty}
            </span>
          )}
        </div>
        {tablet.dateText && <p className="text-xs text-ink-400">{tablet.dateText}</p>}
        {tablet.introduction && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-600">
            {shorten(tablet.introduction, 80)}
          </p>
        )}
        <div className="mt-auto pt-2 text-right">
          <span className="text-sm text-cinnabar-dark opacity-70 transition-opacity group-hover:opacity-100">
            查看详情 →
          </span>
        </div>
      </div>
    </Link>
  );
}
