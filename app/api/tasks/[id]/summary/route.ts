// ============================================================
// API: GET /api/tasks/:id/summary
// 返回某任务的汇总结果（班委查看统计）
// ============================================================
import { NextResponse } from "next/server";
import { getTaskSummary } from "@/src/lib/taskStore";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const summary = getTaskSummary(id);

    if (!summary.task) {
      return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    }

    return NextResponse.json({
      task: summary.task,
      responseCount: summary.responseCount,
      responses: summary.responses,
    });
  } catch (e) {
    console.error("GET /api/tasks/:id/summary error:", e);
    return NextResponse.json({ error: "获取汇总失败" }, { status: 500 });
  }
}