import { NextResponse } from "next/server";
import { orgContextMap } from "@/src/lib/mockData";
import {
  parseUIRequest,
  stripUIRequestBlocks,
  buildCompleteSystemPrompt,
} from "@/src/lib/uiRequestProtocol";

export const runtime = "edge";
export const maxDuration = 25;

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const { message, contextTitle } = await req.json();

    // ── Legacy fallback: replyLogic (hardcoded pattern match) ──
    // This is kept as a safety net for environments without DEEPSEEK_API_KEY.
    // The primary path is now AI-driven ui-request protocol below.
    const context = orgContextMap[contextTitle];
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      // No API key — fall back to replyLogic only
      if (context?.replyLogic) {
        const logicResult = context.replyLogic(message);
        if (typeof logicResult === "object" && "type" in logicResult) {
          return NextResponse.json({
            reply: logicResult.content || "",
            type: logicResult.type,
            uiRequest: null,
          });
        }
      }
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY is not configured on the server." },
        { status: 401 }
      );
    }

    // ── Primary path: AI-driven with ui-request protocol ──
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
            content: buildCompleteSystemPrompt(contextTitle),
          },
          {
            role: "user",
            content: message,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI service returned an error." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawReply: string = data.choices?.[0]?.message?.content || "";

    // Parse ui-request block from AI output
    let uiRequest = parseUIRequest(rawReply);

    // Backend-level safeguard: block ui-request for homework-related queries
    const homeworkKeywords = ["收作业", "交作业", "催作业", "查作业", "功课", "提交作业", "作业提醒"];
    if (uiRequest && homeworkKeywords.some((kw) => message.includes(kw))) {
      console.warn(
        "[chat-route] 拦截作业场景下的 ui-request 生成:",
        uiRequest.props?.type,
        "→ 降级为纯文本",
      );
      uiRequest = null;
    }

    // Strip ui-request block from user-visible reply
    const reply = stripUIRequestBlocks(rawReply);

    // Determine type for frontend rendering
    const type = uiRequest ? "ui-card" : "text";

    return NextResponse.json({ reply, type, uiRequest });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response." },
      { status: 500 }
    );
  }
}
