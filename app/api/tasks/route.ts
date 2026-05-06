// ============================================================
// API: POST /api/tasks — 创建任务卡片
//      GET  /api/tasks — 获取所有待处理任务列表
// ============================================================
import { NextResponse } from "next/server";
import { addTask, getAllTasks } from "@/src/lib/taskStore";
import type { TaskActionType, TaskData } from "@/src/lib/taskProtocol";

export const runtime = "nodejs";

const VALID_TASK_TYPES: TaskActionType[] = ["签到", "课表统计", "订教材", "通知"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "缺少 type 或 data 字段" },
        { status: 400 }
      );
    }

    if (!VALID_TASK_TYPES.includes(type as TaskActionType)) {
      return NextResponse.json(
        { error: `无效的任务类型: ${type}，支持: ${VALID_TASK_TYPES.join("、")}` },
        { status: 400 }
      );
    }

    const task = addTask(type as TaskActionType, data as TaskData);

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (e) {
    console.error("POST /api/tasks error:", e);
    return NextResponse.json(
      { error: "创建任务失败" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tasks = getAllTasks();
    return NextResponse.json({ tasks });
  } catch (e) {
    console.error("GET /api/tasks error:", e);
    return NextResponse.json(
      { error: "获取任务列表失败" },
      { status: 500 }
    );
  }
}