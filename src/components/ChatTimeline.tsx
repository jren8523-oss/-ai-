"use client";
import React, { useState, useMemo } from "react";
import {
  User, Bot, Zap, MapPin, Compass,
  Clock, Crosshair, QrCode, CheckCircle, Send,
} from "lucide-react";
import type { UIRequestPayload } from "@/src/lib/uiRequestProtocol";
import type { StoredTask } from "@/src/lib/taskStore";
import TaskCards, { SummaryPopup } from "@/src/components/TaskCards";
import SignInCard from "@/src/components/cards/SignInCard";
import ScheduleCard from "@/src/components/cards/ScheduleCard";
import BooksCard from "@/src/components/cards/BooksCard";
import NoticeCard from "@/src/components/cards/NoticeCard";

export interface Message {
  id: string;
  role: "user" | "ai";
  type: "text" | "books" | "checkin" | "checkin-config" | "ui-card" | "task-card" | "sign-in-card" | "schedule-card" | "books-card" | "notice-card";
  content?: string;
  payload?: any;
  uiRequest?: UIRequestPayload;
  task?: StoredTask;
  tasks?: StoredTask[]; // 同学侧拉取的所有待处理任务
}

interface ChatTimelineProps {
  messages: Message[];
  isAiThinking: boolean;
  currentOrgName: string;
  currentOrgRole: "admin" | "member";
  simulatedUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  orgContextMap: Record<string, { aiTitle: string }>;
  onSendMessage?: (text: string) => void;
  onTasksRefreshed?: () => void;
}

/* ───── Role-based suggestions ───── */
const ADMIN_SUGGESTIONS = ["发布签到任务", "核对教材缴费情况", "导出考勤异常名单", "整理教务通知摘要"];
const STUDENT_SUGGESTIONS = ["帮我找下课件", "本周作业截止时间？", "帮我润色口播稿", "查询志愿学分"];

/* ───── CheckinConfigCard (interactive wizard) ───── */
const SCENE_TEMPLATES = [
  { label: "晚自习", title: "晚自习签到" },
  { label: "讲座", title: "讲座签到" },
  { label: "专业课", title: "专业课签到" },
] as const;

const RANGE_OPTIONS = [
  { label: "当前位置", value: "precise" },
  { label: "法学楼(500m)", value: "500m" },
  { label: "全校范围", value: "campus" },
] as const;

const MODE_OPTIONS = [
  { label: "GPS", icon: Crosshair, value: "gps" },
  { label: "动态二维码", icon: QrCode, value: "qr" },
  { label: "普通打卡", icon: CheckCircle, value: "tap" },
] as const;

function formatDeadline(durationMinutes: number): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + durationMinutes);
  return now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const CheckinConfigCard: React.FC<{ uiRequest?: UIRequestPayload; onSendMessage?: (text: string) => void }> = ({ uiRequest, onSendMessage }) => {
  const props = uiRequest?.props;
  const inferredTitle = props?.type === "checkin" ? (props?.params?.scene as string) || props?.title || "" : props?.title || "";
  const [title, setTitle] = useState(inferredTitle);
  const [duration, setDuration] = useState((props?.params?.durationMinutes as number) || 30);
  const [range, setRange] = useState<"precise" | "500m" | "campus">((props?.params?.range as "precise" | "500m" | "campus") || "500m");
  const [mode, setMode] = useState<"gps" | "qr" | "tap">((props?.params?.mode as "gps" | "qr" | "tap") || "gps");
  const [published, setPublished] = useState(false);

  const deadline = useMemo(() => formatDeadline(duration), [duration]);

  const handlePublish = () => {
    const finalTitle = title || "签到任务";
    setPublished(true);
    onSendMessage?.(`发布签到：${finalTitle}`);
  };

  return (
    <div
      className="bg-white rounded-[20px] rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden w-full border border-emerald-100/60"
    >
      {/* Header */}
      <div className="bg-emerald-50/80 px-4 py-3 border-b border-emerald-100/50 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
          <MapPin size={12} strokeWidth={3} />
        </div>
        <span className="text-[14px] font-bold text-emerald-900">
          发布签到配置
        </span>
        {published && (
          <span className="ml-auto text-[11px] font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md">
            已发布
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* ── Scene Templates ── */}
        <div>
          <div className="text-[11px] text-zinc-400 font-bold mb-2 uppercase tracking-wide">
            场景模板
          </div>
          <div className="flex gap-2">
            {SCENE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                disabled={published}
                onClick={() => setTitle(tpl.title)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all active:scale-95 ${
                  title === tpl.title
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-emerald-300 hover:text-emerald-600"
                } ${published ? "opacity-60 pointer-events-none" : ""}`}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Duration Slider ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wide">
              签到时长
            </span>
            <span className="text-[13px] font-bold text-emerald-700 flex items-center gap-1">
              <Clock size={14} />
              {deadline} 截止
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-400 w-8 text-right">
              {duration}min
            </span>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={duration}
              disabled={published}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-zinc-200
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500
                [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110
                disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* ── Range Shortcuts ── */}
        <div>
          <div className="text-[11px] text-zinc-400 font-bold mb-2 uppercase tracking-wide">
            有效范围
          </div>
          <div className="flex gap-2">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={published}
                onClick={() => setRange(opt.value)}
                className={`flex-1 py-2 rounded-xl text-[12px] font-bold border transition-all active:scale-95 ${
                  range === opt.value
                    ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                    : "bg-zinc-50 border-zinc-100 text-zinc-500 hover:border-zinc-300"
                } ${published ? "opacity-60 pointer-events-none" : ""}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Checkin Mode (Segmented Control) ── */}
        <div>
          <div className="text-[11px] text-zinc-400 font-bold mb-2 uppercase tracking-wide">
            签到模式
          </div>
          <div className="flex bg-zinc-100 rounded-xl p-1 gap-1">
            {MODE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={published}
                  onClick={() => setMode(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-bold transition-all active:scale-95 ${
                    mode === opt.value
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                  } ${published ? "opacity-60 pointer-events-none" : ""}`}
                >
                  <Icon size={14} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Publish Button ── */}
        <button
          type="button"
          onClick={handlePublish}
          disabled={published}
          className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl
            active:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center gap-2
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {published ? (
            <>✅ 已推送给全班</>
          ) : (
            <>
              <Send size={16} /> 确认发布并推送
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/* ───── Main Timeline Component ───── */
export default function ChatTimeline({
  messages,
  isAiThinking,
  currentOrgName,
  currentOrgRole,
  simulatedUserId,
  messagesEndRef,
  orgContextMap,
  onSendMessage,
  onTasksRefreshed,
}: ChatTimelineProps) {
  const [cardActionsUsed, setCardActionsUsed] = useState<Record<string, boolean>>({});
  const [summaryTask, setSummaryTask] = useState<StoredTask | null>(null);

  const suggestions =
    currentOrgRole === "admin" ? ADMIN_SUGGESTIONS : STUDENT_SUGGESTIONS;

  const getInitialContent = (msg: Message): string | undefined => {
    if (
      msg.id === "initial" &&
      msg.role === "ai" &&
      currentOrgRole === "admin" &&
      currentOrgName === "我的班级"
    ) {
      return "班委你好！我是你的行政助手，已就绪。你可以直接发起签到、核对账单或整理通知。";
    }
    return msg.content;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 hide-scrollbar flex flex-col pb-32">
      {/* Chat Timeline Note */}
      <div className="text-center mt-2 mb-4">
        <span className="text-zinc-400 font-medium text-[12px] flex items-center justify-center gap-1.5 mb-1">
          <Bot size={14} />
          {orgContextMap[currentOrgName]?.aiTitle || "助手"}
        </span>
      </div>

      {/* Messages Loop */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-2.5 max-w-[92%] items-start animate-in fade-in slide-in-from-bottom-2 duration-300 w-full ${
            msg.role === "user" ? "self-end flex-row-reverse" : ""
          }`}
        >
          <div
            className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 text-white shadow-sm ${
              msg.role === "user"
                ? "bg-slate-800"
                : "bg-gradient-to-br from-indigo-500 to-blue-500 font-bold"
            }`}
          >
            {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
          </div>

          {/* Render Text */}
          {msg.type === "text" && (
            <div
              className={`${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-tr-sm text-left"
                  : "bg-white text-zinc-800 rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
              } px-4 py-3.5 rounded-[20px] text-[15px] leading-relaxed`}
            >
              {getInitialContent(msg)}
            </div>
          )}

          {/* Render Books */}
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

          {/* Render Checkin */}
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
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  cardActionsUsed[msg.id]
                    ? "text-emerald-600 bg-emerald-100/60"
                    : "text-indigo-500 bg-indigo-100/50"
                }`}>
                  {cardActionsUsed[msg.id] ? "已完成" : "进行中"}
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
                  onClick={() => {
                    if (cardActionsUsed[msg.id]) return;
                    setCardActionsUsed((prev) => ({ ...prev, [msg.id]: true }));
                    if (currentOrgRole === "member") {
                      onSendMessage?.("我选择：留校");
                    } else {
                      onSendMessage?.("查看签到大屏看板");
                    }
                  }}
                  disabled={cardActionsUsed[msg.id]}
                  className={`w-full font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                    cardActionsUsed[msg.id]
                      ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                      : "bg-indigo-500 text-white active:bg-indigo-600"
                  }`}
                >
                  {cardActionsUsed[msg.id] ? (
                    <>
                      <CheckCircle size={18} /> {currentOrgRole === "member" ? "已签到 ✓" : "已查看 ✓"}
                    </>
                  ) : currentOrgRole === "member" ? (
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

          {/* Render Checkin-Config (NEW - legacy from replyLogic) */}
          {msg.type === "checkin-config" && (
            <CheckinConfigCard onSendMessage={onSendMessage} />
          )}

          {/* Render UI Card (from ui-request protocol) */}
          {msg.type === "ui-card" && msg.uiRequest && (
            msg.uiRequest.component === "TaskConfigCard" ? (
              msg.uiRequest.props?.type === "checkin" ? (
                <CheckinConfigCard uiRequest={msg.uiRequest} onSendMessage={onSendMessage} />
              ) : (
                <div className="bg-white rounded-[20px] rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)] px-4 py-3.5 text-[15px] leading-relaxed text-zinc-800">
                  {msg.content || "该任务类型暂不支持卡片配置，请查看文字回复。"}
                </div>
              )
            ) : (
              <div className="bg-white rounded-[20px] rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)] px-4 py-3.5 text-[13px] text-zinc-500">
                未知卡片类型: {msg.uiRequest.component}
              </div>
            )
          )}

          {/* Render Sign-in Card (preset) */}
          {msg.type === "sign-in-card" && (
            <SignInCard messageId={msg.id} />
          )}

          {/* Render Schedule Card (preset) */}
          {msg.type === "schedule-card" && (
            <ScheduleCard messageId={msg.id} />
          )}

          {/* Render Books Card (preset) */}
          {msg.type === "books-card" && (
            <BooksCard messageId={msg.id} books={msg.payload?.books} />
          )}

          {/* Render Notice Card (preset) */}
          {msg.type === "notice-card" && (
            <NoticeCard messageId={msg.id} title={msg.payload?.title} content={msg.payload?.content} />
          )}

          {/* Render Task Card (from new task protocol - AI-generated) */}
          {msg.type === "task-card" && msg.task && (
            <TaskCards
              tasks={[msg.task]}
              role={currentOrgRole}
              simulatedUserId={simulatedUserId}
              onResponded={() => onTasksRefreshed?.()}
              onViewSummary={(taskId) => {
                const t = msg.task || messages.flatMap(m => m.tasks || []).find(t => t.id === taskId);
                if (t) setSummaryTask(t);
              }}
            />
          )}

          {/* Render fetched tasks list (同学侧拉取) */}
          {msg.tasks && msg.tasks.length > 0 && msg.id.endsWith("-tasks-list") && (
            <TaskCards
              tasks={msg.tasks}
              role={currentOrgRole}
              simulatedUserId={simulatedUserId}
              onResponded={() => onTasksRefreshed?.()}
              onViewSummary={(taskId) => {
                const t = msg.tasks.find(t => t.id === taskId);
                if (t) setSummaryTask(t);
              }}
            />
          )}
        </div>
      ))}

      {/* Summary Popup */}
      {summaryTask && (
        <SummaryPopup
          task={summaryTask}
          onClose={() => setSummaryTask(null)}
        />
      )}

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

      {/* Role-based suggestion chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar px-1 py-1 shrink-0">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSendMessage?.(suggestion)}
            disabled={isAiThinking}
            className="px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-xs text-zinc-600 whitespace-nowrap active:bg-zinc-50 hover:border-blue-300 hover:text-blue-600 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div ref={messagesEndRef} className="h-4 w-full shrink-0"></div>
    </div>
  );
}
