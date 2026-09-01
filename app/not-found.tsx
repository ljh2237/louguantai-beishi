import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="font-serif text-4xl text-ink-800">404</h1>
      <p className="mt-3 text-ink-600">未找到该碑刻页面</p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-ink-700 px-5 py-2 text-paper-50 hover:bg-ink-600 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}
