// ─────────────────────────────────────────────────────
// Semantic Rewriter Engine
// 根据用户选择的 AI 助理人格，对行政通知进行语境改写
// ─────────────────────────────────────────────────────
import type { PersonalityId } from "@/src/store/aiAssistantStore";

// ── Types ──────────────────────────────────────────────
export interface RewriteResult {
  /** 性格化改写后的文案 */
  rewritten: string;
  /** 原始通知文本（保留用于 [查阅原文] 锚点） */
  original: string;
  /** 是否触发了行政熔断 */
  triggeredCircuitBreaker: boolean;
  /** 若触发熔断，提取的关键原始信息 */
  criticalInfo: string;
}

// ── 行政熔断关键词 ─────────────────────────────────────
const CIRCUIT_BREAKER_KEYWORDS = [
  "钱",
  "缴费",
  "考试",
  "学分",
  "补考",
  "重修",
  "处分",
  "开除",
  "警告",
  "退学",
  "学费",
  "罚款",
  "违纪",
  "挂科",
  "绩点",
];

// ── 语气词库（按人格） ─────────────────────────────────
const TONE_SARCASTIC = [
  "哇哦～又到了",
  "恭喜恭喜！",
  "喜大普奔！",
  "注意了注意了～",
];

const TONE_SLACKER = [
  "辅导员又催了…",
  "虽然我也没弄，但",
  "偷偷告诉你，",
  "啧，又来活了…",
];

// ── 行政熔断检查 ──────────────────────────────────────
function checkCircuitBreaker(raw: string): {
  triggered: boolean;
  criticalInfo: string;
} {
  const matchedKeywords: string[] = [];
  for (const kw of CIRCUIT_BREAKER_KEYWORDS) {
    if (raw.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  if (matchedKeywords.length > 0) {
    // 提取时间+金额+关键信息
    const timeMatch = raw.match(
      /(\d{1,2}点前?|\d{1,2}:\d{2}|今天|明天|本周|下周[一二三四五六日天])/g,
    );
    const moneyMatch = raw.match(/(\d+[\d,]*\.?\d*\s*元?)/g);
    const deadlineMatch = raw.match(/截止[：:]\s*\S+/);

    const parts: string[] = [];
    if (timeMatch) parts.push(`⏰ ${timeMatch.join(" ")}`);
    if (moneyMatch) parts.push(`💰 ${moneyMatch.join(" ")}`);
    if (deadlineMatch) parts.push(`📋 ${deadlineMatch[0]}`);

    let criticalInfo =
      parts.length > 0 ? parts.join(" · ") : raw.slice(0, 60) + (raw.length > 60 ? "..." : "");

    return { triggered: true, criticalInfo };
  }

  return { triggered: false, criticalInfo: "" };
}

// ── 核心改写函数 ──────────────────────────────────────
export function rewriteSummary(
  rawNotice: string,
  personality: PersonalityId,
  preferences?: string,
): RewriteResult {
  const prefs = preferences?.trim() ?? "";

  // Remove common noise
  const cleaned = rawNotice
    .replace(/【.*?】/g, "")
    .replace(/各位同学[，,]?\s*/g, "")
    .replace(/请注意[：:]\s*/g, "")
    .trim();

  let rewritten = "";

  switch (personality) {
    case "efficiency": {
      // 冷面效率：输出完整短句，禁止断句为"提交。快。"，使用"需在 X 前 + 动作"格式
      // Extract deadline / time
      const deadlineMatch = cleaned.match(
        /(?:截止[：:]\s*)?(\d{1,2}[:：]\d{2}|\d{1,2}点前?|今天|明天|本周[一二三四五六日天])/g,
      );
      // Extract place
      const placeMatch = cleaned.match(
        /([\u4e00-\u9fa5]{2,}(?:楼|教室|办公室|食堂|图书馆|体育馆|报告厅|中心|广场|大厅))/,
      );
      // Extract action phrase (verb + key object)
      const actionMatch = cleaned.match(
        /(缴[费纳交款].{0,10}|提[交].{0,10}|填[写报].{0,10}|确[认].{0,10}|完[成].{0,10}|参[加与].{0,10}|领[取].{0,10}|登[记].{0,10}|选[课].{0,10}|报[到告名].{0,10})/,
      );

      const timeStr = deadlineMatch ? deadlineMatch.join(" ") : "";
      const placeStr = placeMatch ? placeMatch[1] : "";
      const actionStr = actionMatch ? actionMatch[0].trim() : cleaned.slice(0, 24);

      // Build a natural complete sentence
      if (timeStr && actionStr) {
        rewritten = `需在 ${timeStr} 之前${actionStr}${placeStr ? `，地点：${placeStr}` : ""}`;
      } else if (actionStr) {
        rewritten = `请尽快${actionStr}${placeStr ? `，地点：${placeStr}` : ""}`;
      } else {
        rewritten = cleaned.length > 20 ? cleaned.slice(0, 24) + "…" : cleaned;
      }
      break;
    }

    case "slacker": {
      // 摸鱼派：加入同理心吐槽，用"兄弟/宝"开头，语气舒缓
      const prefix = prefs || "兄弟";
      const tone = TONE_SLACKER[Math.floor(Math.random() * TONE_SLACKER.length)];
      rewritten = `${prefix}，${tone} ${cleaned}。慢慢来，不急～🥱`;
      break;
    }

    case "sarcastic": {
      // 乐子人：加入阴阳怪气或互联网梗，解构行政压力
      const tone = TONE_SARCASTIC[Math.floor(Math.random() * TONE_SARCASTIC.length)];
      const parts = cleaned.split(/[。！，,]/).filter((p) => p.trim().length > 0);
      if (parts.length >= 2) {
        rewritten = `${tone}${parts[0]}呢！${parts.slice(1).join("，")}～你猜还有谁没交？😏`;
      } else {
        rewritten = `注意了注意了～${cleaned}～你猜还有谁没交？😏`;
      }
      break;
    }

    case "custom": {
      // 自定义：使用 preferences 注入口吻
      if (!prefs) {
        // fallback to efficiency
        return rewriteSummary(rawNotice, "efficiency", "");
      }
      rewritten = `[${prefs} 口吻] ${cleaned}${cleaned ? "，记得处理～" : ""}`;
      break;
    }

    default:
      rewritten = cleaned;
  }

  // ── 行政熔断：原始文案含关键词，在改写文案下方另起一行备注原始核心要素 ──
  const circuitResult = checkCircuitBreaker(rawNotice);
  if (circuitResult.triggered && rewritten) {
    rewritten = `${rewritten}\n⚠️ 行政熔断 · 原始要素：${circuitResult.criticalInfo}`;
  }

  return {
    rewritten,
    original: rawNotice,
    triggeredCircuitBreaker: circuitResult.triggered,
    criticalInfo: circuitResult.criticalInfo,
  };
}

// ── 批量：从多个任务生成今日行政摘要 ─────────────────
export function generateDailySummary(
  tasks: Array<{ title: string; status: string; deadline?: string }>,
  personality: PersonalityId,
  preferences?: string,
): RewriteResult {
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  if (pendingTasks.length === 0) {
    return {
      rewritten: "今天没有待办事项，摸一会儿鱼吧～🎉",
      original: "",
      triggeredCircuitBreaker: false,
      criticalInfo: "",
    };
  }

  // Use the highest priority / first pending task as primary
  const primary = pendingTasks[0];
  const noticeText = primary.deadline
    ? `${primary.title}，截止 ${primary.deadline}`
    : primary.title;

  // Append count info
  const fullNotice =
    pendingTasks.length > 1
      ? `${noticeText}（还有${pendingTasks.length - 1}项其他待办）`
      : noticeText;

  return rewriteSummary(fullNotice, personality, preferences);
}