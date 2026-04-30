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
    prompt: "开启新一轮的班级教材征订，专业课包括法理学、民法典等。",
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
    replyLogic: (text: string) => string;
  }
> = {
  我的班级: {
    aiTitle: "AI 班级管家 (已接入教务数据)",
    initialMessage:
      "辅导员魏老师最新通知：本周《民法典》期末复习资料已由我自动上传至资产仓，请提醒同学们查阅。目前还有3人未提交毕业论文定稿。",
    replyLogic: (text: string) => {
      if (text.includes("整理"))
        return "正在为您整理班级周报... 已提取本周考勤、作业提交情况及校园活动参与数据，预计生成需 3 秒。";
      if (text.includes("催促"))
        return "已为您标记未交论文定稿的 3 名同学。是否需要我通过系统向他们发送一键催办提醒？";
      return "指令明确。已为您记录，我将继续跟进相关行政执行情况。";
    },
  },
  院学生会: {
    aiTitle: "AI 校园百事通",
    initialMessage:
      "【校园热榜速递】本周校园热帖摘要已生成。提示：迎新晚会的策划方案正在内部公示中，请各位干事留意截止时间。",
    replyLogic: (text: string) => {
      return "为您查询到以下信息：迎新晚会的大礼堂场地将于下周三下午14:00-18:00占用。如果您需要了解更多关于场地申请的规章，我可以为您详细解答。";
    },
  },
  志愿者服务: {
    aiTitle: "AI 志愿监测助手",
    initialMessage:
      "已为您接入 5 个志愿者招募群，正在实时扫描中... 本日监测到 3 个法学相关志愿项目，其中【杭州中院法律咨询助手】专业匹配度最高（95%），名额仅剩 2 个。您本学期累计志愿时长为 18 小时，距评优还差 2 小时。",
    replyLogic: (text: string) => {
      if (text.includes("法学") || text.includes("法律") || text.includes("专业相关") || text.includes("匹配")) {
        return "已为您实时扫描 5 个相关群组。检测到【杭州中院法律咨询助手】名额剩余 2 个（专业匹配度 95%），已为您预填报名表，点击即可发送。";
      }
      if (text.includes("志愿") || text.includes("活动") || text.includes("报名")) {
        return "为您聚合 5 个群组最新招募信息：①【杭州中院法律咨询助手】名额 2 个（法学匹配 95%）；②【社区普法宣传员】名额 5 个（法学匹配 82%）；③【周末敬老院活动】名额 2 个（通用志愿）。建议优先抢报第①项，点击即可预填报名。";
      }
      return "正在为您持续监测 5 个群组动态。如需筛选特定类型志愿（如法学/支教/环保），请直接告诉我您的偏好，AI 将为您精准匹配。";
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
  { id: '1', title: '期中论文定稿及查重报告', deadline: '今天 23:59 截止', sourceOrg: '我的班级', status: 'pending', priority: 'high', formId: 'thesis' },
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

export const ADMIN_USER_PROFILE: AdminUserProfile = {
  roleName: "班级行政主理人（以生活委员/班长为原型）",
  managementScale: "法学256班全员 31 人",
  coreTasks: [
    {
      title: "整理信息",
      description: "将教务处 2000 字的公文转化为 3 条核心待办。",
    },
    {
      title: "收费确权",
      description: "核对 31 份教材订购名单与转账截图，确保不漏不错。",
    },
    {
      title: "考勤管理",
      description: "发布签到任务，并核实地理围栏与二维码。",
    },
  ],
  corePainPoints: [
    {
      title: "算力浪费",
      description: "每天花费 2 小时进行人工对账，机械重复。",
    },
    {
      title: "心理压力",
      description: `在班群"刷屏式"催缴容易引发同学反感，耗损社交资本。`,
    },
  ],
  aiAccessPoints: [
    {
      title: "自动审计",
      description: `AI 自动比对确权，将"4小时接龙"缩短为"3分钟一键归档"。`,
    },
    {
      title: "拟态代催",
      description: `利用"摸鱼同桌"人格进行非侵入式提醒，降低行政对抗感。`,
    },
  ],
};

export const VOLUNTEER_SERVICE_PROFILE: AdminUserProfile = {
  roleName: "志愿者服务参与者（以法学专业学生为原型）",
  managementScale: "同时监控 5 个志愿者招募群",
  coreTasks: [
    {
      title: "跨群监测",
      description: "实时扫描 5 个群组的招募信息，避免遗漏任何优质志愿机会。",
    },
    {
      title: "快速报名",
      description: "在名额被抢光前完成报名表填写与提交。",
    },
    {
      title: "工时追踪",
      description: "记录志愿时长，确保满足评优门槛（每学期 ≥20 小时）。",
    },
  ],
  corePainPoints: [
    {
      title: "多群焦虑",
      description: "为抢到高质量志愿名额，需同时加入 5 个群组，信息碎片化严重，生怕错过任何一条招募通知。",
    },
    {
      title: "优质机会转瞬即逝",
      description: "与法学专业高度匹配的志愿（如法院咨询、法律援助）名额通常在 3 分钟内被抢光，手动刷新完全跟不上。",
    },
    {
      title: "抢单心理压力",
      description: "面对名额稀缺僧多粥少的局面，反复刷新群聊消耗大量精力，严重影响正常学习节奏。",
    },
  ],
  aiAccessPoints: [
    {
      title: "跨群信息聚合",
      description: "AI 自动监听 5 个群组，聚合所有招募信息并按专业匹配度排序，只推送高质量名额。",
    },
    {
      title: "智能预填与秒抢",
      description: "检测到高匹配度志愿时自动预填报名表，用户只需一键确认发送。",
    },
    {
      title: "自然语言检索",
      description: `用户可用自然语言提问（如"有没有法学相关的志愿"），AI 从多群中精准筛选并推荐。`,
    },
  ],
};
