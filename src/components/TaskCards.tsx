"use client";
import React from "react";
import { ChevronLeft, Clock, Check } from "lucide-react";

// ── Types ──────────────────────────────────────────────

interface TaskItem {
  id: string;
  title: string;
  deadline?: string;
  sourceOrg: string;
  status: "pending" | "completed";
  priority: "high" | "normal";
  formId?: string;
}

interface TaskCardsProps {
  taskTab: "pending" | "completed";
  setTaskTab: (tab: "pending" | "completed") => void;
  activeTaskForm: string | null;
  setActiveTaskForm: (formId: string | null) => void;
  isTaskSubmitting: boolean;
  handleTaskSubmit: () => void;
  currentOrgName: string;
  mockTasks: TaskItem[];
  orderAmount: { law: number; civil: number };
  setOrderAmount: React.Dispatch<
    React.SetStateAction<{ law: number; civil: number }>
  >;
  orderLocked: boolean;
  setOrderLocked: (locked: boolean) => void;
  isOrderSubmitting: boolean;
  handleOrderSubmit: () => void;
  showToast: (msg: string) => void;
  onBack: () => void;
}

// ── Component ──────────────────────────────────────────

export default function TaskCards({
  taskTab,
  setTaskTab,
  activeTaskForm,
  setActiveTaskForm,
  isTaskSubmitting,
  handleTaskSubmit,
  currentOrgName,
  mockTasks,
  orderAmount,
  setOrderAmount,
  orderLocked,
  setOrderLocked,
  isOrderSubmitting,
  handleOrderSubmit,
  showToast,
  onBack,
}: TaskCardsProps) {
  // ================================================================
  // TASK FORM VIEW (activeTaskForm is set)
  // ================================================================
  if (activeTaskForm) {
    return (
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto px-4 pt-4 pb-32 hide-scrollbar">
        <div
          onClick={() => setActiveTaskForm(null)}
          className="flex items-center gap-1 mb-4 -ml-2 px-2 cursor-pointer active:opacity-70 w-fit"
        >
          <ChevronLeft size={22} className="text-zinc-500" />
          <span className="text-[16px] font-bold text-zinc-800">返回</span>
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
              className={`w-full mt-4 font-bold text-[14px] py-3 rounded-xl transition-all ${
                isTaskSubmitting
                  ? "bg-zinc-200 text-zinc-500"
                  : "bg-blue-600 text-white active:bg-blue-700"
              }`}
            >
              {isTaskSubmitting ? "AI 存证中..." : "确认无误，归档提交"}
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
                  <span className="font-bold text-green-600">+2.0</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="text-zinc-800 font-medium">
                    秋季运动会志愿者
                  </span>
                  <span className="font-bold text-green-600">+1.5</span>
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
                className={`w-full font-bold text-[14px] py-3 rounded-xl transition-all ${
                  isTaskSubmitting
                    ? "bg-zinc-200 text-zinc-500"
                    : "bg-blue-600 text-white active:bg-blue-700"
                }`}
              >
                {isTaskSubmitting ? "AI 存证中..." : "确认无误，一键电子签名"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================================================================
  // TASK LIST VIEW
  // ================================================================
  const filteredTasks = mockTasks.filter(
    (t) => t.sourceOrg === currentOrgName && t.status === taskTab,
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto px-4 pt-4 pb-32 hide-scrollbar">
      {/* Sub-view Header */}
      <div
        onClick={onBack}
        className="flex items-center gap-1 mb-4 -ml-2 px-2 cursor-pointer active:opacity-70 w-fit"
      >
        <ChevronLeft size={22} className="text-zinc-500" />
        <span className="text-[16px] font-bold text-zinc-800">返回</span>
      </div>

      <h2 className="text-[20px] font-bold text-zinc-900 px-1.5 mb-4">
        我的任务
      </h2>

      {/* Task Tabs */}
      <div className="flex gap-6 border-b border-zinc-200/60 pb-2.5 mb-4 px-2">
        <button
          onClick={() => setTaskTab("pending")}
          className={`text-[14px] font-bold relative transition-colors ${
            taskTab === "pending" ? "text-zinc-900" : "text-zinc-400"
          }`}
        >
          未完成
          {taskTab === "pending" && (
            <div className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setTaskTab("completed")}
          className={`text-[14px] font-bold relative transition-colors ${
            taskTab === "completed" ? "text-zinc-900" : "text-zinc-400"
          }`}
        >
          已完成
          {taskTab === "completed" && (
            <div className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Task Lists */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
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
          filteredTasks.map((task) => {
            if (task.status === "pending") {
              if (task.formId === "textbook") {
                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-[20px] p-4 border border-blue-100 shadow-[0_2px_12px_rgba(37,99,235,0.04)]"
                  >
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
                            <span className="text-[14px] font-medium text-zinc-800">
                              《法理学》
                            </span>
                            <span className="text-[12px] font-bold text-zinc-400">
                              ￥45.00
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                setOrderAmount((prev) => ({
                                  ...prev,
                                  law: Math.max(0, prev.law - 1),
                                }))
                              }
                              disabled={orderLocked}
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors ${
                                orderLocked
                                  ? "text-zinc-300"
                                  : "text-zinc-600 active:bg-zinc-200"
                              }`}
                            >
                              -
                            </button>
                            <span
                              className={`w-4 text-center font-bold text-[14px] ${
                                orderLocked ? "text-zinc-400" : "text-zinc-800"
                              }`}
                            >
                              {orderAmount.law}
                            </span>
                            <button
                              onClick={() =>
                                setOrderAmount((prev) => ({
                                  ...prev,
                                  law: prev.law + 1,
                                }))
                              }
                              disabled={orderLocked}
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors ${
                                orderLocked
                                  ? "text-zinc-300"
                                  : "text-zinc-600 active:bg-zinc-200"
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-zinc-50">
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium text-zinc-800">
                              《民法典》
                            </span>
                            <span className="text-[12px] font-bold text-zinc-400">
                              ￥60.00
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                setOrderAmount((prev) => ({
                                  ...prev,
                                  civil: Math.max(0, prev.civil - 1),
                                }))
                              }
                              disabled={orderLocked}
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors ${
                                orderLocked
                                  ? "text-zinc-300"
                                  : "text-zinc-600 active:bg-zinc-200"
                              }`}
                            >
                              -
                            </button>
                            <span
                              className={`w-4 text-center font-bold text-[14px] ${
                                orderLocked ? "text-zinc-400" : "text-zinc-800"
                              }`}
                            >
                              {orderAmount.civil}
                            </span>
                            <button
                              onClick={() =>
                                setOrderAmount((prev) => ({
                                  ...prev,
                                  civil: prev.civil + 1,
                                }))
                              }
                              disabled={orderLocked}
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-medium bg-zinc-100 transition-colors ${
                                orderLocked
                                  ? "text-zinc-300"
                                  : "text-zinc-600 active:bg-zinc-200"
                              }`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pb-4 border-b border-zinc-100/60">
                        <span className="text-[13px] font-bold text-zinc-500">
                          预估总额
                        </span>
                        <span className="text-[16px] font-black text-blue-600">
                          ￥
                          {(
                            orderAmount.law * 45 +
                            orderAmount.civil * 60
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2.5">
                        <button
                          onClick={() => {
                            if (orderLocked) {
                              setOrderLocked(false);
                              showToast("请在班委封账前修改");
                            }
                          }}
                          disabled={!orderLocked}
                          className={`font-bold text-[13px] py-2.5 rounded-xl transition-colors flex-[0.4] ${
                            orderLocked
                              ? "bg-zinc-100 text-zinc-600 active:bg-zinc-200"
                              : "bg-transparent text-zinc-400 border border-zinc-200"
                          }`}
                        >
                          修改订单
                        </button>
                        <button
                          onClick={handleOrderSubmit}
                          disabled={orderLocked || isOrderSubmitting}
                          className={`flex-1 font-bold text-[13px] py-2.5 rounded-xl transition-colors ${
                            orderLocked
                              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                              : isOrderSubmitting
                                ? "bg-blue-300 text-white cursor-wait"
                                : "bg-blue-600 text-white active:bg-blue-700 shadow-sm"
                          }`}
                        >
                          {orderLocked
                            ? "🔒 交易快照已固化"
                            : isOrderSubmitting
                              ? "..."
                              : "确认征订并存证"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // Generic pending task card
              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-[20px] p-4 border shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden active:scale-[0.98] transition-all ${
                    task.priority === "high"
                      ? "border-red-100"
                      : "border-zinc-200/60"
                  }`}
                >
                  {task.priority === "high" && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                  )}
                  <div className={`${task.priority === "high" ? "pl-1" : ""}`}>
                    <h4 className="text-[15px] font-bold text-zinc-900 mb-1.5 line-clamp-1">
                      {task.title}
                    </h4>
                    <p className="text-[12px] text-zinc-500 flex items-center gap-1.5 font-medium">
                      <Clock
                        size={14}
                        className={
                          task.priority === "high"
                            ? "text-red-500"
                            : "text-zinc-400"
                        }
                      />
                      {task.deadline}
                    </p>
                    <button
                      onClick={() => setActiveTaskForm(task.formId!)}
                      className={`mt-4 font-bold text-[13px] py-2.5 rounded-xl w-full ${
                        task.priority === "high"
                          ? "bg-red-50 text-red-600 active:bg-red-100"
                          : "bg-[#f6f7f9] text-zinc-700 active:bg-zinc-200"
                      }`}
                    >
                      查阅与提交
                    </button>
                  </div>
                </div>
              );
            }

            // Completed task card
            return (
              <div
                key={task.id}
                className="bg-white rounded-[20px] p-4 border border-zinc-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between"
              >
                <div className="pr-4 min-w-0">
                  <h4 className="text-[15px] font-bold text-zinc-900 mb-1.5 line-through decoration-zinc-300 truncate">
                    {task.title}
                  </h4>
                  <p className="text-[12px] text-zinc-400 font-medium">
                    {task.deadline}
                  </p>
                </div>
                <div className="w-[34px] h-[34px] rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                  <Check
                    size={18}
                    className="text-green-600"
                    strokeWidth={3}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}