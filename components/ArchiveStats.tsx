// 数据概览：大数字 + 小标题 + 细竖线分隔
export function ArchiveStats({
  total,
  dynasties,
  withVideo,
}: {
  total: number;
  dynasties: number;
  withVideo: number;
}) {
  const items = [
    { value: total, label: "碑刻数量", unit: "方" },
    { value: dynasties, label: "朝代数量", unit: "代" },
    { value: withVideo, label: "碑刻影像", unit: "条" },
  ];

  return (
    <section
      aria-label="数据概览"
      className="grid grid-cols-3 divide-x divide-ink-200 rounded-md border border-ink-200 bg-paper-light"
    >
      {items.map((it) => (
        <div key={it.label} className="flex flex-col items-center px-4 py-6 sm:py-8">
          <div className="flex items-baseline gap-1 font-serif text-ink-900">
            <span className="text-3xl font-semibold tabular-nums sm:text-4xl">{it.value}</span>
            <span className="text-sm text-ink-400">{it.unit}</span>
          </div>
          <p className="mt-2 text-sm tracking-[0.2em] text-ink-500">{it.label}</p>
        </div>
      ))}
    </section>
  );
}
