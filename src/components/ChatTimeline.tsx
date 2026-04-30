"use client";
import React from "react";
import { User, Bot, Zap, MapPin, Compass } from "lucide-react";

interface ChatTimelineProps {
  messages: {
    id: string;
    role: "user" | "ai";
    type: "text" | "books" | "checkin";
    content?: string;
  }[];
  isAiThinking: boolean;
  currentOrgName: string;
  currentOrgRole: "admin" | "member";
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  orgContextMap: Record<
    string,
    { aiTitle: string }
  >;
}

export default function ChatTimeline({
  messages,
  isAiThinking,
  currentOrgName,
  currentOrgRole,
  messagesEndRef,
  orgContextMap,
}: ChatTimelineProps) {
  return (
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
  );
}