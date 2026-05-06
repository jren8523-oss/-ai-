import { NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 20;

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

function buildTimeAwareSystemPrompt(): string {
  const now = new Date();
  const currentDate = now.toLocaleDateString('zh-CN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const currentYear = now.getFullYear();

  return `你是一个日程解析助手。用户会输入一段自然语言描述的日程信息，你需要提取并返回纯 JSON，不要有任何多余文字。格式如下：
{"title":"事件名称","date":"YYYY-MM-DD","time":"HH:MM","location":"地点，没有则为空字符串","note":"备注，没有则为空字符串"}

【关键时间基准】当前真实的系统时间是：${currentDate}。当前年份是 ${currentYear} 年。
当用户输入"明天"、"下周三"、"后天"、"下周X"、"周X"等相对时间时，你必须严格以此时间为基准进行推算。
年份默认使用当前年份（${currentYear}），严禁输出历史年份（如 2025 年、2024 年等）。
如果无法识别日期，date 返回 ${now.toISOString().split('T')[0]}（即当前日期）。
如果无法识别时间，time 返回空字符串。`;
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "请输入日程描述文字" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY is not configured on the server." },
        { status: 401 }
      );
    }

    const systemPrompt = buildTimeAwareSystemPrompt();

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: text.trim(),
          },
        ],
        stream: false,
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI 服务返回错误，请稍后重试" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawContent: string = data.choices?.[0]?.message?.content || "";

    // 尝试提取 JSON（防止 AI 返回了多余文字）
    let parsed;
    try {
      // 先尝试直接解析
      parsed = JSON.parse(rawContent.trim());
    } catch {
      // 尝试从文本中提取 JSON 对象
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { error: "AI 解析失败，请重新描述" },
            { status: 422 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "AI 解析失败，请重新描述" },
          { status: 422 }
        );
      }
    }

    // ── 日期校验与修正 ──────────────────────────────
    const now = new Date();
    const currentYear = now.getFullYear();
    const todayStr = now.toISOString().split("T")[0];

    let rawDate: string = typeof parsed.date === "string" ? parsed.date : "";
    let validatedDate = todayStr;

    // 尝试解析并修正 YYYY-MM-DD 格式
    const dateMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateMatch) {
      let year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10);
      const day = parseInt(dateMatch[3], 10);

      // 年份修正：如果 AI 返回了历史年份（如 2025、2024），修正为当前年份
      if (year < currentYear) {
        console.warn(`[parse-schedule] AI returned historical year ${year}, correcting to ${currentYear}`);
        year = currentYear;
      }

      // 验证日期有效性
      const d = new Date(year, month - 1, day);
      if (
        d.getFullYear() === year &&
        d.getMonth() === month - 1 &&
        d.getDate() === day
      ) {
        validatedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else {
        console.warn(`[parse-schedule] Invalid date from AI: ${rawDate}, falling back to today`);
      }
    } else if (rawDate) {
      // 非标准格式，尝试正则宽松提取
      const looseMatch = rawDate.match(/(\d{4})[年-](\d{1,2})[月-](\d{1,2})/);
      if (looseMatch) {
        let year = parseInt(looseMatch[1], 10);
        const month = parseInt(looseMatch[2], 10);
        const day = parseInt(looseMatch[3], 10);
        if (year < currentYear) {
          year = currentYear;
        }
        const d = new Date(year, month - 1, day);
        if (
          d.getFullYear() === year &&
          d.getMonth() === month - 1 &&
          d.getDate() === day
        ) {
          validatedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      } else {
        console.warn(`[parse-schedule] Non-standard date format from AI: ${rawDate}, falling back to today`);
      }
    }

    // 确保必要字段存在
    const result = {
      title: typeof parsed.title === "string" ? parsed.title : "未命名日程",
      date: validatedDate,
      time: typeof parsed.time === "string" ? parsed.time : "",
      location: typeof parsed.location === "string" ? parsed.location : "",
      note: typeof parsed.note === "string" ? parsed.note : "",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Parse schedule error:", error);
    return NextResponse.json(
      { error: "解析服务异常，请稍后重试" },
      { status: 500 }
    );
  }
}
