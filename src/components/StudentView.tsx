import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Send,
  Bot,
  FileText,
  User,
  Sparkles,
  Folder,
  CheckCircle2,
  ChevronRight,
  X,
  Settings,
  Play,
  RefreshCw,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AILoading } from "./ui/AILoading";
import {
  useAiAssistant,
  PERSONALITY_META,
  getAvatarByLevel,
  type PersonalityId,
} from "@/src/store/aiAssistantStore";
import { rewriteSummary, type RewriteResult } from "@/src/lib/semanticRewriter";
import { useToast } from "@/src/components/Toast";

// ─────────────────────────────────────────────────────
// SettingsView — 性格实验室 (Modal)
// ─────────────────────────────────────────────────────
function SettingsView({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    personalityId,
    userPreferences,
    setPersonality,
    setUserPreferences,
    growthLevel,
  } = useAiAssistant();

  const [localPrefs, setLocalPrefs] = useState(userPreferences);
  const [mockInput, setMockInput] = useState("");
  const [previewResult, setPreviewResult] = useState<RewriteResult | null>(null);

  // Sync local prefs when opening
  useEffect(() => {
    if (isOpen) setLocalPrefs(userPreferences);
  }, [isOpen, userPreferences]);

  const personalityCards: { id: PersonalityId; emoji: string; label: string; desc: string }[] = [
    { id: "efficiency", emoji: "⚡", label: "效率派", desc: "删除废话，只留关键" },
    { id: "slacker", emoji: "🦥", label: "摸鱼派", desc: "同理心吐槽，语气舒缓" },
    { id: "sarcastic", emoji: "🍵", label: "乐子人", desc: "阴阳怪气，解构压力" },
  ];

  const handlePreview = () => {
    if (!mockInput.trim()) return;
    const result = rewriteSummary(mockInput.trim(), personalityId, localPrefs);
    setPreviewResult(result);
  };

  const handleSave = () => {
    setUserPreferences(localPrefs);
    onClose();
  };

  const avatar = getAvatarByLevel(growthLevel);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-[390px] bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl p-6 pt-8 pb-8 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 active:bg-zinc-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <Settings size={20} className="text-zinc-500" />
          <h2 className="text-[17px] font-bold text-zinc-900">性格实验室</h2>
        </div>

        {/* Current avatar */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-zinc-50 rounded-2xl">
          <div className="text-3xl">{avatar.emoji}</div>
          <div>
            <p className="text-sm font-semibold text-zinc-800">{avatar.label}</p>
            <p className="text-[11px] text-zinc-500">
              Lv.{Math.floor(growthLevel / 20) + 1} · 成长值 {growthLevel}%
            </p>
          </div>
        </div>

        {/* Personality cards */}
        <p className="text-[12px] font-semibold text-zinc-500 mb-2.5">选择性格</p>
        <div className="space-y-2 mb-5">
          {personalityCards.map((card) => {
            const isActive = personalityId === card.id;
            return (
              <button
                key={card.id}
                onClick={() => setPersonality(card.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all active:scale-[0.98] ${
                  isActive
                    ? "border-blue-400 bg-blue-50/60 shadow-sm"
                    : "border-zinc-100 bg-white hover:border-zinc-200"
                }`}
              >
                <span className="text-xl">{card.emoji}</span>
                <div className="text-left flex-1">
                  <span
                    className={`text-[14px] font-bold ${
                      isActive ? "text-blue-700" : "text-zinc-800"
                    }`}
                  >
                    {card.label}
                  </span>
                  <p className="text-[11px] text-zinc-400">{card.desc}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isActive ? "border-blue-500 bg-blue-500" : "border-zinc-300"
                  }`}
                >
                  {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Preferences TextArea */}
        <p className="text-[12px] font-semibold text-zinc-500 mb-2">
          你希望它怎么称呼你？或其他偏好？
        </p>
        <textarea
          value={localPrefs}
          onChange={(e) => setLocalPrefs(e.target.value)}
          maxLength={100}
          placeholder="例如：叫我「宝」、说话温柔点、多鼓励我…"
          className="w-full h-[72px] p-3 text-sm text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-xl resize-none outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all placeholder:text-zinc-300 mb-3"
        />
        <p className="text-[10px] text-zinc-400 text-right mb-4">
          {localPrefs.length}/100
        </p>

        {/* 测试一下 */}
        <div className="mb-5 p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/30 rounded-xl border border-blue-100/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <Play size={14} className="text-white" />
            </div>
            <div>
              <span className="text-[13px] font-bold text-zinc-800">测试一下</span>
              <p className="text-[10px] text-zinc-400">输入原文，即时预览当前性格+偏好的改写效果</p>
            </div>
          </div>
          <div className="flex gap-2 mb-2.5">
            <input
              value={mockInput}
              onChange={(e) => setMockInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handlePreview(); }}
              placeholder="粘贴一段通知原文…"
              className="flex-1 px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-zinc-300"
            />
            <button
              onClick={handlePreview}
              disabled={!mockInput.trim()}
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md shadow-blue-500/20"
            >
              测试一下
            </button>
          </div>
          {previewResult && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100/50">
            <p className="text-[13px] text-zinc-700 leading-relaxed whitespace-pre-wrap">
              {previewResult.rewritten}
            </p>
              {previewResult.triggeredCircuitBreaker && (
                <div className="mt-1.5 text-[11px] font-bold text-red-600 bg-red-50/60 px-2 py-1 rounded-md">
                  ⚠️ 行政熔断：{previewResult.criticalInfo}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-medium text-zinc-500 bg-zinc-100 rounded-xl hover:bg-zinc-200 active:scale-[0.98] transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
          >
            保存应用
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// ChatView — 1:1 元宝对话
// ─────────────────────────────────────────────────────
function ChatView() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [surveySelection, setSurveySelection] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    personalityId,
    userPreferences,
    growthLevel,
    completeTask,
    isTaskCompleted,
  } = useAiAssistant();

  const { showToast } = useToast();

  const avatar = getAvatarByLevel(growthLevel);
  const personalityMeta = PERSONALITY_META[personalityId];

  const [messages, setMessages] = useState<any[]>([
    {
      id: "1",
      type: "bot",
      content: "同学你好！我是你的班级助理。所有班级通知、打卡收集都会在这里下发。",
    },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), type: "user", content: input },
    ]);
    const query = input;
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          contextTitle: "我的班级",
        }),
      });

      const data = await response.json();
      const reply = response.ok
        ? data.reply
        : "抱歉，AI 服务器暂时出现了点问题，请稍后再试。";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: <div className="whitespace-pre-wrap">{reply}</div>,
        },
      ]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: (
            <div className="whitespace-pre-wrap text-red-500">
              网络连接失败，请检查网络后重试。
            </div>
          ),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const faqs = [
    "帮我找下那个民法课件",
    "本周青年大学习截止时间？",
    "请假流程是什么？",
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* ── Yuanbao Header Bar ── */}
      <div className="shrink-0 px-4 py-3 border-b border-zinc-100 bg-white/90 backdrop-blur-sm flex items-center gap-3">
        {/* Avatar — click to open SettingsView */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="shrink-0 relative focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-xl shadow-md shadow-indigo-200/50 group-active:scale-95 transition-transform">
            {avatar.emoji}
          </div>
          {/* Lv badge */}
          <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full px-1 py-0 text-[9px] font-bold text-zinc-700 shadow border border-zinc-200">
            Lv.{Math.floor(growthLevel / 20) + 1}
          </div>
        </button>

        {/* Name + Personality tag */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-bold text-zinc-800">{avatar.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-medium">
              {personalityMeta.icon} {personalityMeta.label}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate">
            {userPreferences ? `偏好：${userPreferences.slice(0, 20)}${userPreferences.length > 20 ? "…" : ""}` : "点击头像调教性格 →"}
          </p>
        </div>

        {/* Settings shortcut */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 text-zinc-400 hover:text-zinc-600 active:bg-zinc-100 rounded-full transition-colors"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* ── Message List ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-32 z-10">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex gap-3 max-w-full ${
              msg.type === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar per message */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                msg.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
              }`}
            >
              {msg.type === "user" ? (
                <User size={16} />
              ) : (
                <span className="text-xs">{avatar.emoji}</span>
              )}
            </div>
            <div
              className={`px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.type === "user"
                  ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                  : "bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {/* ── 意愿统计交互卡片（单选互斥 + 视觉反馈）── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 max-w-full"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <span className="text-xs">{avatar.emoji}</span>
          </div>
          <div className="px-4 py-3 text-sm leading-relaxed shadow-sm bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm w-full">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
              <div className="flex items-center gap-2 text-sm font-medium mb-2 text-zinc-800">
                <FileText size={16} className="text-blue-500" />
                <span>意愿统计</span>
              </div>
              <p className="text-xs text-zinc-500 mb-3">
                辅导员发起了《中秋留校意愿统计》（请选择一项）
              </p>
              <div className="space-y-2">
                {[
                  { id: "mid-autumn-stay", label: "留校（参加学校晚会）" },
                  { id: "mid-autumn-home", label: "回家（已买好车票）" },
                ].map((opt) => {
                  const isSelected = surveySelection === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (surveySelection === opt.id) return;
                        setSurveySelection(opt.id);
                        completeTask(opt.id);
                        showToast(`提交成功，已记录为 ${opt.label}`);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm border rounded-lg transition-all duration-200 flex items-center justify-between ${
                        isSelected
                          ? "bg-green-50 border-green-500 text-green-800 shadow-sm"
                          : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          <Check size={16} className="text-green-600" />
                        </motion.span>
                      )}
                    </button>
                  );
                })}
              </div>
              {surveySelection && (
                <p className="mt-2 text-[11px] text-green-700/70">
                  ✅ 已提交选择，如需修改请重新点击上方选项
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {isTyping && (
          <div className="flex gap-3 max-w-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm text-white">
              <span className="text-xs">{avatar.emoji}</span>
            </div>
            <AILoading text="语义识别与检索中..." />
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* ── Input Bar ── */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-white via-white to-transparent z-20">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
          {faqs.map((faq) => (
            <button
              key={faq}
              onClick={() => {
                setInput(faq);
              }}
              className="px-3 py-1.5 flex-shrink-0 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-100 transition-colors shadow-sm"
            >
              {faq}
            </button>
          ))}
        </div>
        <form
          onSubmit={handleSend}
          className="relative shadow-sm rounded-2xl border border-zinc-200 bg-white flex items-center overflow-hidden focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="下达指令或对话..."
            className="flex-1 px-4 py-3.5 outline-none text-sm text-zinc-900 placeholder-zinc-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="mr-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-100 disabled:text-zinc-400 text-white rounded-xl transition-all"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* ── Settings Modal ── */}
      <SettingsView isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Asset Tab (智能资产仓)
// ─────────────────────────────────────────────────────
function AssetTab() {
  const { growthLevel, completedCount, avatarId, personalityId } = useAiAssistant();
  const avatar = getAvatarByLevel(growthLevel);
  const personalityLabel = PERSONALITY_META[personalityId]?.label ?? "未知";

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 space-y-6">
      {/* Identity Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-5 text-white shadow-xl shadow-zinc-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">匿名法学生</h2>
            <p className="text-zinc-400 text-sm font-mono">ID: ****</p>
          </div>
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
            <User size={20} className="text-zinc-200" />
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between relative z-10">
          <div>
            <p className="text-xs text-zinc-400 mb-1">班级</p>
            <p className="text-sm font-medium">25级法律班</p>
          </div>
          <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
            完善信息
          </button>
        </div>
      </div>

      {/* AI Avatar Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 px-5 py-4 flex items-center gap-4">
          <div className="w-[56px] h-[56px] rounded-[20px] bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_4px_16px_rgba(99,102,241,0.12)] flex items-center justify-center shrink-0">
            <span className="text-[28px] leading-none">{avatar.emoji}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-zinc-800">{avatar.label}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              性格：{personalityLabel} · 已完成 {completedCount} 个任务
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm flex items-center gap-5">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-zinc-100"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-blue-500 transition-[stroke-dasharray] duration-500"
              strokeWidth="4"
              strokeDasharray={`${growthLevel}, 100`}
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-800">
            {growthLevel}%
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-zinc-900 text-sm">AI 助理成长度</h3>
          <p className="text-xs text-zinc-500 mt-1">
            {growthLevel >= 100
              ? "🎉 已达满级！"
              : `再完成 ${Math.max(1, 5 - completedCount)} 个任务升级`}
          </p>
          <button className="mt-2 text-xs font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700">
            去处理助手待办 <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Private Cloud */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" /> 个人私有云 (AI元数据解析)
        </h3>
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              <span className="text-sm font-medium text-zinc-800">
                蓝桥杯省一等奖证书.pdf
              </span>
            </div>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium">
              综测预估加分: +2.0
            </span>
          </div>
          <div className="px-4 py-3 bg-zinc-50/50 text-xs text-zinc-600 line-clamp-2">
            AI已提取：证书所属人(匿名法学生), 奖项级别(省级), 名次(一等奖)。该资料已被自动上锁，仅限本人调阅并生成审计日志。
          </div>
        </div>
      </div>

      {/* Public KB */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
          <Folder size={16} className="text-amber-500" /> 公共知识库
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-amber-300 transition-colors shadow-sm cursor-pointer">
            <Folder size={24} className="text-amber-400 mb-3" />
            <h4 className="text-sm font-medium text-zinc-800">专业必修课件</h4>
            <p className="text-xs text-zinc-500 mt-1">12个 AI打捞文件</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-amber-300 transition-colors shadow-sm cursor-pointer">
            <Folder size={24} className="text-amber-400 mb-3" />
            <h4 className="text-sm font-medium text-zinc-800">团建照片记录</h4>
            <p className="text-xs text-zinc-500 mt-1">45个 共享文件</p>
          </div>
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────
export function StudentView() {
  const [activeTab, setActiveTab] = useState<"assistant" | "assets">("assistant");

  return (
    <div className="flex flex-col h-full bg-zinc-100">
      {/* Tab Switcher */}
      <div className="flex bg-white shadow-sm border-b border-zinc-200 shrink-0">
        <button
          onClick={() => setActiveTab("assistant")}
          className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "assistant"
              ? "text-blue-600 border-blue-600"
              : "text-zinc-500 border-transparent hover:text-zinc-800"
          }`}
        >
          💬 元宝对话
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "assets"
              ? "text-blue-600 border-blue-600"
              : "text-zinc-500 border-transparent hover:text-zinc-800"
          }`}
        >
          智能资产仓
        </button>
      </div>

      {activeTab === "assistant" ? <ChatView /> : <AssetTab />}
    </div>
  );
}