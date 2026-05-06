import { NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 20;

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `你是一个日程解析助手。用户会输入一段自然语言描述的日程信息，你需要提取并返回纯 JSON，不要有任何多余文字。格式如下：
{"title":"事件名称","date":"YYYY-MM-DD","time":"HH:MM","location":"地点，没有则为空字符串","note":"备注，没有则为空字符串"}
如果无法识别日期，date 返回今天日期。如果无法识别时间，time 返回空字符串。`;

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
            content: SYSTEM_PROMPT,
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

    // 确保必要字段存在
    const result = {
      title: typeof parsed.title === "string" ? parsed.title : "未命名日程",
      date: typeof parsed.date === "string" ? parsed.date : new Date().toISOString().split("T")[0],
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