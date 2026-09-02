// 可选大模型模式：接入 Qwen（阿里云百炼 OpenAI 兼容接口）
//
// ⚠️ 安全说明：本阶段为比赛演示，按项目要求直接在前端调用大模型，
// 因此 API Key 会出现在前端源码与公开仓库中（已获授权）。
// 生产环境应将密钥移到安全的后端代理服务，前端只调用代理。
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const LLM_CONFIG = {
  baseUrl: "https://ws-ib6pqmfegl5pfe3s.cn-beijing.maas.aliyuncs.com/compatible-mode/v1",
  apiKey:
    "sk-ws-H.EYMEMLE.xa8J.MEUCIHIBm21lxfZCyVG24X_hGLjxcKAYoeEosm-7RG5_u6suAiEAsglhtXJbGHlaY7u03rG3E4fYKw6dx3I19HME_RfIn-k",
  model: "qwen3.6-flash",
};

export async function chatCompletion(
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  // 20 秒超时，避免请求挂起导致界面一直「思考中」
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`${LLM_CONFIG.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LLM_CONFIG.apiKey}`,
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
