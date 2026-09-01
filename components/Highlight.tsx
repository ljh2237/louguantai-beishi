"use client";

import { Fragment, type ReactNode } from "react";

// 安全关键词高亮：React 默认转义，不使用 dangerouslySetInnerHTML
export function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  const q = query.toLowerCase();
  const lower = text.toLowerCase();
  const nodes: ReactNode[] = [];
  let i = 0;
  let idx = lower.indexOf(q);
  let k = 0;
  while (idx !== -1) {
    if (idx > i) nodes.push(<Fragment key={k++}>{text.slice(i, idx)}</Fragment>);
    nodes.push(
      <mark key={k++} className="bg-gold-400/40 text-ink-900 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
    );
    i = idx + query.length;
    idx = lower.indexOf(q, i);
  }
  if (i < text.length) nodes.push(<Fragment key={k++}>{text.slice(i)}</Fragment>);
  return <>{nodes}</>;
}
