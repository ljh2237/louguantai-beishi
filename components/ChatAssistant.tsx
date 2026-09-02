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
      // 优先大模型增强（先本地检索，再把资料作为 context 发给 Qwen）
      try {
        reply = await answerQuestionWithLLM(q, tablets);
      } catch {
        // 大模型不可用时回退到本地知识库模式
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
      {/* 浮动按钮 */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink-700 text-paper-50 shadow-lg shadow-ink-900/30 transition hover:bg-ink-600"
        aria-label="智能碑刻助手"
      >
        {open ? (
          <span className="text-2xl leading-none">✕</span>
        ) : (
          <span className="text-xl font-serif">碑</span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[70vh] max-h-[560px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-ink-300 bg-paper-50 shadow-2xl">
          <div className="flex items-center justify-between border-b border-ink-200 bg-paper-100 px-4 py-3">
            <div>
              <h3 className="font-serif text-ink-800">智能碑刻助手</h3>
              <p className="text-xs text-ink-400">本地资料 + 大模型增强</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-ink-500 hover:text-ink-800" aria-label="关闭">
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-ink-500">可以这样问我：</p>
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setInput(p);
                    }}
                    className="block w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-left text-sm text-ink-600 hover:border-gold-500"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {loadError && <p className="text-sm text-red-600">{loadError}</p>}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div
                  className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-left text-sm ${
                    m.role === "user"
                      ? "bg-ink-700 text-paper-50"
                      : "bg-white border border-ink-200 text-ink-800"
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
                        className="rounded bg-gold-400/20 px-2 py-1 text-xs text-gold-600 hover:underline"
                      >
                        《{t.title}》→
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && <p className="text-sm text-ink-400">正在思考……</p>}
          </div>

          <div className="border-t border-ink-200 bg-paper-50 p-3">
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
                className="flex-1 rounded-md border border-ink-300 bg-white px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-ink-700 px-4 py-2 text-sm text-paper-50 hover:bg-ink-600 disabled:opacity-50"
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
