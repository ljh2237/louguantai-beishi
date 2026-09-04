import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-sm tracking-[0.3em] text-cinnabar-dark">楼观台碑刻 · 数字典藏</p>
      <h1 className="mt-4 font-serif text-5xl text-ink-900">404</h1>
      <p className="mt-4 text-ink-600">未找到该碑刻页面</p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-cinnabar px-6 py-2.5 text-paper-light transition-colors hover:bg-cinnabar-dark"
      >
        返回碑刻总览
      </Link>
    </div>
  );
}
