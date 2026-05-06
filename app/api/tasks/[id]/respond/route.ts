// ============================================================
// API: POST /api/tasks/:id/respond
// 同学提交对某任务的响应
// ============================================================
import { NextResponse } from "next/server";
import { addResponse, getTaskById } from "@/src/lib/taskStore";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    const body = await req.json();
    const { userId, response } = body;

    if (!userId) {
      return NextResponse.json({ error: "缺少 userId" }, { status: 400 });
    }

    if (!response || typeof response !== "object") {
      return NextResponse.json({ error: "缺少 response 字段" }, { status: 400 });
    }

    const resp = addResponse(id, String(userId), response);

    return NextResponse.json({ success: true, response: resp });
  } catch (e) {
    console.error("POST /api/tasks/:id/respond error:", e);
    return NextResponse.json({ error: "提交响应失败" }, { status: 500 });
  }
}