"use client";

import { Fragment, type ReactNode } from "react";

// 安全关键词高亮：古籍批注风格（朱砂半透明底 + 朱砂深色 + 1px 底边）
// 使用 React 默认转义，不使用 dangerouslySetInnerHTML
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
      <mark
        key={k++}
        className="rounded-[2px] border-b border-cinnabar/40 bg-cinnabar/10 px-[2px] text-cinnabar-dark"
      >
        {text.slice(idx, idx + query.length)}
      </mark>
    );
    i = idx + query.length;
    idx = lower.indexOf(q, i);
  }
  if (i < text.length) nodes.push(<Fragment key={k++}>{text.slice(i)}</Fragment>);
  return <>{nodes}</>;
}
