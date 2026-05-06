"use client";
import React, { useState, useEffect } from "react";
import {
  MapPin, CheckCircle, Calendar, BookOpen, Bell,
  Plus, Minus, ChevronDown, ChevronUp, Send, Clock,
  User, Users,
} from "lucide-react";
import type { StoredTask } from "@/src/lib/taskStore";
import type {
  CheckinTaskData,
  ScheduleTaskData,
  BookOrderTaskData,
  NoticeTaskData,
} from "@/src/lib/taskProtocol";

// ============================================================
// TaskCards — 四种班级任务交互卡片
// ============================================================

interface TaskCardsProps {
  tasks: StoredTask[];
  role: "admin" | "member"; // 班委 / 同学
  simulatedUserId: string;
  onResponded?: () => void; // 响应成功后回调（刷新列表）
  onViewSummary?: (taskId: string) => void;
}

// ── 签到卡片 ──
const CheckinCard: React.FC<{
  task: StoredTask;
  role: "admin" | "member";
  simulatedUserId: string;
  onResponded?: () => void;
  onViewSummary?: (taskId: string) => void;
}> = ({ task, role, simulatedUserId, onResponded, onViewSummary }) => {
  const data = task.data as CheckinTaskData;
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState("");

  useEffect(() => {
    const existing = task.responses.find((r) => r.userId === simulatedUserId);
    if (existing) setDone(true);
  }, [task.responses, simulatedUserId]);

  const handleCheckin = () => {
    if (done || submitting) return;
    setSubmitting(true);
    setLocError("");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: parseFloat(pos.coords.latitude.toFixed(6)),
            lng: parseFloat(pos.coords.longitude.toFixed(6)),
          };
          setLocation(loc);
          submitResponse(loc);
        },
        (err) => {
          setLocError("无法获取位置：" + err.message);
          setSubmitting(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocError("浏览器不支持定位");
      setSubmitting(false);
    }
  };

  const submitResponse = async (loc: { lat: number; lng: number }) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: simulatedUserId,
          response: { action: "签到", location: loc },
        }),
      });
      if (res.ok) {
        setDone(true);
        onResponded?.();
      }
    } catch (e) {
      console.error("签到提交失败", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden w-full border border-emerald-100/60">
      <div className="bg-emerald-50/80 px-4 py-3 border-b border-emerald-100/50 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
          <MapPin size={12} strokeWidth={3} />
        </div>
        <span className="text-[14px] font-bold text-emerald-900">签到任务</span>
        <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-md ${
          done ? "text-emerald-600 bg-emerald-100/60" : "text-emerald-500 bg-emerald-100/50"
        }`}>
          {done ? "已完成" : "待签到"}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
          <span className="text-[13px] text-zinc-500 font-medium">签到地点</span>
          <span className="text-[13px] text-zinc-800 font-bold">{data.location}</span>
        </div>
        <div className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
          <span className="text-[13px] text-zinc-500 font-medium">截止时间</span>
          <span className="text-[13px] text-zinc-800 font-bold flex items-center gap-1">
            <Clock size={14} /> {data.deadline}
          </span>
        </div>

        {role === "member" ? (
          <>
            <button
              onClick={handleCheckin}
              disabled={done || submitting}
              className={`w-full font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                done
                  ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                  : "bg-emerald-500 text-white active:bg-emerald-600"
              }`}
            >
              {submitting ? "定位中..." : done ? <>✅ 已签到</> : <><MapPin size={18} /> 确认签到</>}
            </button>
            {location && (
              <div className="text-[11px] text-zinc-400 text-center">
                已上传位置: {location.lat}, {location.lng}
              </div>
            )}
            {locError && (
              <div className="text-[11px] text-red-400 text-center">{locError}</div>
            )}
          </>
        ) : (
          <button
            onClick={() => onViewSummary?.(task.id)}
            className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl active:bg-indigo-600 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Users size={18} /> 查看签到统计 ({task.responses.length} 人)
          </button>
        )}
      </div>
    </div>
  );
};

// ── 课表统计卡片 ──
const DAYS = ["周一", "周二", "周三", "周四", "周五"] as const;

const ScheduleCard: React.FC<{
  task: StoredTask;
  role: "admin" | "member";
  simulatedUserId: string;
  onResponded?: () => void;
  onViewSummary?: (taskId: string) => void;
}> = ({ task, role, simulatedUserId, onResponded, onViewSummary }) => {
  const data = task.data as ScheduleTaskData;
  const [selections, setSelections] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const existing = task.responses.find((r) => r.userId === simulatedUserId);
    if (existing && existing.response.selections) {
      setSelections(existing.response.selections as Record<string, boolean>);
      setDone(true);
    }
  }, [task.responses, simulatedUserId]);

  const toggle = (day: string) => {
    if (done) return;
    setSelections((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSubmit = async () => {
    if (done || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: simulatedUserId,
          response: { selections },
        }),
      });
      if (res.ok) {
        setDone(true);
        onResponded?.();
      }
    } catch (e) {
      console.error("课表提交失败", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden w-full border border-blue-100/60">
      <div className="bg-blue-50/80 px-4 py-3 border-b border-blue-100/50 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
          <Calendar size={12} strokeWidth={3} />
        </div>
        <span className="text-[14px] font-bold text-blue-900">课表统计</span>
        <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-md ${
          done ? "text-emerald-600 bg-emerald-100/60" : "text-blue-500 bg-blue-100/50"
        }`}>
          {done ? "已提交" : "待填写"}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-[13px] text-zinc-600 font-medium">{data.question}</p>
        <div className="space-y-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-xl border border-zinc-100"
            >
              <span className="text-[13px] text-zinc-700 font-bold">{day}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => toggle(day)}
                  disabled={done}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all ${
                    selections[day]
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-zinc-500 border-zinc-200 hover:border-blue-300"
                  } ${done ? "opacity-60 cursor-not-allowed" : "active:scale-95"}`}
                >
                  有晚课
                </button>
                <button
                  onClick={() => toggle(day)}
                  disabled={done}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all ${
                    selections[day] === false
                      ? "bg-zinc-400 text-white border-zinc-400"
                      : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                  } ${done ? "opacity-60 cursor-not-allowed" : "active:scale-95"}`}
                >
                  没有晚课
                </button>
              </div>
            </div>
          ))}
        </div>

        {role === "member" ? (
          <button
            onClick={handleSubmit}
            disabled={done || submitting}
            className={`w-full font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
              done
                ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                : "bg-blue-500 text-white active:bg-blue-600"
            }`}
          >
            {submitting ? "提交中..." : done ? <>✅ 已提交</> : <><Send size={16} /> 提交</>}
          </button>
        ) : (
          <button
            onClick={() => onViewSummary?.(task.id)}
            className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl active:bg-indigo-600 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Users size={18} /> 查看统计 ({task.responses.length} 人)
          </button>
        )}
      </div>
    </div>
  );
};

// ── 订教材卡片 ──
const BookOrderCard: React.FC<{
  task: StoredTask;
  role: "admin" | "member";
  simulatedUserId: string;
  onResponded?: () => void;
  onViewSummary?: (taskId: string) => void;
}> = ({ task, role, simulatedUserId, onResponded, onViewSummary }) => {
  const data = task.data as BookOrderTaskData;
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const existing = task.responses.find((r) => r.userId === simulatedUserId);
    if (existing && existing.response.quantities) {
      setQuantities(existing.response.quantities as Record<number, number>);
      setDone(true);
    }
  }, [task.responses, simulatedUserId]);

  const adjust = (idx: number, delta: number) => {
    if (done) return;
    setQuantities((prev) => {
      const cur = prev[idx] || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [idx]: next };
    });
  };

  const totalPrice = data.books.reduce((sum, book, idx) => {
    return sum + (quantities[idx] || 0) * book.price;
  }, 0);

  const handleSubmit = async () => {
    if (done || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: simulatedUserId,
          response: { quantities },
        }),
      });
      if (res.ok) {
        setDone(true);
        onResponded?.();
      }
    } catch (e) {
      console.error("订教材提交失败", e);
    } finally {
      setSubmitting(false);
    }
  };

  // 班委汇总统计
  const summaryBooks = React.useMemo(() => {
    if (role !== "admin") return null;
    const summary: { name: string; price: number; totalQty: number }[] = data.books.map((b) => ({
      ...b,
      totalQty: 0,
    }));
    task.responses.forEach((r) => {
      const qty = (r.response as { quantities?: Record<number, number> }).quantities || {};
      Object.entries(qty).forEach(([idxStr, q]) => {
        const idx = parseInt(idxStr);
        if (summary[idx]) summary[idx].totalQty += q as number;
      });
    });
    return summary;
  }, [task.responses, data.books, role]);

  return (
    <div className="bg-white rounded-[20px] rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden w-full border border-orange-100/60">
      <div className="bg-orange-50/80 px-4 py-3 border-b border-orange-100/50 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white">
          <BookOpen size={12} strokeWidth={3} />
        </div>
        <span className="text-[14px] font-bold text-orange-900">订教材</span>
        <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-md ${
          done ? "text-emerald-600 bg-emerald-100/60" : "text-orange-500 bg-orange-100/50"
        }`}>
          {done ? "已订购" : "待订购"}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {data.books.map((book, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-100"
          >
            <div className="flex-1">
              <div className="text-[13px] text-zinc-800 font-bold">{book.name}</div>
              <div className="text-[12px] text-zinc-500">¥{book.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjust(idx, -1)}
                disabled={done || (quantities[idx] || 0) <= 0}
                className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 active:scale-95 transition-all"
              >
                <Minus size={14} />
              </button>
              <span className="text-[14px] font-bold text-zinc-800 w-6 text-center">
                {quantities[idx] || 0}
              </span>
              <button
                onClick={() => adjust(idx, 1)}
                disabled={done}
                className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 active:scale-95 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
          <span className="text-[13px] text-zinc-500 font-medium">合计</span>
          <span className="text-[14px] text-zinc-800 font-bold">¥{totalPrice.toFixed(2)}</span>
        </div>

        {role === "member" ? (
          <button
            onClick={handleSubmit}
            disabled={done || submitting}
            className={`w-full font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
              done
                ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                : "bg-orange-500 text-white active:bg-orange-600"
            }`}
          >
            {submitting ? "提交中..." : done ? <>✅ 已提交</> : <><Send size={16} /> 确认订购</>}
          </button>
        ) : (
          <>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="flex-1 bg-indigo-500 text-white font-bold py-3 rounded-xl active:bg-indigo-600 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Users size={18} />
                {showSummary ? "收起统计" : `查看统计 (${task.responses.length} 人)`}
                {showSummary ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            {showSummary && summaryBooks && (
              <div className="space-y-2 mt-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div className="text-[12px] text-zinc-500 font-bold mb-2">📊 汇总统计</div>
                {summaryBooks.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-[12px]">
                    <span className="text-zinc-700">{s.name}</span>
                    <span className="text-zinc-800 font-bold">{s.totalQty} 本 / ¥{(s.totalQty * s.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── 通知卡片 ──
const NoticeCard: React.FC<{
  task: StoredTask;
  role: "admin" | "member";
  simulatedUserId: string;
  onResponded?: () => void;
  onViewSummary?: (taskId: string) => void;
}> = ({ task, role, simulatedUserId, onResponded, onViewSummary }) => {
  const data = task.data as NoticeTaskData;
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const existing = task.responses.find((r) => r.userId === simulatedUserId);
    if (existing) setDone(true);
  }, [task.responses, simulatedUserId]);

  const handleConfirm = async () => {
    if (done || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: simulatedUserId,
          response: { action: "已读确认" },
        }),
      });
      if (res.ok) {
        setDone(true);
        onResponded?.();
      }
    } catch (e) {
      console.error("通知确认失败", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCalendar = () => {
    // 模拟添加到系统日历
    if (typeof window !== "undefined" && data.addToCalendar) {
      try {
        window.open("data:text/calendar;charset=utf-8," + encodeURIComponent(
          `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${data.content.slice(0, 50)}\nEND:VEVENT\nEND:VCALENDAR`
        ), "_blank");
      } catch (e) {
        // 静默失败
      }
    }
  };

  return (
    <div className="bg-white rounded-[20px] rounded-tl-sm shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden w-full border border-purple-100/60">
      <div className="bg-purple-50/80 px-4 py-3 border-b border-purple-100/50 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white">
          <Bell size={12} strokeWidth={3} />
        </div>
        <span className="text-[14px] font-bold text-purple-900">班级通知</span>
        <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-md ${
          done ? "text-emerald-600 bg-emerald-100/60" : "text-purple-500 bg-purple-100/50"
        }`}>
          {done ? "已确认" : "未确认"}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
          <p className="text-[14px] text-zinc-700 leading-relaxed">{data.content}</p>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-zinc-500">
          {data.needConfirm && <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">需确认</span>}
          {data.addToCalendar && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">可加日历</span>}
        </div>

        {role === "member" ? (
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={done || submitting}
              className={`flex-1 font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                done
                  ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                  : "bg-purple-500 text-white active:bg-purple-600"
              }`}
            >
              {submitting ? "提交中..." : done ? <>✅ 已确认</> : <><CheckCircle size={16} /> 已读确认</>}
            </button>
            {data.addToCalendar && !done && (
              <button
                onClick={handleAddToCalendar}
                className="px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold text-[13px] border border-blue-200 active:bg-blue-100 transition-all flex items-center gap-1.5"
              >
                <Calendar size={14} /> 加入日历
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => onViewSummary?.(task.id)}
            className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl active:bg-indigo-600 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Users size={18} /> 已确认 {task.responses.length} 人 / 详情
          </button>
        )}
      </div>
    </div>
  );
};

// ── Summary Popup (班委查看统计) ──
export const SummaryPopup: React.FC<{
  task: StoredTask;
  onClose: () => void;
}> = ({ task, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <div className="text-[15px] font-bold text-zinc-800">{task.type} · 汇总</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              创建于 {new Date(task.createdAt).toLocaleString("zh-CN")} · {task.responses.length} 人已响应
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-[20px]">&times;</button>
        </div>
        <div className="p-4 space-y-3">
          {task.responses.length === 0 ? (
            <div className="text-[13px] text-zinc-400 text-center py-8">暂无响应数据</div>
          ) : (
            task.responses.map((r, idx) => (
              <div key={idx} className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div className="flex items-center gap-2 mb-1.5">
                  <User size={14} className="text-zinc-400" />
                  <span className="text-[13px] font-bold text-zinc-700">{r.userId}</span>
                </div>
                <div className="text-[12px] text-zinc-500 font-mono bg-white p-2 rounded-lg">
                  {JSON.stringify(r.response, null, 2)}
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">
                  {new Date(r.respondedAt).toLocaleString("zh-CN")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ── 主导出组件 ──
const TaskCards: React.FC<TaskCardsProps> = ({
  tasks,
  role,
  simulatedUserId,
  onResponded,
  onViewSummary,
}) => {
  const renderCard = (task: StoredTask) => {
    switch (task.type) {
      case "签到":
        return (
          <CheckinCard
            key={task.id}
            task={task}
            role={role}
            simulatedUserId={simulatedUserId}
            onResponded={onResponded}
            onViewSummary={onViewSummary}
          />
        );
      case "课表统计":
        return (
          <ScheduleCard
            key={task.id}
            task={task}
            role={role}
            simulatedUserId={simulatedUserId}
            onResponded={onResponded}
            onViewSummary={onViewSummary}
          />
        );
      case "订教材":
        return (
          <BookOrderCard
            key={task.id}
            task={task}
            role={role}
            simulatedUserId={simulatedUserId}
            onResponded={onResponded}
            onViewSummary={onViewSummary}
          />
        );
      case "通知":
        return (
          <NoticeCard
            key={task.id}
            task={task}
            role={role}
            simulatedUserId={simulatedUserId}
            onResponded={onResponded}
            onViewSummary={onViewSummary}
          />
        );
      default:
        return null;
    }
  };

  if (tasks.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="text-[11px] text-zinc-400 font-bold px-1 uppercase tracking-wide">
        待处理任务 ({tasks.length})
      </div>
      {tasks.map(renderCard)}
    </div>
  );
};

export default TaskCards;