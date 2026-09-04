import type { Tablet } from "@/types/tablet";

// 元数据：文献标签式横排（左标签 + 右内容 + 细线分隔）
export function TabletMeta({ tablet }: { tablet: Tablet }) {
  const rows: { label: string; value: string }[] = [];
  if (tablet.alternativeTitles.length > 0)
    rows.push({ label: "别名", value: tablet.alternativeTitles.join("、") });
  if (tablet.dynasty) rows.push({ label: "朝代", value: tablet.dynasty });
  if (tablet.dateText) rows.push({ label: "年代", value: tablet.dateText });
  if (tablet.location) rows.push({ label: "地点", value: tablet.location });
  if (tablet.author) rows.push({ label: "撰文", value: tablet.author });
  if (tablet.calligrapher) rows.push({ label: "书写", value: tablet.calligrapher });
  if (tablet.engraver) rows.push({ label: "篆刻", value: tablet.engraver });
  if (tablet.otherPeople.length > 0)
    rows.push({ label: "其他人物", value: tablet.otherPeople.join("、") });

  if (rows.length === 0) return null;

  return (
    <dl className="border-y border-ink-200">
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-1 border-b border-ink-200 py-2.5 last:border-b-0 sm:grid-cols-[96px_1fr]"
        >
          <dt className="text-sm tracking-[0.1em] text-ink-400">{r.label}</dt>
          <dd className="text-sm leading-relaxed text-ink-700">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
