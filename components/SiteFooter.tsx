import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-paper-200/40">
      <div className="mx-auto max-w-shell px-4 py-8 text-center sm:px-6">
        <div className="flex items-center justify-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-cinnabar font-serif text-base text-paper-light">
            碑
          </span>
          <span className="font-serif text-base tracking-[0.14em] text-ink-800">
            纸上碑林 · 数字楼观
          </span>
        </div>

        <nav className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-500">
          <Link href="/" className="hover:text-cinnabar-dark">
            碑刻总览
          </Link>
          <Link href="/search" className="hover:text-cinnabar-dark">
            全文检索
          </Link>
          <Link href="/videos" className="hover:text-cinnabar-dark">
            碑刻影像
          </Link>
          <Link href="/gallery" className="hover:text-cinnabar-dark">
            碑石图库
          </Link>
        </nav>
      </div>
    </footer>
  );
}
