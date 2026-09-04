// 统一区块标题：大间距墨色标题 + 仿宋副标题 + 朱砂短线
export function SectionHeading({
  title,
  subtitle,
  align = "left",
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <div className={`mb-8 flex flex-col ${alignCls}`}>
      <h2 className="font-serif text-2xl font-semibold tracking-[0.28em] text-ink-900 sm:text-[1.75rem]">
        {title}
      </h2>
      {subtitle && <p className="text-note mt-3 text-base text-ink-500">{subtitle}</p>}
      <div className="mt-4 h-[2px] w-10 bg-cinnabar" aria-hidden="true" />
    </div>
  );
}
