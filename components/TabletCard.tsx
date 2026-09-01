import Link from "next/link";
import type { Tablet } from "@/types/tablet";
import { imagePath } from "@/lib/base-path";

function shorten(text: string, max = 80): string {
  const t = text.replace(/\s+/g, " ");
  return t.length > max ? t.slice(0, max) + "…" : t;
}

export function TabletCard({ tablet }: { tablet: Tablet }) {
  const thumb = tablet.images[0];
  const href = `/tablets/${tablet.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-lg border border-ink-200 bg-paper-50 shadow-sm transition hover:shadow-md hover:border-gold-500"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-200">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePath(thumb.path)}
            alt={tablet.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="px-4 text-center text-3xl text-ink-300 font-serif select-none">
              碑
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-lg text-ink-800 leading-snug">{tablet.title}</h3>
          {tablet.dynasty && (
            <span className="shrink-0 rounded bg-gold-400/30 px-2 py-0.5 text-xs text-ink-600">
              {tablet.dynasty}
            </span>
          )}
        </div>
        {tablet.dateText && (
          <p className="text-xs text-ink-400">{tablet.dateText}</p>
        )}
        {tablet.introduction && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-600">{shorten(tablet.introduction, 80)}</p>
        )}
        <div className="mt-auto pt-2 text-right">
          <span className="text-sm text-gold-600 group-hover:underline underline-offset-2">
            查看详情 →
          </span>
        </div>
      </div>
    </Link>
  );
}
