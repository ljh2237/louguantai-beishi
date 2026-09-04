"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Tablet } from "@/types/tablet";
import { answerQuestion, answerQuestionWithLLM, AssistantReply } from "@/lib/assistant";
import { getBasePath } from "@/lib/base-path";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  related: Tablet[];
  mode?: "llm" | "local";
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [tablets, setTablets] = useState<Tablet[] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (tablets) return;
    (async () => {
      try {
        const res = await fetch(getBasePath("/data/tablets.json"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Tablet[] = await res.json();
        setTablets(data);
      } catch {
        setLoadError("碑刻资料加载失败，请刷新页面重试。");
      }
    })();
  }, [open, tablets]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q, related: [] }]);
    setLoading(true);

    let reply: AssistantReply;
    let mode: "llm" | "local" = "llm";
    if (!tablets) {
      reply = { text: "碑刻资料尚未加载完成，请稍候再试。", related: [] };
      mode = "local";
    } else {
      try {
        reply = await answerQuestionWithLLM(q, tablets);
      } catch {
        reply = answerQuestion(q, tablets);
        mode = "local";
      }
    }
    setMessages((prev) => [...prev, { role: "assistant", text: reply.text, related: reply.related, mode }]);
    setLoading(false);
  };

  const quickPrompts = [
    "有哪些唐代碑刻？",
    "介绍一下大唐宗圣观记",
    "赵孟頫相关的碑刻有哪些？",
    "哪块碑里出现了楼观？",
  ];

  return (
    <>
      {/* 朱砂方形「问碑」印章按钮 */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-sm bg-cinnabar text-paper-light shadow-lift transition-colors hover:bg-cinnabar-dark"
        aria-label="智能碑刻助手"
        aria-expanded={open}
      >
        {open ? (
          <span className="text-xl leading-none">✕</span>
        ) : (
          <span className="flex flex-col items-center font-serif text-base leading-tight">
            <span>问</span>
            <span>碑</span>
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-[84px] right-5 z-40 flex h-[560px] max-h-[78vh] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-md border border-ink-200 bg-paper-light shadow-lift">
          <div className="flex items-center justify-between border-b border-ink-200 bg-paper-100 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-cinnabar font-serif text-base text-paper-light">
                问
              </span>
              <div className="leading-tight">
                <h3 className="font-serif text-base text-ink-900">问碑</h3>
                <p className="text-xs text-ink-400">楼观台碑刻智能检索助手</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-sm px-2 py-1 text-ink-400 transition-colors hover:text-cinnabar-dark"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-ink-500">可以这样问我：</p>
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => setInput(p)}
                    className="block w-full rounded-md border border-ink-200 bg-paper-100 px-3 py-2 text-left text-sm text-ink-600 transition-colors hover:border-cinnabar/40 hover:text-cinnabar-dark"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {loadError && <p className="text-sm text-cinnabar-dark">{loadError}</p>}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className="max-w-[85%]">
                  <div
                    className={`whitespace-pre-wrap rounded-md px-3 py-2 text-left text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-ink-100 text-ink-800"
                        : "border-l-2 border-cinnabar bg-paper-100 text-ink-800"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.mode === "local" && (
                    <div className="mt-1 text-left text-[11px] text-ink-400">
                      （大模型暂不可用，已用本地资料库回答）
                    </div>
                  )}
                  {m.related.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.related.slice(0, 4).map((t) => (
                        <Link
                          key={t.id}
                          href={`/tablets/${t.slug}`}
                          className="rounded-sm border border-cinnabar/30 px-2 py-0.5 text-xs text-cinnabar-dark transition-colors hover:bg-cinnabar/5"
                        >
                          《{t.title}》→
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && <p className="text-sm text-ink-400">正在思考……</p>}
          </div>

          <div className="border-t border-ink-200 bg-paper-100 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入问题……"
                className="min-w-0 flex-1 rounded-md border border-ink-300 bg-paper-light px-3 py-2 text-sm text-ink-800 transition-colors focus:border-cinnabar focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-cinnabar px-4 py-2 text-sm text-paper-light transition-colors hover:bg-cinnabar-dark disabled:opacity-50"
              >
                发送
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
