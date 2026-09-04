import { SectionHeading } from "@/components/SectionHeading";

// 楼观印象：博物馆摄影式布局（实地素材待补充）
export function EnvironmentSection() {
  return (
    <section id="impressions" className="scroll-mt-24">
      <SectionHeading title="楼观印象" subtitle="观其山色，想见古贤" />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "楼观台环境", icon: "山" },
          { label: "地图位置", icon: "图" },
          { label: "古银杏", icon: "木" },
        ].map((it) => (
          <div
            key={it.label}
            className="flex aspect-[4/3] flex-col items-center justify-center rounded-md border border-dashed border-ink-300 bg-paper-light px-4 py-10 text-center transition-colors hover:border-bronze/50"
          >
            <span className="select-none font-serif text-4xl text-ink-300">{it.icon}</span>
            <span className="mt-3 text-sm tracking-[0.15em] text-ink-600">{it.label}</span>
            <span className="mt-1 text-xs text-ink-400">相关影像资料待补充</span>
          </div>
        ))}
      </div>

      <p className="text-note mt-4 text-sm text-ink-400">
        本模块结构已实现，实地环境照片与地图素材待人工整理后补充。
      </p>
    </section>
  );
}
