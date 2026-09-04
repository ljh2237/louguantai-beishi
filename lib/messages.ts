// 留言本地持久化（GitHub Pages 静态站无后端，使用浏览器 localStorage）
export interface Message {
  id: string;
  userName: string;
  content: string;
  createdAt: string;
  parentId: string | null;
}

const STORAGE_KEY = "louguantai-messages-v1";

export const MAX_NAME_LEN = 20;
export const MAX_CONTENT_LEN = 500;

function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

function readAll(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(messages: Message[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function getMessages(): Message[] {
  return readAll().sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function addMessage(
  userName: string,
  content: string,
  parentId: string | null = null
): { ok: boolean; error?: string; message?: Message } {
  const name = userName.trim().slice(0, MAX_NAME_LEN) || "佚名";
  const body = content.trim();
  if (!body) return { ok: false, error: "留言内容不能为空" };
  if (body.length > MAX_CONTENT_LEN) {
    return { ok: false, error: `留言内容不能超过 ${MAX_CONTENT_LEN} 字` };
  }
  const msg: Message = {
    id: genId(),
    userName: name,
    content: body.slice(0, MAX_CONTENT_LEN),
    createdAt: new Date().toISOString(),
    parentId,
  };
  const all = readAll();
  all.push(msg);
  writeAll(all);
  return { ok: true, message: msg };
}

export function deleteMessage(id: string): void {
  const all = readAll().filter((m) => m.id !== id);
  writeAll(all);
}

export function clearMessages(): void {
  writeAll([]);
}
