export function EnvironmentSection() {
  return (
    <section className="rounded-lg border border-ink-200 bg-paper-50 p-6">
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-xl text-ink-800">楼观台概览</h2>
        <span className="rounded bg-ink-100 px-2 py-0.5 text-xs text-ink-400">待补充</span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: "楼观台环境", icon: "山" },
          { label: "地图位置", icon: "图" },
          { label: "古银杏", icon: "木" },
        ].map((it) => (
          <div
            key={it.label}
            className="flex flex-col items-center justify-center rounded-md border border-dashed border-ink-300 bg-paper-100 px-4 py-10 text-center"
          >
            <span className="text-3xl text-ink-300 font-serif">{it.icon}</span>
            <span className="mt-2 text-sm text-ink-500">{it.label}</span>
            <span className="mt-1 text-xs text-ink-400">相关环境资料待补充</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-400">
        本模块结构已实现，实地环境照片与地图素材待人工整理后补充。
      </p>
    </section>
  );
}
