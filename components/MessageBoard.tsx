"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Message,
  addMessage,
  clearMessages,
  deleteMessage,
  getMessages,
  MAX_CONTENT_LEN,
  MAX_NAME_LEN,
} from "@/lib/messages";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// 回复缩进最多到第 2 层，避免无限右缩
function MessageItem({
  msg,
  all,
  depth,
  onReply,
  onDelete,
}: {
  msg: Message;
  all: Message[];
  depth: number;
  onReply: (parentId: string) => void;
  onDelete: (id: string) => void;
}) {
  const children = all
    .filter((m) => m.parentId === msg.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div>
      <div className="rounded-md border border-ink-200 bg-paper-light p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm tracking-[0.05em] text-cinnabar-dark">{msg.userName}</span>
          <span className="shrink-0 text-xs text-ink-400">{formatTime(msg.createdAt)}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-ink-700">
          {msg.content}
        </p>
        <div className="mt-3 flex gap-4 border-t border-ink-100 pt-2 text-xs text-ink-400">
          <button onClick={() => onReply(msg.id)} className="transition-colors hover:text-cinnabar-dark">
            回复
          </button>
          <button onClick={() => onDelete(msg.id)} className="transition-colors hover:text-cinnabar-dark">
            删除
          </button>
        </div>
      </div>

      {children.length > 0 && (
        <div
          className={`mt-3 space-y-3 border-l border-ink-300 ${depth < 2 ? "ml-5 pl-4" : "ml-3 pl-2"}`}
        >
          {children.map((c) => (
            <MessageItem
              key={c.id}
              msg={c}
              all={all}
              depth={depth + 1}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MessageBoard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessages(getMessages());
  }, []);

  const refresh = useCallback(() => setMessages(getMessages()), []);

  const roots = useMemo(
    () =>
      messages
        .filter((m) => m.parentId === null)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages]
  );

  const replyTarget = replyingTo ? messages.find((m) => m.id === replyingTo) : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = addMessage(name, content, replyingTo);
    if (!res.ok) {
      setError(res.error || "提交失败");
      return;
    }
    setContent("");
    setReplyingTo(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("确定删除这条留言吗？")) {
      deleteMessage(id);
      refresh();
    }
  };

  const handleClear = () => {
    if (window.confirm("确定清空本机浏览器保存的所有留言吗？此操作不可恢复。")) {
      clearMessages();
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-note rounded-md border border-bronze/30 bg-bronze/10 px-4 py-2.5 text-sm text-ink-500">
        当前比赛演示版本的留言数据保存在本机浏览器中，仅供本地查看，不同设备之间不共享。
      </p>

      <form
        onSubmit={submit}
        className="space-y-3 rounded-md border border-ink-200 bg-paper-light p-4"
      >
        {replyTarget && (
          <div className="flex items-center justify-between rounded-sm bg-paper-deep px-3 py-2 text-sm text-ink-600">
            <span>
              回复：<b className="text-cinnabar-dark">{replyTarget.userName}</b> —{" "}
              {replyTarget.content.slice(0, 30)}
              {replyTarget.content.length > 30 ? "…" : ""}
            </span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-ink-400 transition-colors hover:text-cinnabar-dark"
            >
              取消
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`姓名（可选，最多${MAX_NAME_LEN}字）`}
            maxLength={MAX_NAME_LEN}
            className="rounded-md border border-ink-300 bg-paper-100 px-3 py-2.5 text-ink-800 placeholder:text-ink-400 transition-colors focus:border-cinnabar focus:outline-none sm:w-48"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的留言……"
            maxLength={MAX_CONTENT_LEN}
            rows={2}
            className="flex-1 resize-y rounded-md border border-ink-300 bg-paper-100 px-3 py-2.5 text-ink-800 placeholder:text-ink-400 transition-colors focus:border-cinnabar focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-400">
            {content.length}/{MAX_CONTENT_LEN}
          </span>
          <button
            type="submit"
            className="rounded-md bg-cinnabar px-6 py-2 text-paper-light transition-colors hover:bg-cinnabar-dark"
          >
            发表留言
          </button>
        </div>
        {error && <p className="text-sm text-cinnabar-dark">{error}</p>}
      </form>

      {roots.length === 0 ? (
        <p className="py-12 text-center text-ink-400">暂无留言，来发表第一条吧。</p>
      ) : (
        <div className="space-y-4">
          {roots.map((m) => (
            <MessageItem
              key={m.id}
              msg={m}
              all={messages}
              depth={0}
              onReply={(id) => setReplyingTo(id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div className="text-right">
          <button
            onClick={handleClear}
            className="text-xs text-ink-400 underline underline-offset-4 transition-colors hover:text-cinnabar-dark"
          >
            清空本地留言
          </button>
        </div>
      )}
    </div>
  );
}
