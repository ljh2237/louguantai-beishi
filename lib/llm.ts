// 大模型模式：通过 Cloudflare Worker 后端代理调用 Qwen（阿里云百炼）
//
// 前端调用 Cloudflare Worker（海外服务，走用户代理可访问），
// Worker 再转发到阿里云百炼。API Key 只保存在 Worker 服务端，前端不暴露。
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const LLM_CONFIG = {
  // Cloudflare Worker 代理地址（Qwen API Key 在 Worker 端，不在此处）
  baseUrl: "https://louguantai-beishi-proxy.jinghanliu2237.workers.dev",
  model: "qwen3.6-flash",
};

export async function chatCompletion(
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  // 30 秒超时（多一层 Worker 转发 + 模型生成，留足时间）
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${LLM_CONFIG.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: LLM_CONFIG.model,
        messages,
        temperature: opts?.temperature ?? 0.3,
        max_tokens: opts?.maxTokens ?? 1024,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`LLM 请求失败（HTTP ${res.status}）：${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const msg = data?.choices?.[0]?.message;
    let content: string = msg?.content ?? "";
    // Qwen3 思考模型在极少数情况下 content 为空、仅有 reasoning_content，兜底处理
    if (!content && msg?.reasoning_content) {
      content = msg.reasoning_content;
    }
    return content.trim();
  } finally {
    clearTimeout(timer);
  }
}
