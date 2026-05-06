"use client";
import React from "react";
import { X, Plus, Sparkles, Trash2, Pin, PinOff } from "lucide-react";

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  prompt: string;
  isCustom?: boolean;
}

interface QuickActionsPanelProps {
  showMorePanel: boolean;
  setShowMorePanel: (v: boolean) => void;
  allActions: QuickAction[];
  pinnedIds: string[];
  setPinnedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setCustomActions: React.Dispatch<React.SetStateAction<QuickAction[]>>;
  setChatInput: (v: string) => void;
  showAddCustomAction: boolean;
  setShowAddCustomAction: (v: boolean) => void;
  newActionLabel: string;
  setNewActionLabel: (v: string) => void;
  newActionPrompt: string;
  setNewActionPrompt: (v: string) => void;
  onQuickAction?: (actionId: string) => void;
}

export default function QuickActionsPanel({
  showMorePanel,
  setShowMorePanel,
  allActions,
  pinnedIds,
  setPinnedIds,
  setCustomActions,
  setChatInput,
  showAddCustomAction,
  setShowAddCustomAction,
  newActionLabel,
  setNewActionLabel,
  newActionPrompt,
  setNewActionPrompt,
  onQuickAction,
}: QuickActionsPanelProps) {
  if (!showMorePanel) return null;

  return (
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
                  if (onQuickAction) {
                    onQuickAction(action.id);
                  } else {
                    setChatInput(action.prompt);
                  }
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
  );
}