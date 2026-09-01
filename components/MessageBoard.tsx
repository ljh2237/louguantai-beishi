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

function MessageItem({
  msg,
  all,
  onReply,
  onDelete,
}: {
  msg: Message;
  all: Message[];
  onReply: (parentId: string) => void;
  onDelete: (id: string) => void;
}) {
  const children = all
    .filter((m) => m.parentId === msg.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="rounded-md border border-ink-200 bg-white/70 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-ink-700">{msg.userName}</span>
        <span className="text-xs text-ink-400">{formatTime(msg.createdAt)}</span>
      </div>
      <p className="mt-1 whitespace-pre-wrap break-words text-ink-800">{msg.content}</p>
      <div className="mt-2 flex gap-3 text-xs text-ink-400">
        <button onClick={() => onReply(msg.id)} className="hover:text-gold-600">
          回复
        </button>
        <button onClick={() => onDelete(msg.id)} className="hover:text-red-600">
          删除
        </button>
      </div>
      {children.length > 0 && (
        <div className="mt-3 ml-4 space-y-2 border-l-2 border-ink-200 pl-3">
          {children.map((c) => (
            <MessageItem key={c.id} msg={c} all={all} onReply={onReply} onDelete={onDelete} />
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
    <div className="space-y-4">
      <div className="rounded-md bg-gold-400/10 px-3 py-2 text-xs text-ink-500">
        当前比赛演示版本的留言数据保存在本机浏览器中，仅供本地查看，不同设备之间不共享。
      </div>

      <form onSubmit={submit} className="space-y-2 rounded-lg border border-ink-200 bg-paper-50 p-4">
        {replyTarget && (
          <div className="flex items-center justify-between rounded bg-ink-100 px-3 py-2 text-sm text-ink-600">
            <span>
              回复：<b>{replyTarget.userName}</b> — {replyTarget.content.slice(0, 30)}
              {replyTarget.content.length > 30 ? "…" : ""}
            </span>
            <button type="button" onClick={() => setReplyingTo(null)} className="text-ink-400 hover:text-red-600">
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
            className="sm:w-48 rounded-md border border-ink-300 bg-white px-3 py-2 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的留言……"
            maxLength={MAX_CONTENT_LEN}
            rows={2}
            className="flex-1 rounded-md border border-ink-300 bg-white px-3 py-2 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-400">
            {content.length}/{MAX_CONTENT_LEN}
          </span>
          <button
            type="submit"
            className="rounded-md bg-ink-700 px-5 py-2 text-paper-50 hover:bg-ink-600 transition-colors"
          >
            发表留言
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {roots.length === 0 ? (
        <p className="py-8 text-center text-ink-400">暂无留言，来发表第一条吧。</p>
      ) : (
        <div className="space-y-3">
          {roots.map((m) => (
            <MessageItem
              key={m.id}
              msg={m}
              all={messages}
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
            className="text-xs text-ink-400 underline underline-offset-2 hover:text-red-600"
          >
            清空本地留言
          </button>
        </div>
      )}
    </div>
  );
}
