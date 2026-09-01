"use client";

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
      <span className="text-sm text-ink-500">朝代：</span>
      {dynasties.map((d) => {
        const active = selected.includes(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() => toggle(d)}
            className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
              active
                ? "bg-ink-700 text-paper-50 border-ink-700"
                : "bg-paper-50 text-ink-600 border-ink-300 hover:bg-paper-100"
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
          className="text-sm text-ink-400 underline underline-offset-2 hover:text-ink-600"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
