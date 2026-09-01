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
      className="flex w-full max-w-2xl mx-auto gap-2"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索碑名、碑文、人物、地点、朝代……"
        aria-label="搜索碑刻"
        className="flex-1 min-w-0 rounded-md border border-ink-300 bg-paper-50 px-4 py-3 text-ink-900 placeholder:text-ink-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
      />
      <button
        type="submit"
        className="shrink-0 rounded-md bg-ink-700 px-5 py-3 text-paper-50 hover:bg-ink-600 transition-colors"
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
          className="shrink-0 rounded-md border border-ink-300 px-3 py-3 text-ink-500 hover:bg-paper-100"
        >
          清除
        </button>
      )}
    </form>
  );
}
