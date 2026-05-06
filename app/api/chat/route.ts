import { NextResponse } from "next/server";
import { orgContextMap } from "@/src/lib/mockData";
import {
  parseUIRequest,
  stripUIRequestBlocks,
  buildCompleteSystemPrompt as buildLegacySystemPrompt,
} from "@/src/lib/uiRequestProtocol";
import {
  parseTaskAction,
  stripTaskAction,
  buildCompleteSystemPrompt as buildTaskSystemPrompt,
} from "@/src/lib/taskProtocol";
import { addTask } from "@/src/lib/taskStore";
import type { TaskActionType, TaskData } from "@/src/lib/taskProtocol";

export const runtime = "edge";
export const maxDuration = 25;

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const { message, contextTitle, role } = await req.json();

    // ── Legacy fallback: replyLogic (hardcoded pattern match) ──
    const context = orgContextMap[contextTitle];
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      if (context?.replyLogic) {
        const logicResult = context.replyLogic(message);
        if (typeof logicResult === "object" && "type" in logicResult) {
          return NextResponse.json({
            reply: logicResult.content || "",
            type: logicResult.type,
            uiRequest: null,
            taskAction: null,
          });
        }
      }
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY is not configured on the server." },
        { status: 401 }
      );
    }

    // ── Primary path: AI-driven ──
    // For "我的班级" and role=班委, use the new task protocol
    const isClassLeader = contextTitle === "我的班级" && role === "班委";
    const systemPrompt = isClassLeader
      ? buildTaskSystemPrompt()
      : buildLegacySystemPrompt(contextTitle);

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

    // ── Try task protocol first (new) ──
    let taskAction = null;
    let reply = rawReply;
    let type: string = "text";
    let uiRequest = null;

    if (isClassLeader) {
      taskAction = parseTaskAction(rawReply);
      if (taskAction) {
        // AI returned a task action JSON — store the task server-side
        const task = addTask(taskAction.type, taskAction.data as TaskData);
        reply = stripTaskAction(rawReply) || `✅ 已发布「${taskAction.type}」任务卡片，全班同学可查看并参与。`;
        type = "task-card";
        // Include task in response so frontend can render card
        return NextResponse.json({
          reply,
          type,
          taskAction,
          task: { id: task.id, type: task.type, data: task.data, createdAt: task.createdAt },
          uiRequest: null,
        });
      }
    }

    // ── Fallback: legacy ui-request protocol ──
    uiRequest = parseUIRequest(rawReply);

    const homeworkKeywords = ["收作业", "交作业", "催作业", "查作业", "功课", "提交作业", "作业提醒"];
    if (uiRequest && homeworkKeywords.some((kw) => message.includes(kw))) {
      console.warn(
        "[chat-route] 拦截作业场景下的 ui-request 生成:",
        uiRequest.props?.type,
        "→ 降级为纯文本",
      );
      uiRequest = null;
    }

    reply = stripUIRequestBlocks(rawReply);
    type = uiRequest ? "ui-card" : "text";

    return NextResponse.json({ reply, type, uiRequest, taskAction: null });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response." },
      { status: 500 }
    );
  }
}
