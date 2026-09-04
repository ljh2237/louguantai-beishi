// 大模型模式：直接调用阿里云百炼（DashScope）Qwen 大模型
//
// 阿里云百炼的「兼容模式」端点（/compatible-mode/v1）本身支持浏览器跨域
// （Access-Control-Allow-Origin: *）且国内直连可达，因此前端直接调用，
// 不再经过中间代理层（原 Cloudflare Worker 的 *.workers.dev 从国内不可达，
// 是此前「大模型暂不可用」的根本原因）。直连可保证稳定可用。
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const LLM_CONFIG = {
  // 阿里云百炼（DashScope）兼容 OpenAI 端点
  baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  model: "qwen3.6-flash",
  apiKey:
    "sk-ws-H.EYMEMLE.xa8J.MEUCIHIBm21lxfZCyVG24X_hGLjxcKAYoeEosm-7RG5_u6suAiEAsglhtXJbGHlaY7u03rG3E4fYKw6dx3I19HME_RfIn-k",
};

export async function chatCompletion(
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  // 30 秒超时（模型生成留足时间）
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

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
