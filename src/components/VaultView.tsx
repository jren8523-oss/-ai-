"use client";
import React from "react";
import {
  ChevronRight,
  FolderOpen,
  Image as ImageIcon,
  Star,
  Sparkles,
  Bot,
  FileText,
  Zap,
  Check,
} from "lucide-react";
import TaskCards from "./TaskCards";

// ── Types ──────────────────────────────────────────────

interface VaultViewProps {
  currentOrgRole: "admin" | "member";
  vaultSubView: "overview" | "tasks";
  setVaultSubView: (view: "overview" | "tasks") => void;
  activeApp: "files" | "albums" | "highlights";
  setActiveApp: (app: "files" | "albums" | "highlights") => void;
  currentOrgName: string;
  // 考勤配置
  geofenceEnabled: boolean;
  setGeofenceEnabled: (enabled: boolean) => void;
  qrCodeEnabled: boolean;
  setQrCodeEnabled: (enabled: boolean) => void;
  attendancePublished: boolean;
  setAttendancePublished: (published: boolean) => void;
  // 教材征订
  orderAmount: { law: number; civil: number };
  setOrderAmount: React.Dispatch<
    React.SetStateAction<{ law: number; civil: number }>
  >;
  orderLocked: boolean;
  setOrderLocked: (locked: boolean) => void;
  isOrderSubmitting: boolean;
  handleOrderSubmit: () => void;
  handleTaskSubmit: () => void;
  showToast: (msg: string) => void;
  // 任务卡片（透传给 TaskCards）
  taskTab: "pending" | "completed";
  setTaskTab: (tab: "pending" | "completed") => void;
  activeTaskForm: string | null;
  setActiveTaskForm: (formId: string | null) => void;
  isTaskSubmitting: boolean;
  mockTasks: Array<{
    id: string;
    title: string;
    deadline?: string;
    sourceOrg: string;
    status: "pending" | "completed";
    priority: "high" | "normal";
    formId?: string;
  }>;
}

// ── Component ──────────────────────────────────────────

export default function VaultView({
  currentOrgRole,
  vaultSubView,
  setVaultSubView,
  activeApp,
  setActiveApp,
  currentOrgName,
  geofenceEnabled,
  setGeofenceEnabled,
  qrCodeEnabled,
  setQrCodeEnabled,
  attendancePublished,
  setAttendancePublished,
  orderAmount,
  setOrderAmount,
  orderLocked,
  setOrderLocked,
  isOrderSubmitting,
  handleOrderSubmit,
  handleTaskSubmit,
  showToast,
  taskTab,
  setTaskTab,
  activeTaskForm,
  setActiveTaskForm,
  isTaskSubmitting,
  mockTasks,
}: VaultViewProps) {
  // ================================================================
  // MEMBER VIEW
  // ================================================================
  if (currentOrgRole === "member") {
    // ---- Sub-view: overview ----
    if (vaultSubView === "overview") {
      return (
        <div className="flex flex-col h-full overflow-y-auto px-4 pt-4 space-y-4 pb-32 hide-scrollbar">
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
              <ChevronRight size={20} className="text-zinc-400" />
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
                className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center transition-all ${
                  activeApp === "files"
                    ? "bg-amber-100 border-[2.5px] border-amber-300 shadow-sm"
                    : "bg-amber-50/70 border border-transparent"
                }`}
              >
                <FolderOpen
                  size={24}
                  className={
                    activeApp === "files" ? "text-amber-500" : "text-amber-400"
                  }
                />
              </div>
              <span
                className={`text-[12px] font-bold transition-colors ${
                  activeApp === "files" ? "text-zinc-900" : "text-zinc-500"
                }`}
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
                className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center transition-all ${
                  activeApp === "albums"
                    ? "bg-blue-100 border-[2.5px] border-blue-300 shadow-sm"
                    : "bg-blue-50/70 border border-transparent"
                }`}
              >
                <ImageIcon
                  size={24}
                  className={
                    activeApp === "albums" ? "text-blue-500" : "text-blue-400"
                  }
                />
              </div>
              <span
                className={`text-[12px] font-bold transition-colors ${
                  activeApp === "albums" ? "text-zinc-900" : "text-zinc-500"
                }`}
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
                className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center transition-all ${
                  activeApp === "highlights"
                    ? "bg-emerald-100 border-[2.5px] border-emerald-300 shadow-sm"
                    : "bg-emerald-50/70 border border-transparent"
                }`}
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
                className={`text-[12px] font-bold transition-colors ${
                  activeApp === "highlights" ? "text-zinc-900" : "text-zinc-500"
                }`}
              >
                智能精华
              </span>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {activeApp === "files" &&
              (currentOrgName === "我的班级" ? (
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
              ))}

            {activeApp === "albums" &&
              (currentOrgName === "我的班级" ? (
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
              ))}

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
        </div>
      );
    }

    // ---- Sub-view: tasks (placeholder) ----
    return (
      <div className="flex flex-col h-full overflow-y-auto px-4 pt-4 pb-32 hide-scrollbar items-center justify-center">
        <p className="text-[14px] font-bold text-zinc-400">任务视图加载中...</p>
      </div>
    );
  }

  // ================================================================
  // ADMIN VIEW
  // ================================================================
  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pt-4 space-y-4 pb-32 hide-scrollbar">
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
                onClick={() => setGeofenceEnabled(!geofenceEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  geofenceEnabled ? "bg-blue-500" : "bg-zinc-200"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform duration-200 ${
                    geofenceEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
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
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  qrCodeEnabled ? "bg-blue-500" : "bg-zinc-200"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform duration-200 ${
                    qrCodeEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
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
            {attendancePublished ? "✅ 已发布" : "生成并下发举证任务"}
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
              <p className="text-[12px] text-zinc-400 mt-1">今天 23:59 截止</p>
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
    </div>
  );
}