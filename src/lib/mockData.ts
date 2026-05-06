// ═══════════════════════════════════════════════════════════════
// Unified Mock Data Store
// ═══════════════════════════════════════════════════════════════

import type { CalendarEvent } from "@/src/store/calendarStore";

export const QUICK_ACTIONS: { id: string; icon: string; label: string; prompt: string; isCustom?: boolean }[] = [
  { id: "sign", icon: "📍", label: "发起签到", prompt: "发起签到：截止今晚 21:00，地点3教101" },
  { id: "schedule", icon: "📊", label: "统计晚自习出勤", prompt: "统计本周晚自习出勤情况，周一到周五哪天有晚课" },
  { id: "books", icon: "📚", label: "征订民法教材", prompt: "开启教材征订：《民法学》45元，《刑法学》52元" },
  { id: "notice", icon: "📢", label: "发布放假通知", prompt: "发布放假通知：下周一体测，请大家做好准备，穿运动服带学生证。" },
];

export const orgContextMap: Record<string, { aiTitle: string; initialMessage: string; replyLogic: (text: string) => any }> = {
  我的班级: {
    aiTitle: "班级管家 (已接入教务数据)",
    initialMessage: "课程助手最新通知：本周课程复习资料已自动上传至资产仓，请提醒同学们查阅。目前还有3人未提交课程作业定稿。",
    replyLogic: (text: string) => {
      if (text.includes("发布签到") || text.includes("我要签到")) return { type: "checkin-config", content: "" };
      if (text.includes("收作业") || text.includes("交作业") || text.includes("催作业")) return "收到。目前暂无作业收集的专属卡片功能，你可以通过群公告或通知模块发布作业提醒。需要我帮你起草一份作业通知吗？";
      if (text.includes("整理")) return "正在为您整理班级周报...";
      if (text.includes("催促")) return "已为您标记未交课程作业的 3 名同学。是否需要我通过系统向他们发送一键催办提醒？";
      return "指令明确。已为您记录，我将继续跟进相关行政执行情况。";
    },
  },
  院学生会: {
    aiTitle: "校园百事通",
    initialMessage: "【校园热榜速递】本周校园热帖摘要已生成。提示：迎新晚会的策划方案正在内部公示中，请各位干事留意截止时间。",
    replyLogic: () => "为您查询到以下信息：迎新晚会的大礼堂场地将于下周三下午14:00-18:00占用。",
  },
  志愿者服务: {
    aiTitle: "机会雷达",
    initialMessage: "已为您接入 5 个校级/院级活动群，正在实时扫描中... 本日监测到 3 个高含金量机会。",
    replyLogic: (text: string) => {
      if (text.includes("竞赛") || text.includes("加分")) return "已为您实时扫描。检测到【全国大学生数学建模竞赛】报名倒计时 2 天。";
      return "正在持续监测 5 个群组动态。";
    },
  },
};

// ─────────────────────────────────────────────────────
// 知识库
// ─────────────────────────────────────────────────────
export const knowledgeBaseItems: string[] = [
  "《民法典》期末考试重点整理 (王学姐)",
  "大学英语四级高频词汇速记卡",
  "高等数学下期末真题合集 2025",
  "思修期末论述题答题模板",
  "线性代数笔记 - 赵学长手写版",
  "计算机二级 Python 真题解析",
  "近代史纲要时间轴梳理",
  "概率论与数理统计公式手册",
];

// ═══════════════════════════════════════════════════════════════
// 情报与悬赏（原"有求必应"）— Bounty & Review Hub
// ═══════════════════════════════════════════════════════════════

export type BountyCategory = "errand" | "book" | "material";
export type ReviewCategory = "teacher" | "food";

export interface MockBounty {
  id: string;
  type: "bounty";
  title: string;
  description: string;
  category: BountyCategory;
  reward: string;           // "+5 积分" | "一杯奶茶" | "20元" ...
  rewardType: "points" | "treat" | "cash";
  status: "waiting" | "in-progress" | "resolved";
  author: string;
  createdAt: string;
}

export interface MockReview {
  id: string;
  type: "review";
  title: string;
  description: string;
  category: ReviewCategory;
  tags: string[];           // ["#捞人", "#点名狂魔"] ...
  rating?: number;          // 1-5 for food
  author: string;
  createdAt: string;
  targetName: string;       // teacher or food name to search
}

export type HubItem = MockBounty | MockReview;

// ── 悬赏互助 Mock ─────────────────────────────────────
export const mockBounties: MockBounty[] = [
  {
    id: "b1",
    type: "bounty",
    title: "谁能帮我从二食堂带份炸鸡？",
    description: "脚崴了下不了楼，有偿求带一份二食堂炸鸡套餐到宿舍。",
    category: "errand",
    reward: "+5 积分",
    rewardType: "points",
    status: "waiting",
    author: "匿名同学",
    createdAt: "12 分钟前",
  },
  {
    id: "b2",
    type: "bounty",
    title: "求一本二手《民法学》教材",
    description: "考研复习用，书况新更好，可学校交易。",
    category: "book",
    reward: "一杯奶茶",
    rewardType: "treat",
    status: "waiting",
    author: "匿名同学",
    createdAt: "28 分钟前",
  },
  {
    id: "b3",
    type: "bounty",
    title: "急求民事诉讼笔记",
    description: "缺几节课的笔记，求完整笔记分享，有偿感谢。",
    category: "material",
    reward: "+10 积分",
    rewardType: "points",
    status: "waiting",
    author: "匿名同学",
    createdAt: "1 小时前",
  },
  {
    id: "b4",
    type: "bounty",
    title: "代取快递（南门驿站）",
    description: "有两个快递在南门驿站，懒得跑了，求帮忙取一下。",
    category: "errand",
    reward: "一瓶饮料",
    rewardType: "treat",
    status: "in-progress",
    author: "匿名同学",
    createdAt: "2 小时前",
  },
  {
    id: "b5",
    type: "bounty",
    title: "出二手《刑法学》第九版",
    description: "去年买的，笔记很少，几乎全新，25 元出。",
    category: "book",
    reward: "25 元",
    rewardType: "cash",
    status: "waiting",
    author: "匿名同学",
    createdAt: "3 小时前",
  },
  {
    id: "b6",
    type: "bounty",
    title: "二食堂帮忙带饭",
    description: "一整天图书馆，求帮忙带二食堂宫保鸡丁盖浇饭。",
    category: "errand",
    reward: "+5 积分",
    rewardType: "points",
    status: "resolved",
    author: "匿名同学",
    createdAt: "5 小时前",
  },
];

// ── 评价避雷 Mock ─────────────────────────────────────
export const mockReviews: MockReview[] = [
  {
    id: "r1",
    type: "review",
    title: "张老师课堂教学评价",
    description: "上课准时点名，迟到三次直接取消考试资格。喜欢叫人起来回答问题，注意坐中后排。",
    category: "teacher",
    tags: ["#点名狂魔", "#挂科率低"],
    rating: undefined,
    author: "匿名同学",
    createdAt: "1 天前",
    targetName: "张老师",
  },
  {
    id: "r2",
    type: "review",
    title: "李老师民诉法课评价",
    description: "课讲得很好，但是从来不捞人。期末考试不给重点，全靠平时笔记。建议认真听课。",
    category: "teacher",
    tags: ["#不捞人", "#讲得好"],
    rating: undefined,
    author: "匿名同学",
    createdAt: "2 天前",
    targetName: "李老师",
  },
  {
    id: "r3",
    type: "review",
    title: "王教授法理学评价",
    description: "温和大佬，从不点名。给分公道，只要认真写论文基本 80+。推荐选修。",
    category: "teacher",
    tags: ["#捞人", "#佛系大佬"],
    rating: undefined,
    author: "匿名同学",
    createdAt: "3 天前",
    targetName: "王教授",
  },
  {
    id: "r4",
    type: "review",
    title: "二食堂炸鸡窗口",
    description: "最近重新开业了，但份量缩水明显。以前 15 块能吃饱，现在明显少了 1/3。",
    category: "food",
    tags: ["#份量缩水", "#味道还行"],
    rating: 3,
    author: "匿名同学",
    createdAt: "8 小时前",
    targetName: "二食堂炸鸡",
  },
  {
    id: "r5",
    type: "review",
    title: "一食堂麻辣香锅",
    description: "比外面的都好吃！价格合理，18 块一份能两个人吃。推荐微辣中辣。",
    category: "food",
    tags: ["#性价比之王", "#推荐"],
    rating: 5,
    author: "匿名同学",
    createdAt: "1 天前",
    targetName: "一食堂麻辣香锅",
  },
  {
    id: "r6",
    type: "review",
    title: "校外李先生牛肉面",
    description: "北门出去左手第二家，牛肉给得足，汤头浓。比食堂贵一点但值得。",
    category: "food",
    tags: ["#校外宝藏", "#推荐"],
    rating: 4,
    author: "匿名同学",
    createdAt: "2 天前",
    targetName: "李先生牛肉面",
  },
];

// ── AI 智库周报 ───────────────────────────────────────
export interface DailyBriefing {
  tag: string;
  text: string;
}
export const dailyBriefings: DailyBriefing[] = [
  { tag: "避雷", text: "二食堂炸鸡份量缩水，同学反馈明显少了 1/3" },
  { tag: "预警", text: "张老师今天点名，后排同学请注意就座" },
  { tag: "推荐", text: "锦囊已更新民诉笔记，已匿名同学分享完整版" },
];

// ─────────────────────────────────────────────────────
// 校历日程
// ─────────────────────────────────────────────────────
export const calendarEvents: CalendarEvent[] = [
  { id: "cal-1", date: "2026-05-05", time: "08:00", title: "期中教学检查周", confirmedAt: "" },
  { id: "cal-2", date: "2026-05-12", time: "14:00", title: "英语四级模拟考试", confirmedAt: "" },
  { id: "cal-3", date: "2026-05-20", time: "09:00", title: "校运会开幕式", confirmedAt: "" },
  { id: "cal-4", date: "2026-06-01", time: "17:00", title: "毕业论文提交截止", confirmedAt: "" },
  { id: "cal-5", date: "2026-06-15", time: "08:00", title: "期末考试周开始", confirmedAt: "" },
];

// ─────────────────────────────────────────────────────
// UNIFIED Post & Comment data model
// ─────────────────────────────────────────────────────
export interface Comment {
  id: string;
  postId: string;
  author: { name: string; avatar: string };
  content: string;
  createdAt: string;
  replyTo?: { id: string; author: string };
  likes?: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: { name: string; avatar: string };
  createdAt: string;
  image?: string;
  likes: number;
  commentCount: number;
  comments: Comment[];
}

export const mockCurrentUser = {
  name: "同学",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tongxue",
};

export function getPostById(id: string): Post | undefined {
  return mockPosts.find((p) => p.id === id);
}

// ─────────────────────────────────────────────────────
// MOCK POSTS — 20 items
// ─────────────────────────────────────────────────────
export const mockPosts: Post[] = [
  {
    id: "1", title: "二食堂炸鸡什么时候恢复？", content: "谁知道二食堂那家炸鸡什么时候恢复营业啊？等好几天了，真的很想吃😭",
    author: { name: "吃货小分队", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chihuo" }, createdAt: "10分钟前",
    image: "https://images.unsplash.com/photo-1567620985032-026c12504172?q=80&w=500", likes: 28, commentCount: 3,
    comments: [
      { id: "c1", postId: "1", author: { name: "食堂百晓生", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=baixiao" }, content: "听说下周一恢复！老板在装修后厨，换了新油锅，到时候会有开业优惠～", createdAt: "3分钟前" },
      { id: "c2", postId: "1", author: { name: "炸鸡爱好者", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhaji" }, content: "我也在等！每天路过食堂都看看开门了没😂", createdAt: "5分钟前" },
      { id: "c3", postId: "1", author: { name: "后勤小助手", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=houqin2" }, content: "已向膳食科确认，预计5月5日恢复营业。", createdAt: "8分钟前" },
    ],
  },
  {
    id: "2", title: "民法典讲座有人去吗？", content: "这周四下午的民法典讲座有人去吗？王教授的讲座每次人都爆满！我占座多一个位置，先到先得~",
    author: { name: "法学院小透明", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=faxue" }, createdAt: "45分钟前",
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=500", likes: 56, commentCount: 5,
    comments: [
      { id: "c4", postId: "2", author: { name: "民法狂热粉", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minfa" }, content: "我我我！王教授的讲座每次人都爆满，求带！", createdAt: "20分钟前" },
      { id: "c5", postId: "2", author: { name: "大三学姐一枚", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xuejie" }, content: "上次没抢到座，这次终于有机会了，已私信～", createdAt: "25分钟前" },
      { id: "c6", postId: "2", author: { name: "备考法考中", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fakao" }, content: "请问讲座具体在哪个教室呀？", createdAt: "30分钟前" },
      { id: "c7", postId: "2", author: { name: "法学院小透明", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=faxue" }, content: "在明法楼201，下午两点开始哦～", createdAt: "28分钟前" },
      { id: "c8", postId: "2", author: { name: "路过的学弟", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xuedi" }, content: "外院的可以来旁听吗？对民法典挺感兴趣的", createdAt: "15分钟前" },
    ],
  },
  {
    id: "3", title: "法学期末考重点是什么？", content: "求问！法学期末考重点是什么？老师说范围是整个课本，急出冷汗了，有没有师兄师姐指点一下重点章节？",
    author: { name: "法学生", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=faxuesheng" }, createdAt: "15分钟前",
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=500", likes: 7, commentCount: 2,
    comments: [
      { id: "c9", postId: "3", author: { name: "法学生乙", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=faxueshengyi" }, content: "物权编和侵权编！还有去年的真题可以参考", createdAt: "5分钟前" },
      { id: "c10", postId: "3", author: { name: "法学生丙", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=faxueshengbing" }, content: "刑法总论部分也要多看，去年考了很多", createdAt: "2分钟前" },
    ],
  },
  {
    id: "4", title: "二食堂新出螺蛳粉窗口！", content: "二食堂新出的螺蛳粉窗口，味道是正宗了但是整个食堂都是那个味😂 隔壁吃麻辣烫的同学表情亮了",
    author: { name: "食堂观察员", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guancha" }, createdAt: "22分钟前",
    image: "https://images.unsplash.com/photo-1567620985032-026c12504172?q=80&w=500", likes: 42, commentCount: 2,
    comments: [
      { id: "c11", postId: "4", author: { name: "螺蛳粉狂热", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=luosi" }, content: "终于有了！等了好久了，明天必冲！", createdAt: "10分钟前" },
      { id: "c12", postId: "4", author: { name: "不吃酸笋", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=busuan" }, content: "求二楼开个无味区，真的受不了那个味道…", createdAt: "8分钟前" },
    ],
  },
  {
    id: "5", title: "轮滑社春季招新开始！", content: "🎉 轮滑社春季招新开始啦！零基础包教包会，每周二、四晚上体育馆门口集合。社团装备可租借，扫码进群了解更多！",
    author: { name: "轮滑社-招新", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lunhua" }, createdAt: "1小时前",
    image: "https://images.unsplash.com/photo-1541339907198-e08756defeec?q=80&w=500", likes: 23, commentCount: 3,
    comments: [
      { id: "c13", postId: "5", author: { name: "小萌新", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mengxin" }, content: "完全没有基础可以吗？想学！", createdAt: "30分钟前" },
      { id: "c14", postId: "5", author: { name: "轮滑社-招新", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lunhua" }, content: "当然可以！大部分社员都是零基础起步的，我们有教练带着练~", createdAt: "25分钟前" },
      { id: "c15", postId: "5", author: { name: "路过看看", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=luguo" }, content: "大二还能加入吗？", createdAt: "18分钟前" },
    ],
  },
  {
    id: "6", title: "图书馆占座现象太严重了", content: "图书馆三楼东区又有人用书包占座了！早上八点半去全是包不见人。能不能自觉一点？管理员说了好多次了也不管用 😡",
    author: { name: "图书馆幽灵", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=youling" }, createdAt: "2小时前",
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=500", likes: 31, commentCount: 2,
    comments: [
      { id: "c16", postId: "6", author: { name: "自习侠", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zixi" }, content: "建群互相监督吧，看到占座的就拍照发群里", createdAt: "1小时前" },
      { id: "c17", postId: "6", author: { name: "考研狗", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kaoyangou" }, content: "四楼也很严重，我每天都得七点去才能抢到位", createdAt: "45分钟前" },
    ],
  },
  {
    id: "7", title: "英语四级刷题组队", content: "英语四级倒计时30天！有没有人一起刷真题的？求组队每天一套。已有3人，建群号9527",
    author: { name: "考试侠", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kaoshi" }, createdAt: "3小时前",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=500", likes: 18, commentCount: 2,
    comments: [
      { id: "c18", postId: "7", author: { name: "英语苦手", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kushou" }, content: "算我一个！真题一套都没刷过求带 😭", createdAt: "1小时前" },
      { id: "c19", postId: "7", author: { name: "考满分学姐", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=manfen" }, content: "可以分享我的真题资料，群里聊", createdAt: "30分钟前" },
    ],
  },
  {
    id: "8", title: "计算机二级Python真题求助", content: "计算机二级Python还有两周考试，有没有人分享一下真题解析？网上的资源太杂了不知道看哪个",
    author: { name: "码农预备役", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=manong" }, createdAt: "4小时前",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=500", likes: 12, commentCount: 1,
    comments: [
      { id: "c20", postId: "8", author: { name: "已过二级", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=erji" }, content: "推荐去B站搜'小黑课堂'，真题讲解很详细！", createdAt: "2小时前" },
    ],
  },
  {
    id: "9", title: "校运会报名开始啦！", content: "校运会报名开始啦！各班体委注意查收通知，项目包括100m、跳远、铅球、4x100接力等。截止日期5月12日，抓紧报名！",
    author: { name: "体育委员", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tiwei" }, createdAt: "5小时前",
    image: "https://images.unsplash.com/photo-1541339907198-e08756defeec?q=80&w=500", likes: 35, commentCount: 2,
    comments: [
      { id: "c21", postId: "9", author: { name: "跑步达人", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=paobu" }, content: "今年有没有新增趣味项目？去年那个袋鼠跳挺好玩的", createdAt: "3小时前" },
      { id: "c22", postId: "9", author: { name: "体育委员", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tiwei" }, content: "有！今年新增了'十人十一足'和'拔河'两个团体项目", createdAt: "2小时前" },
    ],
  },
  {
    id: "10", title: "宿舍洗衣机又坏了！", content: "南区宿舍楼下的洗衣房又坏了第三台洗衣机！现在排队要排到半夜…能不能后勤处赶紧来修一修？",
    author: { name: "南区住户", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nanqu" }, createdAt: "6小时前",
    image: "https://images.unsplash.com/photo-1541339907198-e08756defeec?q=80&w=500", likes: 67, commentCount: 3,
    comments: [
      { id: "c23", postId: "10", author: { name: "北区住户", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=beiqu" }, content: "北区也差不多，四台坏了两台，建议大家错峰洗衣", createdAt: "4小时前" },
      { id: "c24", postId: "10", author: { name: "已崩溃", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bengkui" }, content: "我凌晨一点还在排队你敢信？真的要疯了", createdAt: "3小时前" },
      { id: "c25", postId: "10", author: { name: "宿管阿姨", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=suguan" }, content: "已经报修了，维修师傅明天上午过来，大家再忍忍～", createdAt: "2小时前" },
    ],
  },
  {
    id: "11", title: "二食堂门口外卖被偷！", content: "有没有人在二食堂门口被偷过外卖？？我今天点的麻辣香锅放在取餐架上不到五分钟就被人拿走了 😤 已经查监控了",
    author: { name: "受害者一号", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=shouhai" }, createdAt: "8小时前",
    image: "https://images.unsplash.com/photo-1567620985032-026c12504172?q=80&w=500", likes: 89, commentCount: 2,
    comments: [
      { id: "c26", postId: "11", author: { name: "同样遭遇", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zaoyu" }, content: "上周我的奶茶也被偷了！强烈建议食堂装外卖柜", createdAt: "5小时前" },
      { id: "c27", postId: "11", author: { name: "保安大叔", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=baoan" }, content: "同学们取餐尽量准时，放太久确实容易被误拿", createdAt: "4小时前" },
    ],
  },
  {
    id: "12", title: "辩论社'校园奇葩说'报名", content: "🌟 辩论社第二届'校园奇葩说'开始报名！不论你有没有辩论经验，只要有观点有态度就来！冠军队伍奖金500元 + 市级比赛推荐名额",
    author: { name: "辩论社社长", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bianlun" }, createdAt: "9小时前",
    image: "https://images.unsplash.com/photo-1541339907198-e08756defeec?q=80&w=500", likes: 44, commentCount: 2,
    comments: [
      { id: "c28", postId: "12", author: { name: "辩手一枚", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bianshou" }, content: "辩题是什么呀？想提前准备一下", createdAt: "6小时前" },
      { id: "c29", postId: "12", author: { name: "辩论社社长", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bianlun" }, content: "初赛辩题是'大学生谈恋爱利大于弊还是弊大于利'", createdAt: "5小时前" },
    ],
  },
  {
    id: "13", title: "校园网又崩了！", content: "校园网又崩了！！论文写到一半突然断网，心态炸了。这是这个月第三次了吧？学校什么时候能升级一下网络设备？",
    author: { name: "网络难民", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wangluo" }, createdAt: "10小时前",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=500", likes: 55, commentCount: 2,
    comments: [
      { id: "c30", postId: "13", author: { name: "网管小哥", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wangguan" }, content: "已经在排查了，是核心交换机故障，预计今晚修复", createdAt: "7小时前" },
      { id: "c31", postId: "13", author: { name: "大四学长", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xuezhang" }, content: "四年了，每年都有那么几次大面积断网，习惯了😂", createdAt: "6小时前" },
    ],
  },
  {
    id: "14", title: "大一新生选课攻略", content: "给大一新生分享选课攻略：通识课推荐《影视鉴赏》（张老师，给分高）、《心理学与生活》（趣味性强）。避雷：《大学生职业生涯规划》——点名多、论文长、给分低",
    author: { name: "老学长", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=laoxuezhang" }, createdAt: "12小时前",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=500", likes: 112, commentCount: 3,
    comments: [
      { id: "c32", postId: "14", author: { name: "大一萌新", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dameng" }, content: "谢谢学长！请问专业课选哪位老师比较好？", createdAt: "8小时前" },
      { id: "c33", postId: "14", author: { name: "老学长", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=laoxuezhang" }, content: "专业课要看你是什么专业，私信我详细说～", createdAt: "7小时前" },
      { id: "c34", postId: "14", author: { name: "过来人", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guolai" }, content: "补充一个：《音乐鉴赏》也很水，上课听歌就完事了", createdAt: "5小时前" },
    ],
  },
  {
    id: "15", title: "校园流浪猫图鉴", content: "发一个校园流浪猫图鉴！🐱 图1: 图书馆门口的'馆长'（橘猫，超粘人）；图2: 食堂背后的'太君'（黑猫，只可远观）；图3: 宿舍楼下的'三花'（刚生了小猫，求大家不要打扰）",
    author: { name: "猫奴协会", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maonu" }, createdAt: "15小时前",
    image: "https://images.unsplash.com/photo-1541339907198-e08756defeec?q=80&w=500", likes: 78, commentCount: 2,
    comments: [
      { id: "c35", postId: "15", author: { name: "爱猫人士", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aimao" }, content: "馆长是我的最爱！每次去图书馆都要rua一下", createdAt: "10小时前" },
      { id: "c36", postId: "15", author: { name: "动物保护社", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dongbao" }, content: "三花的小猫如果发现请通知我们，我们会安排绝育和领养", createdAt: "8小时前" },
    ],
  },
  {
    id: "16", title: "期末考试时间安排已出", content: "期末考试时间安排已出！法学专业：6月16日民法、6月18日刑法、6月20日法理学。请大家合理安排复习时间，不要等到考前临时抱佛脚！",
    author: { name: "学委", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xuewei" }, createdAt: "18小时前",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=500", likes: 25, commentCount: 2,
    comments: [
      { id: "c37", postId: "16", author: { name: "抱佛脚选手", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=baofojiao" }, content: "收到，然后继续划水直到考前一天 😇", createdAt: "12小时前" },
      { id: "c38", postId: "16", author: { name: "学霸一枚", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xueba" }, content: "已经开始复习了，有需要笔记的可以找我", createdAt: "10小时前" },
    ],
  },
  {
    id: "17", title: "暑期社会实践组队招募", content: "暑期社会实践组队招募！主题：乡村振兴背景下农村电商发展调研。地点在省内某县，时间7月中旬5天。已有3人，再招2人，最好是会摄影或数据分析的同学",
    author: { name: "社实达人", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sheshi" }, createdAt: "20小时前",
    image: "https://images.unsplash.com/photo-1541339907198-e08756defeec?q=80&w=500", likes: 19, commentCount: 2,
    comments: [
      { id: "c39", postId: "17", author: { name: "摄影爱好者", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sheying" }, content: "我会摄影！有单反，能加入吗？", createdAt: "14小时前" },
      { id: "c40", postId: "17", author: { name: "社实达人", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sheshi" }, content: "欢迎！私信我发你群二维码～", createdAt: "13小时前" },
    ],
  },
  {
    id: "18", title: "毕业季约拍开始接单", content: "📸 毕业季约拍开始接单！单人写真50元/组，宿舍毕业照80元/间，专业相机+精修。样片放在评论区，有兴趣的私聊～",
    author: { name: "摄影社", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sheyingshe" }, createdAt: "1天前",
    image: "https://images.unsplash.com/photo-1541339907198-e08756defeec?q=80&w=500", likes: 36, commentCount: 2,
    comments: [
      { id: "c41", postId: "18", author: { name: "即将毕业", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=biye1" }, content: "求约！我们宿舍四个人想拍一组校园风", createdAt: "20小时前" },
      { id: "c42", postId: "18", author: { name: "摄影社", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sheyingshe" }, content: "可以呀，加微信详聊，已经私信你了", createdAt: "19小时前" },
    ],
  },
  {
    id: "19", title: "食堂减脂餐窗口上线", content: "学校食堂终于推出减脂餐窗口了！在二食堂二楼，鸡胸肉+糙米饭+时蔬只要12块，健康又实惠。已经在吃的小伙伴说说味道怎么样？",
    author: { name: "健身党", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jianshen" }, createdAt: "1天前",
    image: "https://images.unsplash.com/photo-1567620985032-026c12504172?q=80&w=500", likes: 48, commentCount: 2,
    comments: [
      { id: "c43", postId: "19", author: { name: "健身狂魔", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kuangmo" }, content: "吃了三天了，口味还不错！就是量有点少", createdAt: "22小时前" },
      { id: "c44", postId: "19", author: { name: "减肥中", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jianfei" }, content: "请问有素食版本的吗？我不吃肉", createdAt: "20小时前" },
    ],
  },
  {
    id: "20", title: "考研经验分享会", content: "考研经验分享会本周五晚7点在教学楼A301！邀请了三位上岸985的学长学姐分享备考经验。不限年级，有考研意向的同学都欢迎来！现场还有免费资料发放 📚",
    author: { name: "研究生学长", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yanjiusheng" }, createdAt: "2天前",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=500", likes: 93, commentCount: 3,
    comments: [
      { id: "c45", postId: "20", author: { name: "考研预备役", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kaoyanyb" }, content: "太需要了！请问有没有跨专业考研的经验分享？", createdAt: "1天前" },
      { id: "c46", postId: "20", author: { name: "大三学妹", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xuemei" }, content: "周五有课…有没有录播或者PPT分享？", createdAt: "20小时前" },
      { id: "c47", postId: "20", author: { name: "研究生学长", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yanjiusheng" }, content: "会后会在群里分享PPT，大家扫码进群就行～", createdAt: "18小时前" },
    ],
  },
];

// ─────────────────────────────────────────────────────
// Mock Tasks
// ─────────────────────────────────────────────────────
export const mockTasks: Array<{
  id: string; title: string; deadline?: string; sourceOrg: string;
  status: "pending" | "completed"; priority: "high" | "normal"; formId?: string;
}> = [
  { id: "1", title: "课程作业提交及查重报告", deadline: "今天 23:59 截止", sourceOrg: "我的班级", status: "pending", priority: "high", formId: "thesis" },
  { id: "2", title: "综测加分证明材料确认", deadline: "明天 12:00 截止", sourceOrg: "我的班级", status: "pending", priority: "normal", formId: "score" },
  { id: "3", title: "教材征订", sourceOrg: "我的班级", status: "pending", priority: "normal", formId: "textbook" },
  { id: "4", title: "青年大学习第12期截图收集", deadline: "昨天 16:30 智能归档", sourceOrg: "我的班级", status: "completed", priority: "normal" },
  { id: "5", title: "开学防诈骗知识问卷", deadline: "3天前 智能归档", sourceOrg: "我的班级", status: "completed", priority: "normal" },
  { id: "6", title: "迎新晚会物资清点", deadline: "明晚 18:00 截止", sourceOrg: "院学生会", status: "pending", priority: "high", formId: "materials" },
  { id: "7", title: "院队篮球赛排班表确认", deadline: "下周一 10:00 截止", sourceOrg: "院学生会", status: "pending", priority: "normal", formId: "basketball" },
  { id: "8", title: "上月部门活动总结", deadline: "昨天 16:30 智能归档", sourceOrg: "院学生会", status: "completed", priority: "normal" },
  { id: "9", title: "周末敬老院活动行前培训", deadline: "本周五晚 19:00", sourceOrg: "志愿者服务", status: "pending", priority: "high", formId: "training" },
];

// ─────────────────────────────────────────────────────
// Admin User Profiles
// ─────────────────────────────────────────────────────
export interface AdminUserProfile {
  roleName: string; managementScale: string;
  coreTasks: { title: string; description: string }[];
  corePainPoints: { title: string; description: string }[];
  aiAccessPoints: { title: string; description: string }[];
}

export const CLASS_ADMIN_PROFILE: AdminUserProfile = {
  roleName: "班级行政主理人（劳模班委）", managementScale: "行政班级全员",
  coreTasks: [
    { title: "整理信息", description: "把教务处发的一长串公文拆成 3 条同学看得懂的执行指令。" },
    { title: "收费确权", description: "逐一核对全班同学的转账截图和名单，确保不重不漏。" },
    { title: "考勤管理", description: "发布签到任务，核实每个人的定位和到勤情况。" },
  ],
  corePainPoints: [
    { title: "重复劳动", description: "每天花 2 小时人肉对账，截图翻到手软，纯纯体力活。" },
    { title: "社交压力", description: "在班群一遍遍催截图催缴费，刷屏怕被嫌烦，不刷又收不齐。" },
  ],
  aiAccessPoints: [
    { title: "截图自动识别", description: "自动读取同学们发的转账截图，比对名单一键确权，人肉 4 小时的活缩到 3 分钟。" },
    { title: "非侵入式代催", description: "不用你在群里刷屏，「摸鱼同桌」人格代替你私聊提醒，同学不反感，你也不用当恶人。" },
  ],
};

export const MINIMALIST_STUDENT_PROFILE: AdminUserProfile = {
  roleName: "极简履行者（屏蔽达人）", managementScale: "同时关注 3 个综合信息频道",
  coreTasks: [
    { title: "信息过滤", description: "从学生会群、年级大群的几百条消息中，捞出真正跟自己有关的通知。" },
    { title: "任务识别", description: "快速分辨「需要我填的表」「需要我缴的费」「需要我确认的截止时间」。" },
    { title: "极速履行", description: "在截止时间之前完成填报、缴费、确认，不留尾巴。" },
  ],
  corePainPoints: [
    { title: "群聊疲劳", description: "打开微信就是 99+，翻半天才找到那条通知，中间夹着几百条「收到」「好的」和表情包。" },
    { title: "漏看焦虑", description: "每次群消息一多就下意识划过，等回过神来发现截止时间已经过了，只能尴尬私聊班长。" },
    { title: "社交负担", description: "不想整天盯着群聊，但又怕错过重要事情，被迫成为「群奴」。" },
  ],
  aiAccessPoints: [
    { title: "噪音过滤", description: "自动剔除闲聊、表情包、「收到」刷屏，只把真正需要你处理的任务以卡片形式置顶。" },
    { title: "免进群秒完成", description: "收到任务卡片后直接在卡片里操作——填表、缴费、确认，不用点进 99+ 的群聊翻找上下文。" },
    { title: "智能提醒", description: "快到截止时间还没处理的任务，系统会悄悄提醒你，不@所有人、不社死、刚刚好。" },
  ],
};

export const OPPORTUNITY_HUNTER_PROFILE: AdminUserProfile = {
  roleName: "机会猎人（抢单射手）", managementScale: "同时盯着 5 个竞赛/志愿/活动招募群",
  coreTasks: [
    { title: "跨群监测", description: "实时扫描多个校级/院级群的招募信息，大创、竞赛、志愿、实习一条都不漏。" },
    { title: "秒级响应", description: "看到高含金量机会的第一时间打开报名链接，跟全校同学拼手速。" },
    { title: "材料速填", description: "学号、班级、手机号、个人简介——每次报名都要重新敲一遍，烦得要死但不敢出错。" },
  ],
  corePainPoints: [
    { title: "信息碎片化", description: "好机会散落在几十个群公告、公众号推文、辅导员朋友圈里，根本盯不过来。" },
    { title: "手慢无", description: "大创队友招募、数学建模组队、支教名额——发出来 3 分钟就满了，全看运气和网速。" },
    { title: "填表地狱", description: "每次抢名额都要重新填一遍表单：学号、班级、手机号、个人陈述……等填完名额早没了。" },
  ],
  aiAccessPoints: [
    { title: "跨频道实时聚合", description: "24 小时监听所有公开频道，把散落的机会按「加分」「社会实践」「省奖」等关键词聚合成一个信息流。" },
    { title: "自动预填秒抢", description: "检测到匹配的机会时，自动把你的学号、班级、手机号预填入报名表，你只需点一下确认。" },
    { title: "自然语言检索", description: "开口就问：「最近有没有能加综测分的竞赛？」——系统直接帮你从几个群的消息里精准筛出来。" },
  ],
};

// ─────────────────────────────────────────────────────
// Teacher search index (for #avoid-minefield tab)
// ─────────────────────────────────────────────────────
export const TEACHER_INDEX: Record<string, MockReview[]> = {};
for (const r of mockReviews) {
  if (r.category === "teacher") {
    if (!TEACHER_INDEX[r.targetName]) TEACHER_INDEX[r.targetName] = [];
    TEACHER_INDEX[r.targetName].push(r);
  }
}