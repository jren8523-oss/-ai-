// ─────────────────────────────────────────────────────
// Legacy replyLogic — kept as fallback for environments
// without DEEPSEEK_API_KEY. Primary interaction card
// generation is now AI-driven via ui-request protocol.
// See: src/lib/uiRequestProtocol.ts
// ─────────────────────────────────────────────────────

export const QUICK_ACTIONS: { id: string; icon: string; label: string; prompt: string; isCustom?: boolean }[] = [
  {
    id: "sign",
    icon: "📍",
    label: "晚自习签到",
    prompt: "帮我发起今晚的晚自习签到，要求开启定位校验，有效范围 500 米。",
  },
  {
    id: "notice",
    icon: "📢",
    label: "发重要通知",
    prompt: "帮我起草一份关于下周体测的重要通知。",
  },
  {
    id: "books",
    icon: "📚",
    label: "征订班级教材",
    prompt: "开启新一轮的班级教材征订，专业课教材由系统自动汇总，各位同学核对即可。",
  },
  {
    id: "homework",
    icon: "🚨",
    label: "催交青年大学习",
    prompt: "帮我发个群公告，催一下还没交第12期青年大学习截图的同学。",
  },
];

export const orgContextMap: Record<
  string,
  {
    aiTitle: string;
    initialMessage: string;
    /** @deprecated Legacy fallback — primary card generation is now AI-driven via ui-request protocol */
    replyLogic: (text: string) => { type: string; content: string; payload?: any } | string;
  }
> = {
  我的班级: {
    aiTitle: "AI 班级管家 (已接入教务数据)",
    initialMessage:
      "辅导员魏老师最新通知：本周课程复习资料已由我自动上传至资产仓，请提醒同学们查阅。目前还有3人未提交课程作业定稿。",
    /** @deprecated Legacy fallback — used only when DEEPSEEK_API_KEY is not configured */
    replyLogic: (text: string) => {
      if (text.includes("发布签到") || text.includes("我要签到")) {
        return { type: "checkin-config", content: "" };
      }
      if (text.includes("整理"))
        return "正在为您整理班级周报... 已提取本周考勤、作业提交情况及校园活动参与数据，预计生成需 3 秒。";
      if (text.includes("催促"))
        return "已为您标记未交课程作业的 3 名同学。是否需要我通过系统向他们发送一键催办提醒？";
      return "指令明确。已为您记录，我将继续跟进相关行政执行情况。";
    },
  },
  院学生会: {
    aiTitle: "AI 校园百事通",
    initialMessage:
      "【校园热榜速递】本周校园热帖摘要已生成。提示：迎新晚会的策划方案正在内部公示中，请各位干事留意截止时间。",
    /** @deprecated Legacy fallback */
    replyLogic: (text: string) => {
      return "为您查询到以下信息：迎新晚会的大礼堂场地将于下周三下午14:00-18:00占用。如果您需要了解更多关于场地申请的规章，我可以为您详细解答。";
    },
  },
  志愿者服务: {
    aiTitle: "AI 机会雷达",
    initialMessage:
      "已为您接入 5 个校级/院级活动群，正在实时扫描中... 本日监测到 3 个高含金量机会：①【全国大学生数学建模竞赛】匹配度最高（省级奖项），报名倒计时 2 天；②【社区支教志愿者】名额 8 个（可加综测分）；③【校运会开幕式表演志愿者】名额 15 个（通识学分）。建议优先锁定第①项。",
    /** @deprecated Legacy fallback */
    replyLogic: (text: string) => {
      if (text.includes("竞赛") || text.includes("加分") || text.includes("综测") || text.includes("数学建模")) {
        return "已为您实时扫描 5 个相关群组。检测到【全国大学生数学建模竞赛】报名倒计时 2 天（省级奖项，综测加分 3 分），已为您预填报名表，点击即可发送。";
      }
      if (text.includes("志愿") || text.includes("活动") || text.includes("报名")) {
        return "为您聚合 5 个群组最新招募信息：①【全国大学生数学建模竞赛】倒计时 2 天（省级·加分 3 分）；②【社区支教志愿者】名额 8 个（校级·加分 1.5 分）；③【校运会开幕式表演志愿者】名额 15 个（通识学分）。建议优先抢报第①项，点击即可预填报名。";
      }
      return "正在为您持续监测 5 个群组动态。如需筛选特定类型机会（如竞赛/支教/实习/社会实践），请直接告诉我您的偏好，AI 将为您精准匹配。";
    },
  },
};

export const mockTasks: Array<{
  id: string;
  title: string;
  deadline?: string;
  sourceOrg: string;
  status: "pending" | "completed";
  priority: "high" | "normal";
  formId?: string;
}> = [
  { id: '1', title: '课程作业提交及查重报告', deadline: '今天 23:59 截止', sourceOrg: '我的班级', status: 'pending', priority: 'high', formId: 'thesis' },
  { id: '2', title: '综测加分证明材料确认', deadline: '明天 12:00 截止', sourceOrg: '我的班级', status: 'pending', priority: 'normal', formId: 'score' },
  { id: '3', title: '教材征订', sourceOrg: '我的班级', status: 'pending', priority: 'normal', formId: 'textbook' },
  { id: '4', title: '青年大学习第12期截图收集', deadline: '昨天 16:30 智能归档', sourceOrg: '我的班级', status: 'completed', priority: 'normal' },
  { id: '5', title: '开学防诈骗知识问卷', deadline: '3天前 智能归档', sourceOrg: '我的班级', status: 'completed', priority: 'normal' },
  { id: '6', title: '迎新晚会物资清点', deadline: '明晚 18:00 截止', sourceOrg: '院学生会', status: 'pending', priority: 'high', formId: 'materials' },
  { id: '7', title: '院队篮球赛排班表确认', deadline: '下周一 10:00 截止', sourceOrg: '院学生会', status: 'pending', priority: 'normal', formId: 'basketball' },
  { id: '8', title: '上月部门活动总结', deadline: '昨天 16:30 智能归档', sourceOrg: '院学生会', status: 'completed', priority: 'normal' },
  { id: '9', title: '周末敬老院活动行前培训', deadline: '本周五晚 19:00', sourceOrg: '志愿者服务', status: 'pending', priority: 'high', formId: 'training' },
];

export interface AdminUserProfile {
  roleName: string;
  managementScale: string;
  coreTasks: { title: string; description: string }[];
  corePainPoints: { title: string; description: string }[];
  aiAccessPoints: { title: string; description: string }[];
}

export const CLASS_ADMIN_PROFILE: AdminUserProfile = {
  roleName: "班级行政主理人（劳模班委）",
  managementScale: "行政班级全员",
  coreTasks: [
    {
      title: "整理信息",
      description: "把教务处发的一长串公文拆成 3 条同学看得懂的执行指令。",
    },
    {
      title: "收费确权",
      description: "逐一核对全班同学的转账截图和名单，确保不重不漏。",
    },
    {
      title: "考勤管理",
      description: "发布签到任务，核实每个人的定位和到勤情况。",
    },
  ],
  corePainPoints: [
    {
      title: "重复劳动",
      description: "每天花 2 小时人肉对账，截图翻到手软，纯纯体力活。",
    },
    {
      title: "社交压力",
      description: "在班群一遍遍催截图催缴费，刷屏怕被嫌烦，不刷又收不齐。",
    },
  ],
  aiAccessPoints: [
    {
      title: "截图自动识别",
      description: "AI 自动读取同学们发的转账截图，比对名单一键确权，人肉 4 小时的活缩到 3 分钟。",
    },
    {
      title: "非侵入式代催",
      description: "不用你在群里刷屏，「摸鱼同桌」人格代替你私聊提醒，同学不反感，你也不用当恶人。",
    },
  ],
};

export const MINIMALIST_STUDENT_PROFILE: AdminUserProfile = {
  roleName: "极简履行者（屏蔽达人）",
  managementScale: "同时关注 3 个综合信息频道",
  coreTasks: [
    {
      title: "信息过滤",
      description: "从学生会群、年级大群的几百条消息中，捞出真正跟自己有关的通知。",
    },
    {
      title: "任务识别",
      description: "快速分辨「需要我填的表」「需要我缴的费」「需要我确认的截止时间」。",
    },
    {
      title: "极速履行",
      description: "在截止时间之前完成填报、缴费、确认，不留尾巴。",
    },
  ],
  corePainPoints: [
    {
      title: "群聊疲劳",
      description: "打开微信就是 99+，翻半天才找到那条通知，中间夹着几百条「收到」「好的」和表情包。",
    },
    {
      title: "漏看焦虑",
      description: "每次群消息一多就下意识划过，等回过神来发现截止时间已经过了，只能尴尬私聊班长。",
    },
    {
      title: "社交负担",
      description: "不想整天盯着群聊，但又怕错过重要事情，被迫成为「群奴」。",
    },
  ],
  aiAccessPoints: [
    {
      title: "噪音过滤",
      description: "AI 自动剔除闲聊、表情包、「收到」刷屏，只把真正需要你处理的任务以卡片形式置顶。",
    },
    {
      title: "免进群秒完成",
      description: "收到任务卡片后直接在卡片里操作——填表、缴费、确认，不用点进 99+ 的群聊翻找上下文。",
    },
    {
      title: "智能提醒",
      description: "快到截止时间还没处理的任务，AI 会悄悄提醒你，不@所有人、不社死、刚刚好。",
    },
  ],
};

export const OPPORTUNITY_HUNTER_PROFILE: AdminUserProfile = {
  roleName: "机会猎人（抢单射手）",
  managementScale: "同时盯着 5 个竞赛/志愿/活动招募群",
  coreTasks: [
    {
      title: "跨群监测",
      description: "实时扫描多个校级/院级群的招募信息，大创、竞赛、志愿、实习一条都不漏。",
    },
    {
      title: "秒级响应",
      description: "看到高含金量机会的第一时间打开报名链接，跟全校同学拼手速。",
    },
    {
      title: "材料速填",
      description: "学号、班级、手机号、个人简介——每次报名都要重新敲一遍，烦得要死但不敢出错。",
    },
  ],
  corePainPoints: [
    {
      title: "信息碎片化",
      description: "好机会散落在几十个群公告、公众号推文、辅导员朋友圈里，根本盯不过来。",
    },
    {
      title: "手慢无",
      description: "大创队友招募、数学建模组队、支教名额——发出来 3 分钟就满了，全看运气和网速。",
    },
    {
      title: "填表地狱",
      description: "每次抢名额都要重新填一遍表单：学号、班级、手机号、个人陈述……等填完名额早没了。",
    },
  ],
  aiAccessPoints: [
    {
      title: "跨频道实时聚合",
      description: "AI 24 小时监听所有公开频道，把散落的机会按「加分」「社会实践」「省奖」等关键词聚合成一个信息流。",
    },
    {
      title: "自动预填秒抢",
      description: "检测到匹配的机会时，AI 自动把你的学号、班级、手机号预填入报名表，你只需点一下确认。",
    },
    {
      title: "自然语言检索",
      description: "开口就问：「最近有没有能加综测分的竞赛？」——AI 直接帮你从几个群的消息里精准筛出来。",
    },
  ],
};