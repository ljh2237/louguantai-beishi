"use client";

// 朝代筛选：印章签样式（方角 4px，选中朱砂底 + 暖白字）
export function DynastyFilter({
  dynasties,
  selected,
  onChange,
}: {
  dynasties: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (d: string) => {
    if (selected.includes(d)) onChange(selected.filter((x) => x !== d));
    else onChange([...selected, d]);
  };

  if (dynasties.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm tracking-[0.15em] text-ink-500">朝代</span>
      {dynasties.map((d) => {
        const active = selected.includes(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() => toggle(d)}
            aria-pressed={active}
            className={`rounded-sm border px-3.5 py-1.5 text-sm transition-colors ${
              active
                ? "border-cinnabar bg-cinnabar text-paper-light"
                : "border-ink-300 bg-paper-light text-ink-600 hover:border-cinnabar/50 hover:text-cinnabar-dark"
            }`}
          >
            {d}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="ml-1 text-sm text-ink-400 underline underline-offset-4 transition-colors hover:text-cinnabar-dark"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
