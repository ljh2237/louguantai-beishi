import Link from "next/link";

const NAV = [
  { href: "/", label: "碑刻总览" },
  { href: "/search", label: "全文检索" },
  { href: "/videos", label: "碑刻影像" },
  { href: "/#impressions", label: "楼观印象" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200 bg-paper-100/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          {/* 朱砂印章 Logo */}
          <span
            className="flex h-9 w-9 items-center justify-center rounded-sm bg-cinnabar font-serif text-lg text-paper-light shadow-hairline"
            aria-hidden="true"
          >
            碑
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg tracking-[0.14em] text-ink-900">楼观台碑刻</span>
            <span className="mt-1 text-xs tracking-[0.3em] text-ink-400">数字典藏</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm text-ink-600 sm:gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-2.5 py-1.5 transition-colors hover:text-cinnabar-dark sm:px-3"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
