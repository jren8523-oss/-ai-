// ============================================================
// In-Memory Task Store — Demo 级后端任务仓库
// 进程重启即丢失，不做持久化
// ============================================================

import type { TaskActionType, TaskData } from "@/src/lib/taskProtocol";

export interface StoredTask {
  id: string;
  type: TaskActionType;
  data: TaskData;
  createdAt: string;
  responses: TaskResponse[];
}

export interface TaskResponse {
  userId: string;
  response: Record<string, unknown>;
  respondedAt: string;
}

const taskStore = new Map<string, StoredTask>();

let taskIdCounter = 1;

export function addTask(type: TaskActionType, data: TaskData): StoredTask {
  const id = `task-${taskIdCounter++}`;
  const task: StoredTask = {
    id,
    type,
    data,
    createdAt: new Date().toISOString(),
    responses: [],
  };
  taskStore.set(id, task);
  return task;
}

export function getAllTasks(): StoredTask[] {
  return Array.from(taskStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getTaskById(id: string): StoredTask | undefined {
  return taskStore.get(id);
}

export function addResponse(
  taskId: string,
  userId: string,
  response: Record<string, unknown>
): TaskResponse | null {
  const task = taskStore.get(taskId);
  if (!task) return null;

  // 同一用户可重复提交，覆盖旧响应
  const existingIdx = task.responses.findIndex((r) => r.userId === userId);
  const resp: TaskResponse = {
    userId,
    response,
    respondedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    task.responses[existingIdx] = resp;
  } else {
    task.responses.push(resp);
  }

  return resp;
}

export function getTaskSummary(taskId: string): {
  task: StoredTask | undefined;
  responseCount: number;
  responses: TaskResponse[];
} {
  const task = taskStore.get(taskId);
  return {
    task,
    responseCount: task?.responses?.length ?? 0,
    responses: task?.responses ?? [],
  };
}