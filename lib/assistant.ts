import type { Tablet } from "@/types/tablet";
import { searchTablets } from "@/lib/search";
import { chatCompletion } from "@/lib/llm";

export interface AssistantReply {
  text: string;
  related: Tablet[];
}

// 意图停用词：从问题中剥离，得到用于检索的核心词
const INTENT_STOPWORDS = [
  "有哪些", "有几个", "哪些", "介绍一下", "介绍", "帮我找", "帮我查", "查找", "查询",
  "相关的碑刻", "相关碑刻", "相关的", "是什么", "什么朝代", "哪个朝代", "谁写的",
  "谁书", "谁撰", "撰写", "包含", "出现了", "出现", "主要内容", "内容是什么",
  "碑文", "讲什么", "请", "请问", "一下", "关于", "有没有", "是否存在", "哪块碑",
  "哪块", "碑刻里", "碑里", "几块", "多少", "年份", "年代", "是什么", "什么",
];

const DYNASTY_MAP: Record<string, string> = {
  唐: "唐", 宋: "宋", 元: "元", 明: "明", 清: "清", 隋: "隋",
};

function stripIntent(question: string): string {
  let q = question;
  // 去掉引号/书名号内容保留，其余停用词删除
  for (const w of INTENT_STOPWORDS) {
    q = q.split(w).join(" ");
  }
  return q.replace(/\s+/g, " ").trim();
}

// 找出问题中提到的具体碑刻（按标题最长匹配）
function findTargetTablet(question: string, tablets: Tablet[]): Tablet | undefined {
  let best: Tablet | undefined;
  let bestLen = 0;
  for (const t of tablets) {
    for (const title of [t.title, ...t.alternativeTitles]) {
      if (title.length >= 2 && question.includes(title) && title.length > bestLen) {
        best = t;
        bestLen = title.length;
      }
    }
  }
  return best;
}

// 从问题中检测朝代关键词
function detectDynasty(question: string): string | undefined {
  const m = question.match(/[唐宋元明清隋]/);
  if (m) return DYNASTY_MAP[m[0]];
  return undefined;
}

export function answerQuestion(question: string, tablets: Tablet[]): AssistantReply {
  const q = question.trim();
  if (!q) {
    return { text: "请输入你想了解的问题，例如：“有哪些唐代碑刻？”或“介绍一下大唐宗圣观记”。", related: [] };
  }

  // 1) 具体碑刻提问
  const target = findTargetTablet(q, tablets);
  if (target) {
    const isDynastyAsk = /朝代|年代|什么朝|年份/.test(q);
    const isAuthorAsk = /谁写|谁书|谁撰|撰写|书写人|作者|何人/.test(q);
    const isIntroAsk = /介绍|是什么|讲什么|内容|碑文|主要/.test(q) || (!isDynastyAsk && !isAuthorAsk);

    const parts: string[] = [];
    if (isIntroAsk) {
      const intro = target.introduction || target.inscription.fullText.slice(0, 160);
      parts.push(`《${target.title}》${target.dynasty ? "（" + target.dynasty + "）" : ""}：${intro}${intro.length > 160 ? "…" : ""}`);
    }
    if (isDynastyAsk || isIntroAsk) {
      if (target.dynasty) parts.push(`其朝代可标为「${target.dynasty}」。`);
      else parts.push(`当前收录资料中未直接标注《${target.title}》的朝代。`);
    }
    if (isAuthorAsk) {
      const people = [
        target.author && `撰文：${target.author}`,
        target.calligrapher && `书写：${target.calligrapher}`,
        target.engraver && `篆刻：${target.engraver}`,
      ].filter(Boolean);
      if (people.length) parts.push(`相关人物——${people.join("；")}。`);
      else parts.push(`当前收录资料中未单独标注《${target.title}》的撰文/书写人，详情请查阅碑文原文。`);
    }
    return {
      text: parts.join("\n") || `《${target.title}》已收录，可在详情页查看碑文全文与图片。`,
      related: [target],
    };
  }

  // 2) 朝代筛选提问
  const dynasty = detectDynasty(q);
  if (dynasty && /有哪些|几个|几块|多少|碑刻|有哪些.*代|代.*碑刻/.test(q)) {
    const matched = tablets.filter((t) => t.dynasty === dynasty);
    if (matched.length === 0) {
      return { text: `当前收录资料中没有找到明确标注为「${dynasty}」的碑刻。`, related: [] };
    }
    const names = matched.slice(0, 8).map((t) => `《${t.title}》`).join("、");
    const more = matched.length > 8 ? ` 等共 ${matched.length} 块` : `，共 ${matched.length} 块`;
    return {
      text: `当前收录的「${dynasty}」碑刻有${more}：${names}。`,
      related: matched,
    };
  }

  // 3) 通用全文检索
  const core = stripIntent(q);
  if (!core || core.length < 2) {
    return { text: "当前收录资料中没有找到足够信息。可尝试输入碑名、朝代、人物或碑文中的关键词。", related: [] };
  }

  const results = searchTablets(core, [], tablets);
  if (results.length === 0) {
    return { text: "当前收录资料中没有找到与你的问题相关的碑刻信息。", related: [] };
  }

  const top = results.slice(0, 5);
  const lines = top.map((r) => {
    const snip = r.snippets[0];
    const ctx = snip ? `：……${snip.before}${snip.match}${snip.after}……` : "";
    return `《${r.tablet.title}》${r.tablet.dynasty ? "（" + r.tablet.dynasty + "）" : ""}${ctx}`;
  });
  const text = `根据本地碑刻资料，找到 ${results.length} 条相关结果，例如：\n${lines.join("\n")}`;
  return { text, related: top.map((r) => r.tablet) };
}

// ============ 大模型增强模式（RAG） ============
// 先本地检索碑刻资料，把检索结果作为 context 发给大模型，
// 禁止大模型凭自身知识编造历史信息。

export function buildRagContext(
  question: string,
  tablets: Tablet[]
): { context: string; related: Tablet[] } {
  const results = searchTablets(question, [], tablets);
  const top = results.slice(0, 6);
  const related = top.map((r) => r.tablet);

  let context = "";
  for (const r of top) {
    const t = r.tablet;
    context += `《${t.title}》${t.dynasty ? `（${t.dynasty}）` : ""}\n`;
    if (t.dateText) context += `年代：${t.dateText}\n`;
    if (t.introduction) context += `简介：${t.introduction}\n`;
    const ft = t.inscription.fullText || "";
    if (ft) context += `碑文摘录：${ft.slice(0, 900)}\n`;
    context += "\n";
  }

  // 检索不到具体碑刻时，兜底提供碑名清单
  if (!context) {
    context =
      "当前收录碑刻清单：\n" +
      tablets.map((t) => `${t.title}${t.dynasty ? `（${t.dynasty}）` : ""}`).join("、") +
      "\n";
  }
  return { context, related };
}

const SYSTEM_PROMPT =
  "你是「楼观台碑刻数字平台」的智能助手。你只能根据下面提供的楼观台碑刻资料回答用户问题。" +
  "规则：1) 只能使用提供的资料，不得编造资料中没有的历史信息；" +
  "2) 资料中没有的信息，必须明确说明「当前收录资料中没有找到相关信息」；" +
  "3) 用简体中文，回答简洁、准确、有条理。";

export async function answerQuestionWithLLM(
  question: string,
  tablets: Tablet[]
): Promise<AssistantReply> {
  const { context, related } = buildRagContext(question, tablets);
  const user = `【楼观台碑刻资料】\n${context}\n【用户问题】\n${question}`;
  const text = await chatCompletion([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: user },
  ]);
  return { text: text || "（模型未返回内容，请重试）", related };
}
