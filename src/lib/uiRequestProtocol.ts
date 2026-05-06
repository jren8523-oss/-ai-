// ============================================================
// UI Request Protocol — AI 自主生成交互卡片的协议规范
// ============================================================
// 当 AI 识别出用户有"发布任务"、"统计信息"或"发起活动"的意图时，
// 必须在其回复中附带一个特殊的 Markdown Block，格式如下：
//
// ```ui-request
// {
//   "component": "TaskConfigCard",
//   "props": {
//     "type": "checkin | collection | vote",
//     "title": "AI 根据上下文生成的标题",
//     "params": { ...根据类型生成的初始参数 }
//   }
// }
// ```
// ============================================================

/** 交互卡片支持的组件类型 */
export type UIRequestComponent = "TaskConfigCard";

/** 任务卡片子类型 */
export type TaskCardType = "checkin" | "collection" | "vote";

/** UI Request 的 Props 载荷 */
export interface TaskConfigCardProps {
  type: TaskCardType;
  title: string;
  params: Record<string, unknown>;
}

/** UI Request 完整载荷 */
export interface UIRequestPayload {
  component: UIRequestComponent;
  props: TaskConfigCardProps;
}

/** 协议块标记名称 */
export const UI_REQUEST_FENCE = "ui-request";

/** 正则：匹配 ```ui-request ... ``` 代码块 */
const UI_REQUEST_REGEX = new RegExp(
  "```" +
    UI_REQUEST_FENCE +
    "\\s*\\n([\\s\\S]*?)\\n```",
  "g",
);

/**
 * 从 AI 回复文本中解析 ui-request 块
 * @param text AI 的原始回复（可能包含 ```ui-request``` 代码块）
 * @returns 解析后的 UIRequestPayload，如果没有则返回 null
 */
export function parseUIRequest(
  text: string,
): UIRequestPayload | null {
  const regex = new RegExp(
    "```" +
      UI_REQUEST_FENCE +
      "\\s*\\n([\\s\\S]*?)\\n```",
    "i",
  );

  const match = regex.exec(text);
  if (!match) return null;

  const jsonStr = match[1].trim();
  if (!jsonStr) return null;

  try {
    const parsed = JSON.parse(jsonStr);

    // 基本校验
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.component !== "TaskConfigCard" ||
      !parsed.props ||
      typeof parsed.props !== "object"
    ) {
      console.warn("[uiRequestProtocol] 解析成功但格式不符合预期:", parsed);
      return null;
    }

    const { type, title, params } = parsed.props;
    if (
      !["checkin", "collection", "vote"].includes(type) ||
      typeof title !== "string" ||
      typeof params !== "object" ||
      params === null
    ) {
      console.warn("[uiRequestProtocol] props 字段类型不符合预期:", parsed.props);
      return null;
    }

    return {
      component: parsed.component as UIRequestComponent,
      props: {
        type: type as TaskCardType,
        title: title as string,
        params: params as Record<string, unknown>,
      },
    };
  } catch (e) {
    console.warn("[uiRequestProtocol] JSON 解析失败:", e);
    return null;
  }
}

/**
 * 从 AI 回复文本中移除所有 ui-request 代码块，
 * 返回干净的面向用户的文本
 * @param text AI 的原始回复
 * @returns 剥离 ui-request 块后的纯文本
 */
export function stripUIRequestBlocks(text: string): string {
  const regex = new RegExp(
    "```" +
      UI_REQUEST_FENCE +
      "\\s*\\n[\\s\\S]*?\\n```\\n?",
    "gi",
  );
  return text.replace(regex, "").trim();
}

/**
 * 构建注入给 AI 的系统提示词片段，
 * 描述何时以及如何使用 ui-request 协议
 */
export function buildUIRequestSystemPrompt(): string {
  return `
## 交互卡片协议 (ui-request)

当你的回复中需要调用前端交互卡片时，必须在回复末尾附带一个 Markdown 代码块，标记为 \`\`\`ui-request。
该代码块不会被用户看见，仅用于触发前端组件的渲染。

### 触发条件
当用户意图涉及以下场景时，你必须生成 ui-request 块：
1. **发布任务**（如签到、核对、问卷调查）
2. **统计信息**（如查看签到结果、教材缴费统计）
3. **发起活动**（如投票、报名、接龙）

### 代码块格式
\`\`\`ui-request
{
  "component": "TaskConfigCard",
  "props": {
    "type": "<checkin|collection|vote>",
    "title": "根据上下文生成的卡片标题",
    "params": {
      // 根据 type 生成对应的初始参数
      // checkin: { "scene": "晚自习", "durationMinutes": 30, "range": "500m", "mode": "gps" }
      // collection: { "itemName": "教材费", "amount": 0, "deadline": "..." }
      // vote: { "question": "...", "options": ["选项1", "选项2"] }
    }
  }
}
\`\`\`

### 示例
用户说：「帮我发起今晚晚自习签到，GPS 模式，500 米范围」

你的回复应包含文本说明，并在末尾附加：
\`\`\`ui-request
{
  "component": "TaskConfigCard",
  "props": {
    "type": "checkin",
    "title": "晚自习签到",
    "params": {
      "scene": "晚自习",
      "durationMinutes": 30,
      "range": "500m",
      "mode": "gps"
    }
  }
}
\`\`\`

### 重要规则
- ui-request 块必须放在回复的最后
- JSON 必须严格符合格式，不要添加注释
- **仅当用户明确表达"发布任务"、"发起统计/调查/签到/投票"、"收集信息"等意图时才生成 ui-request 块**
- **严禁在以下场景生成 ui-request 块：普通闲聊、问候语（如"你好"）、问路、问课表、查询信息、请假流程咨询、个人疑问等不涉及任务发布的对话**
- 回复的正文中不要提及 ui-request 或卡片的相关内容
`.trim();
}

/**
 * 完整系统提示词（包含协议说明 + 基础角色描述）
 * 适用于注入给 DeepSeek API
 */
export function buildCompleteSystemPrompt(contextTitle: string): string {
  return `You are the AI assistant for "${contextTitle}". Respond helpfully to the user's message. Keep the response concise and friendly. Use Chinese to reply.

${buildUIRequestSystemPrompt()}`;
}