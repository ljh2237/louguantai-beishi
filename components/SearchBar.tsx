"use client";

import { useState } from "react";

export function SearchBar({
  initialValue = "",
  onSearch,
}: {
  initialValue?: string;
  onSearch: (q: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value.trim());
      }}
      className="flex w-full items-stretch gap-2"
    >
      <div className="relative flex-1">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="搜索碑名、碑文、人物、地点、朝代……"
          aria-label="搜索碑刻"
          className="h-14 w-full min-w-0 rounded-md border border-ink-300 bg-paper-light pl-11 pr-4 text-base text-ink-900 placeholder:text-ink-400 transition-colors focus:border-cinnabar focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-md bg-cinnabar px-6 text-base tracking-[0.3em] text-paper-light transition-colors hover:bg-cinnabar-dark"
      >
        检索
      </button>
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            onSearch("");
          }}
          className="shrink-0 rounded-md border border-ink-300 px-4 text-sm text-ink-500 transition-colors hover:border-cinnabar/40 hover:text-cinnabar-dark"
        >
          清除
        </button>
      )}
    </form>
  );
}
