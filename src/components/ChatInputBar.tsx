"use client";
import React from "react";
import { Plus, Send, Sparkles, MoreHorizontal } from "lucide-react";

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  prompt: string;
  isCustom?: boolean;
}

interface ChatInputBarProps {
  currentOrgRole: "admin" | "member";
  activeTab: "assistant" | "vault";
  allActions: QuickAction[];
  pinnedIds: string[];
  setChatInput: (v: string) => void;
  setShowMorePanel: (v: boolean) => void;
  chatInput: string;
  isAiThinking: boolean;
  handleSend: () => void;
  onQuickAction?: (actionId: string) => void;
  onTriggerCard?: (cardType: string) => void;
}

export default function ChatInputBar({
  currentOrgRole,
  activeTab,
  allActions,
  pinnedIds,
  setChatInput,
  setShowMorePanel,
  chatInput,
  isAiThinking,
  handleSend,
  onQuickAction,
  onTriggerCard,
}: ChatInputBarProps) {
  return (
    <div className="bg-[#f6f7f9] border-t border-zinc-200/80 pt-2 pb-[34px] shrink-0 absolute bottom-0 w-full z-20 flex flex-col">
      {/* Quick Actions (Admin Only) — 暴力强拆：硬编码原生 button，不经过任何中间组件/变量 */}
      {currentOrgRole === "admin" && activeTab === "assistant" && (
        <div className="overflow-x-auto hide-scrollbar flex gap-2 px-3 pb-2 w-full">
          {/* 1. 发起签到 */}
          <button
            type="button"
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 whitespace-nowrap active:bg-gray-50 flex items-center justify-center shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert("拦截成功！硬编码按钮: SignInCard");
              onTriggerCard?.("SignInCard");
            }}
          >
            <span className="mr-1">📍</span> 发起签到
          </button>
          {/* 2. 统计晚自习出勤 */}
          <button
            type="button"
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 whitespace-nowrap active:bg-gray-50 flex items-center justify-center shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert("拦截成功！硬编码按钮: ScheduleCard");
              onTriggerCard?.("ScheduleCard");
            }}
          >
            <span className="mr-1">📊</span> 晚自习(测试标记)
          </button>
          {/* 3. 征订民法教材 */}
          <button
            type="button"
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 whitespace-nowrap active:bg-gray-50 flex items-center justify-center shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert("拦截成功！硬编码按钮: BooksCard");
              onTriggerCard?.("BooksCard");
            }}
          >
            <span className="mr-1">📚</span> 征订民法教材
          </button>
          {/* 4. 发布放假通知 */}
          <button
            type="button"
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 whitespace-nowrap active:bg-gray-50 flex items-center justify-center shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert("拦截成功！硬编码按钮: NoticeCard");
              onTriggerCard?.("NoticeCard");
            }}
          >
            <span className="mr-1">📢</span> 发布放假通知
          </button>
          {/* More 按钮保留 */}
          <div className="shrink-0 flex items-center justify-center pr-1 w-8">
            <button
              type="button"
              onClick={() => setShowMorePanel(true)}
              className="w-[26px] h-[26px] bg-gray-100 rounded-full flex items-center justify-center active:bg-gray-200"
            >
              <MoreHorizontal size={14} className="text-gray-500" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2.5 w-full px-3">
        <button
          type="button"
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
              if (e.key === "Enter" && !isAiThinking) handleSend();
            }}
            placeholder={
              currentOrgRole === "member"
                ? "和智能助理聊聊..."
                : "下发指令或通知..."
            }
            disabled={isAiThinking}
            className="flex-1 bg-transparent text-[15px] outline-none text-zinc-900 placeholder-zinc-400 font-medium disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={isAiThinking || !chatInput.trim()}
          className="w-[44px] h-[44px] bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0 active:bg-blue-600 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
        >
          <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
        </button>
      </div>
    </div>
  );
}