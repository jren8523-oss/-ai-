// ============================================================
// Task Protocol — DeepSeek 意图识别 + 任务卡片 JSON 协议
// ============================================================
// AI 识别班委四种意图，返回纯 JSON：
// {"action":"create_task","type":"签到|课表统计|订教材|通知","data":{...}}
// 非任务意图返回普通中文文本。

export type TaskActionType = "签到" | "课表统计" | "订教材" | "通知";

/** 签到任务 data */
export interface CheckinTaskData {
  deadline: string; // YYYY-MM-DD HH:MM
  location: string;
}

/** 课表统计 data */
export interface ScheduleTaskData {
  question: string;
}

/** 订教材 data */
export interface BookOrderTaskData {
  books: { name: string; price: number }[];
}

/** 通知 data */
export interface NoticeTaskData {
  content: string;
  needConfirm: boolean;
  addToCalendar: boolean;
}

export type TaskData =
  | CheckinTaskData
  | ScheduleTaskData
  | BookOrderTaskData
  | NoticeTaskData;

/** AI 识别并生成任务时的结构化输出 */
export interface TaskActionPayload {
  action: "create_task";
  type: TaskActionType;
  data: TaskData;
}

/**
 * 从 AI 回复文本中尝试解析任务 action JSON
 * 匹配第一个有效的 JSON 对象，检查是否包含 action 字段
 */
export function parseTaskAction(text: string): TaskActionPayload | null {
  // 尝试直接解析整个文本
  let jsonStr = text.trim();

  // 如果整个文本不是 JSON，尝试提取第一个 JSON 对象
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  } else {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.action === "create_task" &&
      typeof parsed.type === "string" &&
      typeof parsed.data === "object" &&
      parsed.data !== null
    ) {
      const validTypes: TaskActionType[] = ["签到", "课表统计", "订教材", "通知"];
      if (!validTypes.includes(parsed.type as TaskActionType)) {
        console.warn("[taskProtocol] 未知任务类型:", parsed.type);
        return null;
      }
      return {
        action: "create_task",
        type: parsed.type as TaskActionType,
        data: parsed.data as TaskData,
      };
    }
    return null;
  } catch {
    // 不是 JSON，返回 null（作为普通文本处理）
    return null;
  }
}

/**
 * 从 AI 回复中移除 JSON 部分，返回纯文本
 * 当 AI 同时返回了说明文字 + JSON 时，只保留文本部分
 */
export function stripTaskAction(text: string): string {
  // 尝试找到 JSON 对象并移除
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch && jsonMatch.index !== undefined) {
    return text.substring(0, jsonMatch.index).trim() || text.substring(jsonMatch.index + jsonMatch[0].length).trim();
  }
  return text;
}

/**
 * 新系统提示词——注入给 DeepSeek API
 */
export function buildTaskSystemPrompt(): string {
  return `你是一个班级AI助手"助理蛋"。你能识别班委的意图并生成对应任务。
当用户描述以下意图时，返回纯 JSON，不要有任何多余文字：

1. 发布签到：{"action":"create_task","type":"签到","data":{"deadline":"截止时间，YYYY-MM-DD HH:MM","location":"签到地点"}}
2. 统计晚自习出勤：{"action":"create_task","type":"课表统计","data":{"question":"本周晚自习统计，请填写你周一到周五哪天有晚课"}}
3. 订教材：{"action":"create_task","type":"订教材","data":{"books":[{"name":"书名","price":价格}]}}
4. 发布通知：{"action":"create_task","type":"通知","data":{"content":"通知内容","needConfirm":true,"addToCalendar":true}}

如果不是以上意图，正常用中文回复，不要返回 JSON。`.trim();
}

/**
 * 完整的系统提示词
 */
export function buildCompleteSystemPrompt(): string {
  return `You are 助理蛋, a class AI assistant. You help class leaders (班委) manage class tasks. Reply in Chinese.

${buildTaskSystemPrompt()}`;
}