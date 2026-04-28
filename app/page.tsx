"use client";
import React, { useState } from "react";
import {
  Plus,
  MessageCircle,
  Hash,
  Users,
  Compass,
  ChevronLeft,
  Shield,
  Send,
  Bot,
  FileText,
  User,
  Settings,
  Zap,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  X,
  FolderOpen,
  Share,
  Image as ImageIcon,
  Star,
  Sparkles,
  MoreHorizontal,
  Pin,
  PinOff,
  Trash2,
  MapPin,
  Loader2,
  Heart,
} from "lucide-react";

const QUICK_ACTIONS: { id: string; icon: string; label: string; prompt: string; isCustom?: boolean }[] = [
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

const orgList = [
  {
    id: "1",
    name: "我的班级",
    icon: Shield,
    unread: 2,
    summary: "2项高优待办：毕业论文定稿...",
    role: "admin",
    colors: "from-blue-500 to-indigo-600",
    time: "10:24",
  },
  {
    id: "2",
    name: "院学生会",
    icon: Users,
    unread: 3,
    summary: "[AI 总结] 收集“迎新晚会”策划案...",
    role: "member",
    colors: "from-orange-400 to-red-500",
    time: "昨天",
  },
  {
    id: "3",
    name: "志愿者服务",
    icon: Heart,
    unread: 2,
    summary: "[AI 总结] 周末敬老院活动报名名单确认...",
    role: "member",
    colors: "from-green-500 to-emerald-600",
    time: "10-12",
  },
];

const orgContextMap: Record<
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
    aiTitle: "AI 公益小助手",
    initialMessage:
      "温馨提示：“周末敬老院活动”目前尚缺 2 名志愿者报名。您本学期累计志愿时长为 18 小时，距评优还差 2 小时。",
    replyLogic: (text: string) => {
      return "如需报名周末敬老院活动，您可以点击[此处报名链接]。志愿时长认证标准：单次活动服务满3小时计入基础工时，交通补贴等细节可查阅活动细则。";
    },
  },
};

const mockTasks = [
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
export default function App() {
  const [view, setView] = useState<"home" | "class">("home");
  const [activeTab, setActiveTab] = useState<"assistant" | "vault">(
    "assistant",
  );
  const [activeSchoolTab, setActiveSchoolTab] = useState<"orgs" | "feed">(
    "orgs",
  );
  const [currentOrgName, setCurrentOrgName] = useState<string>("我的班级");
  const [currentOrgRole, setCurrentOrgRole] = useState<"admin" | "member">(
    "admin",
  );

  // 新增子视图与 Tab 状态
  const [vaultSubView, setVaultSubView] = useState<"overview" | "tasks">(
    "overview",
  );
  const [taskTab, setTaskTab] = useState<"pending" | "completed">("pending");
  const [adminTaskDesc, setAdminTaskDesc] = useState("");

  // 新增教材征订状态
  const [book1Qty, setBook1Qty] = useState(0);
  const [book2Qty, setBook2Qty] = useState(0);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  // 偏好设置及对话增加状态
  const [showPreferences, setShowPreferences] = useState(false);
  const [persona, setPersona] = useState("摸鱼同桌");
  const [nudgeLevel, setNudgeLevel] = useState("常规");
  const [studentExtraMsgs, setStudentExtraMsgs] = useState<string[]>([]);
  const [activeTaskForm, setActiveTaskForm] = useState<string | null>(null);
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);

  // 问卷状态
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [surveyIntention, setSurveyIntention] = useState("就业");
  const [isSurveySubmitting, setIsSurveySubmitting] = useState(false);

  // 考勤配置状态
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);
  const [qrCodeEnabled, setQrCodeEnabled] = useState(true);
  const [attendancePublished, setAttendancePublished] = useState(false);

  // 教材征订状态
  const [orderAmount, setOrderAmount] = useState({ law: 0, civil: 0 });
  const [orderLocked, setOrderLocked] = useState(false);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 分享海报状态
  const [showPosterShare, setShowPosterShare] = useState(false);

  // 底部输入框状态
  const [chatInput, setChatInput] = useState("");
  const [pinnedIds, setPinnedIds] = useState<string[]>(["sign", "notice"]);
  const [showMorePanel, setShowMorePanel] = useState(false);
  const [isGlobalAiExpanded, setIsGlobalAiExpanded] = useState(false);

  // 消息会话闭环状态
  const [messages, setMessages] = useState<
    {
      id: string;
      role: "user" | "ai";
      type: "text" | "books" | "checkin";
      content?: string;
    }[]
  >([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking, activeTab]);

  React.useEffect(() => {
    if (view === "class") {
      const context =
        orgContextMap[currentOrgName] || orgContextMap["我的班级"];
      setMessages([
        {
          id: "initial",
          role: "ai",
          type: "text",
          content: context.initialMessage,
        },
      ]);
      setChatInput("");
    }
  }, [view, currentOrgName, currentOrgRole]);

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", type: "text", content: text },
    ]);
    setChatInput("");
    setIsAiThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          contextTitle: currentOrgName,
        }),
      });

      const data = await response.json();
      const reply = response.ok ? data.reply : "抱歉，服务器出现了点问题。";

      const newMsg: {
        id: string;
        role: "ai";
        type: "text" | "books" | "checkin";
        content?: string;
      } = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        type: "text",
        content: reply,
      };

      setMessages((prev) => [...prev, newMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: typeof messages[0] = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        type: "text",
        content: "网络连接失败，请稍后重试。",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // 自定义指令状态
  const [customActions, setCustomActions] = useState<
    {
      id: string;
      icon: string;
      label: string;
      prompt: string;
      isCustom: boolean;
    }[]
  >([]);
  const [showAddCustomAction, setShowAddCustomAction] = useState(false);
  const [newActionLabel, setNewActionLabel] = useState("");
  const [newActionPrompt, setNewActionPrompt] = useState("");

  const allActions = [...QUICK_ACTIONS, ...customActions];

  // 资产仓应用状态
  const [activeApp, setActiveApp] = useState<"files" | "albums" | "highlights">(
    "files",
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleOrderSubmit = () => {
    setIsOrderSubmitting(true);
    setTimeout(() => {
      setIsOrderSubmitting(false);
      setOrderLocked(true);
    }, 1000);
  };

  // 任务处理
  const handleTaskSubmit = () => {
    setIsTaskSubmitting(true);
    setTimeout(() => {
      setIsTaskSubmitting(false);
      setActiveTaskForm(null);
    }, 1000);
  };

  const handleSurveySubmit = () => {
    setIsSurveySubmitting(true);
    setTimeout(() => {
      setIsSurveySubmitting(false);
      setShowSurveyForm(false);
      setSurveySubmitted(true);
      setStudentExtraMsgs((prev) => [
        ...prev,
        "✅ 收到！你的《毕业流向调查》已完成结构化归档，进度已同步至班委大盘。",
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4 antialiased sm:p-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Physical Container Limit */}
      <div className="w-[390px] h-[844px] bg-[#f6f7f9] rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col border-[12px] border-[#101010] shrink-0">
        {/* Fake Phone Notch */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none">
          <div className="w-[124px] h-7 bg-[#101010] rounded-b-3xl"></div>
        </div>

        {/* --- STATE 1: HOME VIEW --- */}
        {view === "home" && (
          <div className="flex flex-col h-full relative">
            {/* Top Global Navigation Container */}
            <div className="pt-[54px] pb-0 px-0 bg-white sticky top-0 z-40 flex flex-col border-b border-zinc-100/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] shrink-0">
              {/* Layer 1: Main Title Area */}
              <div className="flex items-center justify-between px-3 h-10 w-full">
                <div className="w-10 h-10 flex items-center justify-start">
                  <button className="text-zinc-900 p-1 active:bg-zinc-100 rounded-full transition-colors opacity-0 pointer-events-none">
                    <ChevronLeft size={28} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="flex-1 flex justify-center items-center">
                  <span className="text-[18px] font-bold text-black tracking-wide">
                    我的学校
                  </span>
                </div>
                <div className="w-10 h-10 flex items-center justify-end">
                  <button className="text-zinc-900 p-1 active:bg-zinc-100 rounded-full transition-colors">
                    <Plus size={26} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Layer 2: Sub Tabs */}
              <div className="flex justify-center items-center space-x-12 mt-1 relative w-full">
                <button
                  onClick={() => setActiveSchoolTab("orgs")}
                  className={`text-[15px] pb-2 transition-colors relative font-medium ${
                    activeSchoolTab === "orgs"
                      ? "text-blue-500 font-bold"
                      : "text-zinc-500"
                  }`}
                >
                  我的组织
                  {activeSchoolTab === "orgs" && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveSchoolTab("feed")}
                  className={`text-[15px] pb-2 transition-colors relative font-medium ${
                    activeSchoolTab === "feed"
                      ? "text-blue-500 font-bold"
                      : "text-zinc-500"
                  }`}
                >
                  校园动态
                  {activeSchoolTab === "feed" && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-hidden relative bg-[#f6f7f9] w-full">
              <div
                className="flex w-[200%] h-full transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(${activeSchoolTab === "orgs" ? "0%" : "-50%"})`,
                }}
              >
                {/* Left Page: Organizations (List Mode) */}
                <div className="w-1/2 h-full overflow-y-auto px-3 pt-3 pb-[100px] hide-scrollbar space-y-2.5">
                  {/* AI 全局调度中心卡片 */}
                  <div
                    className="bg-blue-50 border border-blue-100 rounded-[20px] p-4 shadow-sm relative overflow-hidden flex flex-col gap-2 cursor-pointer transition-all active:scale-[0.98]"
                    onClick={() => setIsGlobalAiExpanded(!isGlobalAiExpanded)}
                  >
                    <div className="flex items-center gap-2 z-10 w-full">
                      <Sparkles size={18} className="text-blue-500 shrink-0" />
                      <span className="text-[14px] font-bold text-blue-900 truncate">
                        {isGlobalAiExpanded ? "AI 统筹" : "AI 统筹：今日 2 项紧急待办未结"}
                      </span>
                    </div>
                    {isGlobalAiExpanded && (
                      <div className="text-[13px] text-blue-800/80 leading-relaxed z-10 font-medium mt-1">
                        今天你有 <span className="text-blue-900 font-bold">2</span> 项跨组织的紧急待办。<br/>
                        班级：<span className="text-blue-900 font-bold">期中论文定稿</span> (剩 5 小时)<br/>
                        院学生会：<span className="text-blue-900 font-bold">策划案初稿</span> (剩 1 天)
                      </div>
                    )}
                  </div>

                  {orgList.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => {
                        setCurrentOrgName(org.name);
                        setCurrentOrgRole(org.role as "admin" | "member");
                        setView("class");
                      }}
                      className="flex items-center bg-white p-3.5 rounded-[20px] active:scale-[0.98] transition-all cursor-pointer select-none shadow-sm relative"
                    >
                      {/* Left Avatar */}
                      <div
                        className={`w-[48px] h-[48px] bg-gradient-to-br ${org.colors} rounded-[16px] flex items-center justify-center shrink-0 shadow-inner overflow-hidden relative`}
                      >
                        <org.icon
                          fill={org.id === "1" ? "currentColor" : "none"}
                          className={`text-white/20 w-7 h-7 absolute ${org.id === "1" ? "block" : "hidden"}`}
                        />
                        <org.icon className="text-white w-6 h-6 stroke-[2] relative z-10" />
                      </div>

                      {/* Center Content */}
                      <div className="flex-1 ml-3.5 min-w-0 pr-[4.5rem]">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className="font-bold text-[16px] text-zinc-900 truncate tracking-tight">
                            {org.name}
                          </div>
                        </div>
                        <div className="text-[13px] text-zinc-500 mt-0.5 truncate">
                          {org.id === "1" ? (
                            <span className="text-[#f54f46] font-medium shrink-0">
                              🔴{" "}
                              {org.role === "admin"
                                ? "3人未交：毕业论文定稿..."
                                : "2项高优待办：毕业论文定稿..."}
                            </span>
                          ) : (
                            org.summary
                          )}
                        </div>
                      </div>

                      {/* Right Metadata */}
                      <div className="flex flex-col items-end shrink-0 pl-1 self-stretch pt-0.5 justify-between absolute right-3.5 top-3.5 bottom-3.5">
                        <span className="text-zinc-400 text-[11px] font-medium">
                          {org.time}
                        </span>

                        <div className="flex flex-col items-end gap-1">
                          {org.role === "admin" ? (
                            <div className="px-1.5 py-0.5 rounded bg-blue-500 text-white text-[10px] font-bold">
                              管理员
                            </div>
                          ) : (
                            <div className="px-1.5 py-0.5 rounded bg-[#ebedf0] text-[#555] text-[10px] font-bold">
                              成员
                            </div>
                          )}

                          {org.unread > 0 && (
                            <div className="min-w-[18px] h-[18px] bg-[#f54f46] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-[0_2px_6px_rgba(245,79,70,0.3)] mt-0.5">
                              {org.unread}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Page: Feed (Waterfall Mode) */}
                <div className="w-1/2 h-full overflow-y-auto px-3 pt-3 pb-[100px] hide-scrollbar space-y-3">
                  {/* AI Hot Topics Box */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[18px] p-4 shadow-sm border border-blue-100/50 overflow-hidden">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Sparkles size={16} className="text-blue-500" />
                      <span className="text-[14px] font-bold text-blue-900">
                        AI 校园热搜
                      </span>
                    </div>
                    <div className="h-[28px] overflow-hidden relative">
                      <div className="flex flex-col gap-2 text-[12.5px] text-blue-600 font-medium animate-scroll">
                        <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          #民法典讲座 提前排队
                        </div>
                        <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          #二食堂炸鸡 恢复营业啦！
                        </div>
                        <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          #英语四级报名 还有最后2天
                        </div>
                        {/* Duplicate for smooth scroll */}
                        <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          #民法典讲座 提前排队
                        </div>
                        <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          #二食堂炸鸡 恢复营业啦！
                        </div>
                        <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          #英语四级报名 还有最后2天
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feed Item 1 */}
                  <div
                    onClick={() => alert("进入帖子详情")}
                    className="bg-white rounded-[20px] p-4 flex flex-col gap-2 shadow-sm active:scale-95 transition-transform cursor-pointer"
                  >
                    {/* User info */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-zinc-200"></div>
                      <span className="text-[12px] text-zinc-500 font-medium">
                        吃货小分队
                      </span>
                    </div>

                    <div className="text-[14px] font-medium text-zinc-800 line-clamp-2 leading-relaxed">
                      谁知道二食堂那家炸鸡什么时候恢复营业啊？等好几天了，真的很想吃😭
                    </div>
                    <div className="flex items-center justify-between text-zinc-400 mt-2">
                      <span className="text-[11px]">10分钟前</span>
                      <div className="flex items-center gap-2.5">
                        <MessageCircle size={16} />
                        <span className="text-[11px]">12</span>
                      </div>
                    </div>
                    {/* AI Summary Button */}
                    <div
                      className="mt-2 text-blue-500 bg-blue-50/80 px-3 py-2 rounded-xl text-[12px] flex items-center gap-1.5 active:bg-blue-100/80 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(
                          "AI 摘要：发帖人正在询问二食堂炸鸡店的恢复营业时间，已有12人参与讨论。",
                        );
                      }}
                    >
                      <Bot size={14} />
                      <span className="font-bold">AI 摘要</span>
                    </div>
                  </div>

                  {/* Feed Item 2 */}
                  <div
                    onClick={() => alert("进入帖子详情")}
                    className="bg-white rounded-[20px] p-4 flex flex-col gap-2 shadow-sm active:scale-95 transition-transform cursor-pointer"
                  >
                    {/* User info */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-zinc-200"></div>
                      <span className="text-[12px] text-zinc-500 font-medium">
                        法学院小透明
                      </span>
                    </div>

                    <div className="text-[14px] font-medium text-zinc-800 line-clamp-2 leading-relaxed">
                      这周四下午的民法典讲座有人去吗？我占座多一个位置，先到先得~
                    </div>
                    <div className="w-full h-[120px] bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center mt-1">
                      <ImageIcon size={28} className="text-zinc-300" />
                    </div>
                    <div className="flex items-center justify-between text-zinc-400 mt-2">
                      <span className="text-[11px]">45分钟前</span>
                      <div className="flex items-center gap-2.5">
                        <MessageCircle size={16} />
                        <span className="text-[11px]">34</span>
                      </div>
                    </div>
                    {/* AI Summary Button */}
                    <div
                      className="mt-2 text-blue-500 bg-blue-50/80 px-3 py-2 rounded-xl text-[12px] flex items-center gap-1.5 active:bg-blue-100/80 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(
                          "AI 摘要：发帖人提供一个周四下午民法典讲座的占位，目前已有34人留言。",
                        );
                      }}
                    >
                      <Bot size={14} />
                      <span className="font-bold">AI 摘要</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Global Navigation */}
            <div className="absolute bottom-0 inset-x-0 h-[88px] bg-white/95 backdrop-blur-xl border-t border-zinc-200/60 flex justify-around items-start pt-[14px] px-2 z-40 shrink-0 select-none">
              <button className="flex flex-col items-center gap-1.5 w-[70px] text-zinc-400">
                <MessageCircle size={24} strokeWidth={2.5} className="mb-0.5" />
                <span className="text-[11px] font-bold">消息</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 w-[70px] text-blue-500">
                <div className="relative">
                  <Hash size={24} strokeWidth={3} className="mb-0.5" />
                  <div className="absolute -top-1 -right-1 w-[9px] h-[9px] bg-[#f54f46] rounded-full border-[1.5px] border-white"></div>
                </div>
                <span className="text-[11px] font-bold">频道</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 w-[70px] text-zinc-400">
                <Users size={24} strokeWidth={2.5} className="mb-0.5" />
                <span className="text-[11px] font-bold">联系人</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 w-[70px] text-zinc-400">
                <Compass size={24} strokeWidth={2.5} className="mb-0.5" />
                <span className="text-[11px] font-bold">动态</span>
              </button>
            </div>
          </div>
        )}

        {/* --- STATE 2: CLASS SPACE VIEW --- */}
        {view === "class" && (
          <div className="flex flex-col h-full bg-[#f6f7f9] relative overflow-hidden">
            {/* Class Top Nav */}
            <div className="pt-[52px] pb-2.5 px-3 bg-[#f6f7f9] sticky top-0 z-40 flex items-center shrink-0">
              <button
                onClick={() => setView("home")}
                className="p-1.5 -ml-1.5 text-zinc-900 active:bg-zinc-200/60 rounded-full transition-colors flex items-center absolute left-3"
              >
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
              <div className="text-[18px] font-bold text-black tracking-wide w-full text-center pointer-events-none truncate px-10">
                {currentOrgName}
              </div>
              <button className="p-1.5 -mr-1.5 text-zinc-900 active:bg-zinc-200/60 rounded-full transition-colors flex items-center absolute right-3">
                <MoreHorizontal size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* Tab Toggle (Level Tabs) */}
            <div className="flex px-4 shrink-0 bg-[#f6f7f9] relative z-30 pt-1 border-b border-zinc-200/50">
              <div className="flex w-full justify-center gap-10 pb-2 relative">
                <button
                  onClick={() => setActiveTab("assistant")}
                  className={`text-[15px] pb-1.5 transition-colors relative font-medium ${activeTab === "assistant" ? "text-blue-500 font-bold" : "text-zinc-500"}`}
                >
                  {currentOrgRole === "member" ? "智能助理" : "呼叫 AI"}
                  {activeTab === "assistant" && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("vault")}
                  className={`text-[15px] pb-1.5 transition-colors relative font-medium ${activeTab === "vault" ? "text-blue-500 font-bold" : "text-zinc-500"}`}
                >
                  {currentOrgRole === "member" ? "智能资产仓" : "管理工作台"}
                  {activeTab === "vault" && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {/* Inner Tab Content Router */}
            <div className="flex-1 overflow-hidden relative bg-[#f6f7f9]">
              {/* Tab 1: Assistant / Call AI */}
              {activeTab === "assistant" && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 hide-scrollbar flex flex-col pb-32">
                    {/* Chat Timeline Note */}
                    <div className="text-center mt-2 mb-4">
                      <span className="text-zinc-400 font-medium text-[12px] flex items-center justify-center gap-1.5 mb-1">
                        <Bot size={14} />
                        {orgContextMap[currentOrgName]?.aiTitle || "AI 助手"}
                      </span>
                    </div>

                    {/* Shared Messages Loop for Live Demo */}
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[92%] items-start animate-in fade-in slide-in-from-bottom-2 duration-300 w-full ${msg.role === "user" ? "self-end flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 text-white shadow-sm ${msg.role === "user" ? "bg-slate-800" : "bg-gradient-to-br from-indigo-500 to-blue-500 font-bold"}`}
                        >
                          {msg.role === "user" ? (
                            <User size={20} />
                          ) : (
                            <Bot size={20} />
                          )}
                        </div>

                        {/* Render Text Content */}
                        {msg.type === "text" && (
                          <div
                            className={`${msg.role === "user" ? "bg-blue-500 text-white rounded-tr-sm text-left" : "bg-white text-zinc-800 rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)]"} px-4 py-3.5 rounded-[20px] text-[15px] leading-relaxed`}
                          >
                            {msg.content}
                          </div>
                        )}

                        {/* Render Component Books */}
                        {msg.type === "books" && (
                          <div className="bg-white rounded-[20px] rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-blue-100/60 overflow-hidden w-full">
                            <div className="bg-blue-50/80 px-3.5 py-2.5 border-b border-blue-100/50 flex items-center gap-1.5">
                              <Zap size={15} className="text-blue-500" />
                              <span className="text-[13px] font-bold text-blue-900">
                                教材征订 (智能分发)
                              </span>
                            </div>
                            <div className="p-4 flex flex-col items-center justify-center py-6">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-blue-500">
                                <Bot size={24} />
                              </div>
                              <span className="text-[14px] font-bold text-zinc-800 tracking-tight">
                                已向全班下发征订卡片
                              </span>
                              <span className="text-[12px] text-zinc-500 mt-1">
                                学生确权后将自动留存在工作台
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Render Component Checkin */}
                        {msg.type === "checkin" && (
                          <div className="bg-white rounded-[20px] rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden w-full border border-blue-100/60">
                            <div className="bg-indigo-50/80 px-4 py-3 border-b border-indigo-100/50 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                  <MapPin size={12} strokeWidth={3} />
                                </div>
                                <span className="text-[14px] font-bold text-indigo-900">
                                  晚自习签到
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-indigo-500 bg-indigo-100/50 px-2 py-0.5 rounded-md">
                                进行中
                              </span>
                            </div>
                            <div className="p-4 space-y-3.5">
                              <div className="flex justify-between items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                                <span className="text-[13px] text-zinc-500 font-medium">
                                  有效定位范围
                                </span>
                                <span className="text-[13px] text-zinc-800 font-bold">
                                  500米内
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  alert(
                                    currentOrgRole === "member"
                                      ? "已获取你的地理位置：匹配成功！"
                                      : "正在开发管理员查阅看板...",
                                  )
                                }
                                className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl active:bg-indigo-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                              >
                                {currentOrgRole === "member" ? (
                                  <>
                                    <Compass size={18} /> 一键立即签到
                                  </>
                                ) : (
                                  "查看签到大屏看板"
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* AI Thinking Animation */}
                    {isAiThinking && (
                      <div className="flex gap-2.5 max-w-[92%] items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shrink-0 text-white shadow-sm font-bold">
                          <Bot size={20} />
                        </div>
                        <div className="bg-white px-5 py-4 rounded-[20px] rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    )}

                    <div
                      ref={messagesEndRef}
                      className="h-4 w-full shrink-0"
                    ></div>
                  </div>

                  {/* Fixed Chat Input Area */}
                  <div className="bg-[#f6f7f9] border-t border-zinc-200/80 pt-2 pb-[34px] shrink-0 absolute bottom-0 w-full z-20 flex flex-col">
                    {/* Quick Actions (Admin Only) */}
                    {currentOrgRole === "admin" &&
                      activeTab === "assistant" && (
                        <div className="overflow-x-auto hide-scrollbar flex gap-2 px-3 pb-2 w-full">
                          {allActions
                            .filter((action) => pinnedIds.includes(action.id))
                            .map((action) => (
                              <button
                                key={action.id}
                                onClick={() => setChatInput(action.prompt)}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 whitespace-nowrap active:bg-gray-50 flex items-center justify-center shrink-0"
                              >
                                {action.icon === "✨" ? (
                                  <Sparkles
                                    size={14}
                                    className="text-blue-500 mr-1"
                                  />
                                ) : (
                                  <span className="mr-1">{action.icon}</span>
                                )}{" "}
                                {action.label}
                              </button>
                            ))}
                          <div className="shrink-0 flex items-center justify-center pr-1 w-8">
                            <button
                              onClick={() => setShowMorePanel(true)}
                              className="w-[26px] h-[26px] bg-gray-100 rounded-full flex items-center justify-center active:bg-gray-200"
                            >
                              <MoreHorizontal
                                size={14}
                                className="text-gray-500"
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    <div className="flex items-center gap-2.5 w-full px-3">
                      <button
                        onClick={() => {
                          if (currentOrgRole === "member") {
                            alert("AI 提示：该操作仅限管理员使用");
                          } else {
                            setShowMorePanel(true);
                          }
                        }}
                        className="w-[36px] h-[36px] flex items-center justify-center text-zinc-500 rounded-full active:bg-zinc-200 shrink-0"
                      >
                        <Plus size={24} strokeWidth={2.5} />
                      </button>
                      <div className="flex-1 h-[44px] bg-white rounded-full border border-zinc-200/80 flex items-center px-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-blue-400 transition-colors">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSend();
                          }}
                          placeholder={
                            currentOrgRole === "member"
                              ? "和智能助理聊聊..."
                              : "下发指令或通知..."
                          }
                          className="flex-1 bg-transparent text-[15px] outline-none text-zinc-900 placeholder-zinc-400 font-medium"
                        />
                      </div>
                      <button
                        onClick={handleSend}
                        className="w-[44px] h-[44px] bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0 active:bg-blue-600 active:scale-95 transition-all shadow-sm"
                      >
                        <Send
                          size={18}
                          className="translate-x-[1px] translate-y-[1px]"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Vault / Workbench */}
              {activeTab === "vault" && (
                <div className="flex flex-col h-full overflow-y-auto px-4 pt-4 space-y-4 pb-32 hide-scrollbar">
                  {currentOrgRole === "member" ? (
                    <>
                      {/* Student View: Vault Content */}
                      {vaultSubView === "overview" ? (
                        <>
                          {/* My Tasks Entry */}
                          <div
                            onClick={() => setVaultSubView("tasks")}
                            className="bg-white rounded-[24px] p-5 border border-zinc-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
                          >
                            <div>
                              <h3 className="font-bold text-zinc-900 text-[17px] tracking-tight">
                                我的任务
                              </h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.5)]"></div>
                                <p className="text-[13.5px] text-zinc-500 font-medium">
                                  剩余 1 项高优待办未结
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative w-14 h-14 shrink-0">
                                <svg
                                  className="w-full h-full -rotate-90"
                                  viewBox="0 0 36 36"
                                >
                                  <path
                                    className="text-zinc-100"
                                    strokeWidth="3.5"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className="text-blue-500"
                                    strokeWidth="3.5"
                                    strokeDasharray="80, 100"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[12px] font-bold text-zinc-800">
                                  80%
                                </div>
                              </div>
                              <ChevronRight
                                size={20}
                                className="text-zinc-400"
                              />
                            </div>
                          </div>

                          {/* QQ App Menu */}
                          <div className="flex items-center justify-around bg-white rounded-[24px] px-2 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-zinc-100/50 mt-1">
                            {/* File App */}
                            <div
                              onClick={() => setActiveApp("files")}
                              className="flex flex-col items-center gap-2.5 cursor-pointer active:scale-95 transition-all w-20"
                            >
                              <div
                                className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center transition-all ${activeApp === "files" ? "bg-amber-100 border-[2.5px] border-amber-300 shadow-sm" : "bg-amber-50/70 border border-transparent"}`}
                              >
                                <FolderOpen
                                  size={24}
                                  className={
                                    activeApp === "files"
                                      ? "text-amber-500"
                                      : "text-amber-400"
                                  }
                                />
                              </div>
                              <span
                                className={`text-[12px] font-bold transition-colors ${activeApp === "files" ? "text-zinc-900" : "text-zinc-500"}`}
                              >
                                智能文件
                              </span>
                            </div>

                            {/* Albums App */}
                            <div
                              onClick={() => setActiveApp("albums")}
                              className="flex flex-col items-center gap-2.5 cursor-pointer active:scale-95 transition-all w-20"
                            >
                              <div
                                className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center transition-all ${activeApp === "albums" ? "bg-blue-100 border-[2.5px] border-blue-300 shadow-sm" : "bg-blue-50/70 border border-transparent"}`}
                              >
                                <ImageIcon
                                  size={24}
                                  className={
                                    activeApp === "albums"
                                      ? "text-blue-500"
                                      : "text-blue-400"
                                  }
                                />
                              </div>
                              <span
                                className={`text-[12px] font-bold transition-colors ${activeApp === "albums" ? "text-zinc-900" : "text-zinc-500"}`}
                              >
                                智能相册
                              </span>
                            </div>

                            {/* Highlights App */}
                            <div
                              onClick={() => setActiveApp("highlights")}
                              className="flex flex-col items-center gap-2.5 cursor-pointer active:scale-95 transition-all w-20"
                            >
                              <div
                                className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center transition-all ${activeApp === "highlights" ? "bg-emerald-100 border-[2.5px] border-emerald-300 shadow-sm" : "bg-emerald-50/70 border border-transparent"}`}
                              >
                                <Star
                                  size={24}
                                  className={
                                    activeApp === "highlights"
                                      ? "text-emerald-500"
                                      : "text-emerald-400"
                                  }
                                />
                              </div>
                              <span
                                className={`text-[12px] font-bold transition-colors ${activeApp === "highlights" ? "text-zinc-900" : "text-zinc-500"}`}
                              >
                                智能精华
                              </span>
                            </div>
                          </div>

                          {/* Dynamic Content */}
                          <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {activeApp === "files" && (
                              currentOrgName === "我的班级" ? (
                              <div className="space-y-4">
                                <div className="bg-blue-50/80 border border-blue-100 rounded-[20px] p-4 flex gap-3 relative overflow-hidden">
                                  <div className="absolute -right-4 -top-4 opacity-10">
                                    <Bot size={80} />
                                  </div>
                                  <Sparkles
                                    className="text-blue-500 shrink-0 mt-0.5"
                                    size={18}
                                  />
                                  <div>
                                    <h4 className="text-[14px] font-bold text-blue-900 mb-1 tracking-tight">
                                      AI 本周摘要
                                    </h4>
                                    <p className="text-[13px] text-blue-800/80 leading-relaxed font-medium">
                                      本周新增 3
                                      份文件。重点涉及《民法典》第三章相关阅读材料定稿，全班已悉数获取。
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-white rounded-[24px] border border-zinc-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                                  <div className="flex items-center justify-between p-4 px-5 border-b border-zinc-50 relative cursor-pointer active:bg-zinc-50">
                                    <div className="flex items-center gap-3.5 min-w-0 pr-3">
                                      <div className="w-[42px] h-[42px] bg-red-50 border border-red-100 rounded-[14px] flex items-center justify-center shrink-0">
                                        <FileText className="text-red-500 w-[22px] h-[22px]" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-[15px] font-bold text-zinc-900 truncate">
                                          毕业论文_初稿_v1.pdf
                                        </div>
                                        <div className="text-[12.5px] text-zinc-400 mt-0.5 whitespace-nowrap">
                                          2.4 MB · 昨天 14:00 归档
                                        </div>
                                      </div>
                                    </div>
                                    <span className="shrink-0 bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                      重要
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between p-4 px-5 cursor-pointer active:bg-zinc-50">
                                    <div className="flex items-center gap-3.5 min-w-0 pr-3">
                                      <div className="w-[42px] h-[42px] bg-amber-50 border border-amber-100 rounded-[14px] flex items-center justify-center shrink-0">
                                        <FileText className="text-amber-500 w-[22px] h-[22px]" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-[15px] font-bold text-zinc-900 truncate">
                                          民法典_第三章补充.docx
                                        </div>
                                        <div className="text-[12.5px] text-zinc-400 mt-0.5 whitespace-nowrap">
                                          1.1 MB · 3天前 归档
                                        </div>
                                      </div>
                                    </div>
                                    <span className="shrink-0 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                      最新
                                    </span>
                                  </div>
                                </div>
                              </div>
                              ) : (
                                <div className="bg-white rounded-[24px] border border-zinc-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-[240px] flex flex-col items-center justify-center">
                                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                                    <FolderOpen size={28} className="text-zinc-300" />
                                  </div>
                                  <p className="text-[14px] font-bold text-zinc-400">
                                    当前组织暂无文件
                                  </p>
                                </div>
                              )
                            )}

                            {activeApp === "albums" && (
                              currentOrgName === "我的班级" ? (
                              <div className="space-y-4">
                                <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
                                  <div className="px-4 py-2 bg-blue-600 text-white text-[13px] font-bold rounded-full shrink-0 shadow-[0_2px_8px_rgba(37,99,235,0.25)]">
                                    #行政存证
                                  </div>
                                  <div className="px-4 py-2 bg-white border border-zinc-200 text-zinc-500 text-[13px] font-bold rounded-full shrink-0 shadow-sm">
                                    #活动合照
                                  </div>
                                  <div className="px-4 py-2 bg-white border border-zinc-200 text-zinc-500 text-[13px] font-bold rounded-full shrink-0 shadow-sm">
                                    #获奖证书
                                  </div>
                                  <div className="px-4 py-2 bg-white border border-zinc-200 text-zinc-500 text-[13px] font-bold rounded-full shrink-0 shadow-sm">
                                    #其他
                                  </div>
                                </div>

                                <div className="bg-white p-4 rounded-[24px] border border-zinc-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="aspect-square bg-zinc-100 rounded-xl"></div>
                                    <div className="aspect-square bg-zinc-100 rounded-xl"></div>
                                    <div className="aspect-square bg-zinc-100 rounded-xl"></div>
                                    <div className="aspect-square bg-zinc-100 rounded-xl"></div>
                                    <div className="aspect-square bg-zinc-100 rounded-xl"></div>
                                    <div className="aspect-square bg-zinc-100 rounded-xl"></div>
                                  </div>
                                  <p className="text-center text-[12px] text-zinc-400 font-medium mt-4">
                                    AI 已为你自动归档 128 张存证截图
                                  </p>
                                </div>
                              </div>
                              ) : (
                                <div className="bg-white rounded-[24px] border border-zinc-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-[240px] flex flex-col items-center justify-center">
                                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                                    <ImageIcon size={28} className="text-zinc-300" />
                                  </div>
                                  <p className="text-[14px] font-bold text-zinc-400">
                                    当前组织暂无相片
                                  </p>
                                </div>
                              )
                            )}

                            {activeApp === "highlights" && (
                              <div className="bg-white rounded-[24px] border border-zinc-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-[240px] flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                                  <Star size={28} className="text-zinc-300" />
                                </div>
                                <p className="text-[14px] font-bold text-zinc-400">
                                  暂无精华内容
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                          {activeTaskForm ? (
                            <div className="flex flex-col h-full">
                              <div
                                onClick={() => setActiveTaskForm(null)}
                                className="flex items-center gap-1 mb-4 -ml-2 px-2 cursor-pointer active:opacity-70 w-fit"
                              >
                                <ChevronLeft
                                  size={22}
                                  className="text-zinc-500"
                                />
                                <span className="text-[16px] font-bold text-zinc-800">
                                  返回
                                </span>
                              </div>

                              <h2 className="text-[20px] font-bold text-zinc-900 px-1.5 mb-5">
                                {activeTaskForm === "thesis"
                                  ? "期中论文定稿及查重报告"
                                  : "综测加分证明材料确认"}
                              </h2>

                              {activeTaskForm === "thesis" && (
                                <div className="px-1.5 space-y-4 flex-1">
                                  <div className="border-2 border-dashed border-zinc-200 rounded-[20px] h-32 flex flex-col items-center justify-center bg-zinc-50">
                                    <span className="text-zinc-400 font-medium text-[14px]">
                                      拖拽或点击上传文件 (仅限 PDF)
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[11px] font-bold text-zinc-400 block mb-1">
                                      AI 预填命名
                                    </span>
                                    <div className="relative">
                                      <input
                                        type="text"
                                        value="2026_法学1班_张三_期中论文.pdf"
                                        readOnly
                                        className="w-full bg-green-50 border border-green-200 rounded-lg pl-8 pr-3 py-2 text-[13px] font-bold text-green-700 outline-none"
                                      />
                                      <Check
                                        size={16}
                                        className="text-green-500 absolute left-2.5 top-1/2 -translate-y-1/2"
                                      />
                                    </div>
                                  </div>

                                  <button
                                    onClick={handleTaskSubmit}
                                    disabled={isTaskSubmitting}
                                    className={`w-full mt-4 font-bold text-[14px] py-3 rounded-xl transition-all ${isTaskSubmitting ? "bg-zinc-200 text-zinc-500" : "bg-blue-600 text-white active:bg-blue-700"}`}
                                  >
                                    {isTaskSubmitting
                                      ? "AI 存证中..."
                                      : "确认无误，归档提交"}
                                  </button>
                                </div>
                              )}

                              {activeTaskForm === "score" && (
                                <div className="px-1.5 space-y-4 flex-1">
                                  <div className="bg-white rounded-[20px] p-4 border border-zinc-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                    <h3 className="text-[13px] font-bold text-zinc-500 mb-3 block border-b border-zinc-100 pb-2">
                                      本学期素拓得分明细
                                    </h3>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center text-[14px]">
                                        <span className="text-zinc-800 font-medium">
                                          青年大学习学习打卡
                                        </span>
                                        <span className="font-bold text-green-600">
                                          +2.0
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-[14px]">
                                        <span className="text-zinc-800 font-medium">
                                          秋季运动会志愿者
                                        </span>
                                        <span className="font-bold text-green-600">
                                          +1.5
                                        </span>
                                      </div>
                                      <div className="pt-3 border-t border-zinc-100 flex justify-between items-center">
                                        <span className="text-[14px] font-bold text-zinc-900">
                                          总计确权分数
                                        </span>
                                        <span className="text-[18px] font-black text-zinc-900">
                                          3.5
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2.5 mt-2">
                                    <button className="w-full bg-red-50 text-red-600 font-bold text-[14px] py-3 rounded-xl active:bg-red-100 transition-colors">
                                      对此数据有异议
                                    </button>
                                    <button
                                      onClick={handleTaskSubmit}
                                      disabled={isTaskSubmitting}
                                      className={`w-full font-bold text-[14px] py-3 rounded-xl transition-all ${isTaskSubmitting ? "bg-zinc-200 text-zinc-500" : "bg-blue-600 text-white active:bg-blue-700"}`}
                                    >
                                      {isTaskSubmitting
                                        ? "AI 存证中..."
                                        : "确认无误，一键电子签名"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              {/* Sub-view Header */}
                              <div
                                onClick={() => setVaultSubView("overview")}
                                className="flex items-center gap-1 mb-4 -ml-2 px-2 cursor-pointer active:opacity-70 w-fit"
                              >
                                <ChevronLeft
                                  size={22}
                                  className="text-zinc-500"
                                />
                                <span className="text-[16px] font-bold text-zinc-800">
                                  返回
                                </span>
                              </div>

                              <h2 className="text-[20px] font-bold text-zinc-900 px-1.5 mb-4">
                                我的任务
                              </h2>

                              {/* Task Tabs */}
                              <div className="flex gap-6 border-b border-zinc-200/60 pb-2.5 mb-4 px-2">
                                <button
                                  onClick={() => setTaskTab("pending")}
                                  className={`text-[14px] font-bold relative transition-colors ${taskTab === "pending" ? "text-zinc-900" : "text-zinc-400"}`}
                                >
                                  未完成
                                  {taskTab === "pending" && (
                                    <div className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
                                  )}
                                </button>
                                <button
                                  onClick={() => setTaskTab("completed")}
                                  className={`text-[14px] font-bold relative transition-colors ${taskTab === "completed" ? "text-zinc-900" : "text-zinc-400"}`}
                                >
                                  已完成
                                  {taskTab === "completed" && (
                                    <div className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
                                  )}
                                </button>
                              </div>

                              {/* Task Lists */}
                              <div className="space-y-3">
                                {mockTasks.filter(t => t.sourceOrg === currentOrgName && t.status === taskTab).length === 0 ? (
                                  <div className="text-center py-10 mt-6 cursor-default">
                                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <Check size={28} className="text-zinc-400" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-[16px] font-bold text-zinc-800 mb-1">
                                      当前组织暂无待办事项
                                    </h3>
                                    <p className="text-[13px] text-zinc-500">
                                      太棒了，所有任务都已清空
                                    </p>
                                  </div>
                                ) : (
                                  mockTasks.filter(t => t.sourceOrg === currentOrgName && t.status === taskTab).map(task => {
                                    if (task.status === "pending") {
                                      if (task.formId === "textbook") {
                                        return (
                                          <div key={task.id} className="bg-white rounded-[20px] p-4 border border-blue-100 shadow-[0_2px_12px_rgba(37,99,235,0.04)]">
                                            <div>
                                              <h4 className="text-[15px] font-bold text-zinc-900 mb-1.5 flex items-center justify-between">
                                                <span>教材征订</span>
                                                {orderLocked && (
                                                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                    已确权
                                                  </span>
                                                )}
                                              </h4>
                                              <div className="space-y-3 mt-4 mb-4">
                                                <div className="flex items-center justify-between">
                                                  <div className="flex flex-col">
                                                    <span className="text-[14px] font-medium text-zinc-800">《法理学》</span>
                                                    <span className="text-[12px] font-bold text-zinc-400">￥45.00</span>
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                    <button
                                                      onClick={() => setOrderAmount((prev) => ({ ...prev, law: Math.max(0, prev.law - 1) }))}
                                                      disabled={orderLocked}
                                                      className={`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors ${orderLocked ? "text-zinc-300" : "text-zinc-600 active:bg-zinc-200"}`}
                                                    >
                                                      -
                                                    </button>
                                                    <span className={`w-4 text-center font-bold text-[14px] ${orderLocked ? "text-zinc-400" : "text-zinc-800"}`}>
                                                      {orderAmount.law}
                                                    </span>
                                                    <button
                                                      onClick={() => setOrderAmount((prev) => ({ ...prev, law: prev.law + 1 }))}
                                                      disabled={orderLocked}
                                                      className={`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors ${orderLocked ? "text-zinc-300" : "text-zinc-600 active:bg-zinc-200"}`}
                                                    >
                                                      +
                                                    </button>
                                                  </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-3 border-t border-zinc-50">
                                                  <div className="flex flex-col">
                                                    <span className="text-[14px] font-medium text-zinc-800">《民法典》</span>
                                                    <span className="text-[12px] font-bold text-zinc-400">￥60.00</span>
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                    <button
                                                      onClick={() => setOrderAmount((prev) => ({ ...prev, civil: Math.max(0, prev.civil - 1) }))}
                                                      disabled={orderLocked}
                                                      className={`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors ${orderLocked ? "text-zinc-300" : "text-zinc-600 active:bg-zinc-200"}`}
                                                    >
                                                      -
                                                    </button>
                                                    <span className={`w-4 text-center font-bold text-[14px] ${orderLocked ? "text-zinc-400" : "text-zinc-800"}`}>
                                                      {orderAmount.civil}
                                                    </span>
                                                    <button
                                                      onClick={() => setOrderAmount((prev) => ({ ...prev, civil: prev.civil + 1 }))}
                                                      disabled={orderLocked}
                                                      className={`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors ${orderLocked ? "text-zinc-300" : "text-zinc-600 active:bg-zinc-200"}`}
                                                    >
                                                      +
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center justify-between pb-4 border-b border-zinc-100/60">
                                                <span className="text-[13px] font-bold text-zinc-500">预估总额</span>
                                                <span className="text-[16px] font-black text-blue-600">
                                                  ￥{(orderAmount.law * 45 + orderAmount.civil * 60).toFixed(2)}
                                                </span>
                                              </div>
                                              <div className="mt-4 flex gap-2.5">
                                                <button
                                                  onClick={() => { if (orderLocked) { setOrderLocked(false); showToast("请在班委封账前修改"); } }}
                                                  disabled={!orderLocked}
                                                  className={`font-bold text-[13px] py-2.5 rounded-xl transition-colors flex-[0.4] ${orderLocked ? "bg-zinc-100 text-zinc-600 active:bg-zinc-200" : "bg-transparent text-zinc-400 border border-zinc-200"}`}
                                                >修改订单</button>
                                                <button
                                                  onClick={handleOrderSubmit}
                                                  disabled={orderLocked || isOrderSubmitting}
                                                  className={`flex-1 font-bold text-[13px] py-2.5 rounded-xl transition-colors ${orderLocked ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" : isOrderSubmitting ? "bg-blue-300 text-white cursor-wait" : "bg-blue-600 text-white active:bg-blue-700 shadow-sm"}`}
                                                >{orderLocked ? "🔒 交易快照已固化" : isOrderSubmitting ? "..." : "确认征订并存证"}</button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div key={task.id} className={`bg-white rounded-[20px] p-4 border shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden active:scale-[0.98] transition-all ${task.priority === 'high' ? 'border-red-100' : 'border-zinc-200/60'}`}>
                                            {task.priority === 'high' && (
                                              <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                                            )}
                                            <div className={`${task.priority === 'high' ? 'pl-1' : ''}`}>
                                              <h4 className="text-[15px] font-bold text-zinc-900 mb-1.5 line-clamp-1">
                                                {task.title}
                                              </h4>
                                              <p className="text-[12px] text-zinc-500 flex items-center gap-1.5 font-medium">
                                                <Clock size={14} className={task.priority === 'high' ? "text-red-500" : "text-zinc-400"} />
                                                {task.deadline}
                                              </p>
                                              <button
                                                onClick={() => setActiveTaskForm(task.formId)}
                                                className={`mt-4 font-bold text-[13px] py-2.5 rounded-xl w-full ${task.priority === 'high' ? "bg-red-50 text-red-600 active:bg-red-100" : "bg-[#f6f7f9] text-zinc-700 active:bg-zinc-200"}`}
                                              >查阅与提交</button>
                                            </div>
                                          </div>
                                        );
                                      }
                                    } else {
                                      return (
                                        <div key={task.id} className="bg-white rounded-[20px] p-4 border border-zinc-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
                                          <div className="pr-4 min-w-0">
                                            <h4 className="text-[15px] font-bold text-zinc-900 mb-1.5 line-through decoration-zinc-300 truncate">
                                              {task.title}
                                            </h4>
                                            <p className="text-[12px] text-zinc-400 font-medium">
                                              {task.deadline}
                                            </p>
                                          </div>
                                          <div className="w-[34px] h-[34px] rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                                            <Check size={18} className="text-green-600" strokeWidth={3} />
                                          </div>
                                        </div>
                                      );
                                    }
                                  })
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Admin View: Workbench Content */}

                      {/* Task Flow Board */}
                      <div className="space-y-4">
                        <h3 className="text-[16px] font-bold text-zinc-800 px-1">
                          任务流看板
                        </h3>

                        {/* AI 考勤规则配置卡片 */}
                        <div className="bg-white rounded-[24px] border border-zinc-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden p-4 px-5">
                          <h4 className="text-[14px] font-bold text-blue-600 mb-4 tracking-tight leading-snug">
                            📝 识别到今日课表：
                            <br />
                            民法总论 (10:00)，请配置签到核销规则
                          </h4>

                          <div className="space-y-4 mb-5">
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-bold text-zinc-800">
                                要求地理围栏校验
                              </span>
                              <button
                                onClick={() =>
                                  setGeofenceEnabled(!geofenceEnabled)
                                }
                                className={`w-11 h-6 rounded-full transition-colors relative ${geofenceEnabled ? "bg-blue-500" : "bg-zinc-200"}`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform duration-200 ${geofenceEnabled ? "translate-x-5" : "translate-x-0.5"}`}
                                />
                              </button>
                            </div>

                            {geofenceEnabled && (
                              <div className="h-32 bg-zinc-50 rounded-xl relative overflow-hidden flex items-center justify-center border border-zinc-200/50 border-dashed">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center absolute z-0">
                                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm" />
                                </div>
                                <span className="text-[11px] font-bold text-zinc-400 absolute bottom-3 z-10 bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                  已锁定：下沙校区法学楼 500m 范围
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                              <span className="text-[13px] font-bold text-zinc-800">
                                要求动态二维码校验
                              </span>
                              <button
                                onClick={() => setQrCodeEnabled(!qrCodeEnabled)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${qrCodeEnabled ? "bg-blue-500" : "bg-zinc-200"}`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform duration-200 ${qrCodeEnabled ? "translate-x-5" : "translate-x-0.5"}`}
                                />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => setAttendancePublished(true)}
                            disabled={attendancePublished}
                            className={`w-full font-bold text-[13px] py-3 rounded-xl transition-all ${
                              attendancePublished
                                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                : "bg-black text-white active:bg-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                            }`}
                          >
                            {attendancePublished
                              ? "✅ 已发布"
                              : "生成并下发举证任务"}
                          </button>
                        </div>

                        <div className="bg-white rounded-[24px] border border-zinc-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                          <div className="p-4 px-5 border-b border-zinc-50 flex items-center justify-between">
                            <div className="min-w-0 pr-4">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                                  # 教学
                                </span>
                                <span className="text-[10px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">
                                  高优
                                </span>
                              </div>
                              <h4 className="text-[15px] font-bold text-zinc-900 truncate">
                                毕业论文定稿及查重报告
                              </h4>
                              <p className="text-[12px] text-zinc-400 mt-1">
                                今天 23:59 截止
                              </p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end">
                              <span className="text-[18px] font-black text-zinc-800 tracking-tight">
                                28
                                <span className="text-[12px] text-zinc-400 font-medium">
                                  /31
                                </span>
                              </span>
                              <div className="text-[11px] font-bold text-red-500 mt-0.5">
                                3 人未交
                              </div>
                            </div>
                          </div>

                          {/* Unfinished red list */}
                          <div className="bg-zinc-50/50 p-4 px-5">
                            <p className="text-[12px] font-bold text-zinc-500 mb-2.5">
                              深度审计 (未完成学号)
                            </p>
                            <div className="flex gap-2 flex-wrap mb-3">
                              <span className="text-[13px] font-medium bg-white border border-zinc-200/80 px-2.5 py-1 rounded-lg">
                                王伟 (04号)
                              </span>
                              <span className="text-[13px] font-medium bg-white border border-zinc-200/80 px-2.5 py-1 rounded-lg">
                                李华 (12号)
                              </span>
                              <span className="text-[13px] font-medium bg-white border border-zinc-200/80 px-2.5 py-1 rounded-lg">
                                赵强 (27号)
                              </span>
                            </div>
                            <button className="w-full bg-zinc-900 text-white font-bold text-[13px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 active:bg-black transition-colors">
                              <Zap size={14} className="text-yellow-400" />
                              一键 AI 拟态代催
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Format Purifier */}
                      <div className="pt-2">
                        <h3 className="text-[16px] font-bold text-zinc-800 mb-2.5 px-1">
                          格式净化池自动打包
                        </h3>
                        <div className="bg-white rounded-[24px] border border-zinc-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-4 px-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-[40px] h-[40px] bg-green-50 border border-green-100 rounded-[12px] flex items-center justify-center">
                                <Check size={20} className="text-green-600" />
                              </div>
                              <div>
                                <div className="text-[14px] font-bold text-zinc-900">
                                  28 份文件已合规重命名
                                </div>
                                <div className="text-[12px] text-zinc-400 mt-0.5">
                                  例如: 12号_李华_定稿.pdf
                                </div>
                              </div>
                            </div>
                            <button className="bg-zinc-100 text-zinc-800 text-[12px] font-bold px-3 py-1.5 rounded-lg active:bg-zinc-200">
                              导出 ZIP
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preference Modal Overlay */}
        {showPreferences && (
          <div className="absolute inset-0 z-[120] flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setShowPreferences(false)}
            ></div>

            <div className="bg-white w-full rounded-t-[2rem] relative z-10 bottom-0 animate-in slide-in-from-bottom-full duration-300">
              <div className="px-6 pt-5 pb-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-8"></div>
                  <h3 className="text-[17px] font-bold text-zinc-900 tracking-tight">
                    助理设定
                  </h3>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="w-8 h-8 flex items-center justify-center bg-zinc-100 rounded-full text-zinc-500 active:scale-95 transition-transform"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <span className="text-[13px] font-bold text-zinc-500 mb-3 block">
                    助理人格 (Persona)
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {["严谨辅导员", "摸鱼同桌", "律政先锋"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPersona(p)}
                        className={`px-4 py-2 rounded-full text-[14px] font-bold transition-colors ${persona === p ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-[#f6f7f9] text-zinc-600 border border-transparent"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[13px] font-bold text-zinc-500 mb-3 block">
                    免打扰级别 (Nudge)
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {["强提醒", "常规", "考前突击模式"].map((n) => (
                      <button
                        key={n}
                        onClick={() => setNudgeLevel(n)}
                        className={`px-4 py-2 rounded-full text-[14px] font-bold transition-colors ${nudgeLevel === n ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-[#f6f7f9] text-zinc-600 border border-transparent"}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowPreferences(false);
                    setStudentExtraMsgs([
                      ...studentExtraMsgs,
                      `设置已生效！现在我是你的${persona}了，有事直接吩咐~`,
                    ]);
                  }}
                  className="w-full bg-zinc-900 text-white font-bold text-[15px] py-3.5 rounded-2xl active:scale-[0.98] transition-transform shadow-[0_4px_12px_rgba(0,0,0,0.1)] mt-2"
                >
                  保存并应用
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Survey Form Modal Overlay */}
        {showSurveyForm && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setShowSurveyForm(false)}
            ></div>

            <div className="bg-white w-full rounded-t-[2rem] relative z-10 bottom-0 animate-in slide-in-from-bottom-full duration-300">
              <div className="px-6 pt-5 pb-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-8"></div>
                  <h3 className="text-[17px] font-bold text-zinc-900 tracking-tight">
                    《毕业流向及意愿摸底调查》
                  </h3>
                  <button
                    onClick={() => setShowSurveyForm(false)}
                    className="w-8 h-8 flex items-center justify-center bg-zinc-100 rounded-full text-zinc-500 active:scale-95 transition-transform"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Read-only Identity Card */}
                  <div className="bg-[#f6f7f9] p-4 rounded-[16px] border border-zinc-100">
                    <span className="text-[11px] font-bold text-zinc-400 block mb-2">
                      已锁定身份映射
                    </span>
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-zinc-600 font-medium">姓名</span>
                      <span className="font-bold text-zinc-900">张三</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px] mt-2 border-t border-zinc-200/50 pt-2">
                      <span className="text-zinc-600 font-medium">专业</span>
                      <span className="font-bold text-zinc-900">
                        计算机科学与技术
                      </span>
                    </div>
                  </div>

                  {/* Intent Selection */}
                  <div>
                    <span className="text-[13px] font-bold text-zinc-500 mb-3 block">
                      你的毕业意向是 (单选){" "}
                      <span className="text-red-500">*</span>
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {["考研", "考公", "就业", "出国"].map((intent) => (
                        <button
                          key={intent}
                          onClick={() => setSurveyIntention(intent)}
                          className={`px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${
                            surveyIntention === intent
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "bg-white text-zinc-600 border border-zinc-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                          }`}
                        >
                          {intent}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-center text-[11px] text-zinc-400 font-medium mb-3">
                    点击提交即代表本人电子签名确权
                  </p>
                  <button
                    onClick={handleSurveySubmit}
                    disabled={isSurveySubmitting}
                    className={`w-full font-bold text-[15px] py-3.5 rounded-2xl active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${
                      isSurveySubmitting
                        ? "bg-zinc-200 text-zinc-500"
                        : "bg-blue-600 text-white active:bg-blue-700"
                    }`}
                  >
                    {isSurveySubmitting
                      ? "加密存证中..."
                      : "确认无误，一键提交"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions More Panel */}
        {showMorePanel && (
          <div className="absolute inset-0 z-[60] flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/40 transition-opacity"
              onClick={() => setShowMorePanel(false)}
            ></div>

            <div className="relative z-10 bg-white rounded-t-[24px] w-full flex flex-col pb-10 animate-in slide-in-from-bottom-full duration-300">
              <div className="w-full flex justify-center pt-3 pb-2">
                <div className="w-10 h-1.5 bg-zinc-200 rounded-full"></div>
              </div>
              <div className="px-5 pb-4 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-[18px] font-bold text-zinc-800">
                  快捷指令中心
                </h3>
                <button
                  onClick={() => setShowMorePanel(false)}
                  className="p-1 active:bg-zinc-100 rounded-full"
                >
                  <X size={20} className="text-zinc-500" />
                </button>
              </div>

              <div className="flex flex-col px-4 pt-2 max-h-[400px] overflow-y-auto">
                {/* Create Button */}
                <button
                  onClick={() => setShowAddCustomAction(true)}
                  className="flex items-center justify-center gap-2 py-3.5 mb-2 mt-1 border border-dashed border-zinc-200 rounded-xl text-blue-600 font-bold text-[14px] active:bg-blue-50 transition-colors"
                >
                  <Plus size={18} strokeWidth={2.5} /> 新建自定义指令
                </button>

                {allActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0 hover:bg-zinc-50 active:bg-zinc-50 rounded-lg px-2 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => {
                        setChatInput(action.prompt);
                        setShowMorePanel(false);
                      }}
                    >
                      {action.icon === "✨" ? (
                        <Sparkles size={20} className="text-blue-500" />
                      ) : (
                        <span className="text-[20px]">{action.icon}</span>
                      )}
                      <span className="text-[15px] font-bold text-zinc-700">
                        {action.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {action.isCustom && (
                        <button
                          className="p-2 active:scale-90 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomActions((prev) =>
                              prev.filter((c) => c.id !== action.id),
                            );
                            setPinnedIds((prev) =>
                              prev.filter((id) => id !== action.id),
                            );
                          }}
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      )}
                      <button
                        className="p-2 active:scale-90 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (pinnedIds.includes(action.id)) {
                            setPinnedIds((prev) =>
                              prev.filter((id) => id !== action.id),
                            );
                          } else {
                            setPinnedIds((prev) => [...prev, action.id]);
                          }
                        }}
                      >
                        {pinnedIds.includes(action.id) ? (
                          <Pin
                            size={18}
                            className="text-blue-500 fill-blue-500"
                          />
                        ) : (
                          <PinOff size={18} className="text-zinc-300" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Action Form Overlay */}
            {showAddCustomAction && (
              <div className="absolute inset-0 z-20 bg-white rounded-t-[24px] flex flex-col pt-4 px-5 animate-in slide-in-from-bottom-8 duration-200">
                <h3 className="text-[17px] font-bold text-zinc-800 mb-6 flex justify-between items-center">
                  <span>配置自建指令</span>
                  <button onClick={() => setShowAddCustomAction(false)}>
                    <X size={20} className="text-zinc-400" />
                  </button>
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="text-[13px] font-bold text-zinc-500 mb-1.5 block">
                      指令名称 (最多 6 个字)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                        <Sparkles size={16} />
                      </span>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="如: 收法理学论文"
                        value={newActionLabel}
                        onChange={(e) => setNewActionLabel(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-3 text-[14px] font-bold outline-none focus:border-blue-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-zinc-500 mb-1.5 block">
                      指令详情
                    </label>
                    <textarea
                      rows={4}
                      placeholder="如: 帮我发个重要通知，让大家在明晚前交齐法理学期中论文初稿。"
                      value={newActionPrompt}
                      onChange={(e) => setNewActionPrompt(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-3 text-[14px] font-medium outline-none focus:border-blue-400 transition-colors resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setShowAddCustomAction(false)}
                    className="flex-1 bg-zinc-100 text-zinc-600 font-bold text-[15px] py-3.5 rounded-xl active:bg-zinc-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    disabled={!newActionLabel || !newActionPrompt}
                    onClick={() => {
                      const newId = "custom_" + Date.now();
                      setCustomActions((prev) => [
                        ...prev,
                        {
                          id: newId,
                          icon: "✨",
                          label: newActionLabel,
                          prompt: newActionPrompt,
                          isCustom: true,
                        },
                      ]);
                      setPinnedIds((prev) => [...prev, newId]);
                      setNewActionLabel("");
                      setNewActionPrompt("");
                      setShowAddCustomAction(false);
                    }}
                    className="flex-[2] bg-blue-600 text-white font-bold text-[15px] py-3.5 rounded-xl active:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    保存并固定
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Poster Share Modal Overlay */}
        {showPosterShare && (
          <div className="absolute inset-0 z-50 flex flex-col justify-center px-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
              onClick={() => setShowPosterShare(false)}
            ></div>

            <div className="relative z-10 animate-in zoom-in-95 duration-300 w-full flex flex-col items-center gap-6 pb-12">
              {/* Poster Card */}
              <div className="w-[320px] bg-white rounded-[32px] overflow-hidden shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop"
                  className="w-full h-48 object-cover"
                  alt="Class event cover"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
                  <span className="text-[12px] font-black text-blue-600">
                    本周简报
                  </span>
                </div>

                <div className="p-6 text-center space-y-4">
                  <h2 className="text-[24px] font-black tracking-tight text-zinc-900 border-b border-zinc-100 pb-4">
                    法学256班
                  </h2>

                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="flex flex-col items-center">
                      <span className="text-[32px] font-black text-amber-500 leading-tight">
                        12
                      </span>
                      <span className="text-[12px] font-bold text-zinc-500 mt-1">
                        本周完成任务数
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[32px] font-black text-green-500 leading-tight">
                        100<span className="text-[18px]">%</span>
                      </span>
                      <span className="text-[12px] font-bold text-zinc-500 mt-1">
                        全班考勤率
                      </span>
                    </div>
                  </div>

                  <p className="text-[12px] text-zinc-400 font-medium pt-2">
                    — 智能助理 AI Studio 生成 —
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-[320px] flex flex-col gap-3">
                <button
                  onClick={() => setShowPosterShare(false)}
                  className="w-full bg-blue-600 text-white font-bold text-[15px] py-4 rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all"
                >
                  保存到本地 / 转发到频道
                </button>
                <button
                  onClick={() => setShowPosterShare(false)}
                  className="w-full bg-white/20 text-white font-bold text-[15px] py-3 rounded-xl backdrop-blur-sm active:bg-white/30 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast */}
        {toastMessage && (
          <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-zinc-800 text-white px-5 py-3 rounded-full shadow-lg text-[14px] font-bold whitespace-nowrap">
              {toastMessage}
            </div>
          </div>
        )}
      </div>

      {/* Utilities */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes vertical-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-scroll {
          animation: vertical-scroll 10s linear infinite;
        }
      `}</style>
    </div>
  );
}
