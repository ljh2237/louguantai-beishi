import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-ink-200 bg-paper-100/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-xl text-ink-800 sm:text-2xl">楼观台碑刻数字平台</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-600">
          <Link href="/" className="hover:text-ink-800">
            首页
          </Link>
          <Link href="/gallery" className="hover:text-ink-800">
            碑石图库
          </Link>
          <Link href="/#messages" className="hover:text-ink-800">
            留言
          </Link>
        </nav>
      </div>
    </header>
  );
}
