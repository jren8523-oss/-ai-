"use client";
import React, { useState } from "react";
import { BarChart3 } from "lucide-react";

interface ScheduleCardProps {
  messageId: string;
}

const DAYS = ["周一", "周二", "周三", "周四", "周五"];

export default function ScheduleCard({ messageId }: ScheduleCardProps) {
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);

  const toggleDay = (day: string) => {
    if (confirmed) return;
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-w-[85%] w-full">
      <div className="flex items-center gap-1.5 mb-3">
        <BarChart3 size={16} className="text-blue-500" />
        <h3 className="text-sm font-semibold text-zinc-800">📊 统计晚自习出勤情况</h3>
      </div>

      <p className="text-xs text-gray-500 mb-3">请选择有晚课的日期（可多选），用于出勤统计：</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {DAYS.map((day) => {
          const active = selectedDays.has(day);
          return (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              disabled={confirmed}
              className={`min-w-[44px] min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                confirmed
                  ? active
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : "bg-gray-50 text-gray-400 border-gray-100"
                  : active
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-600 border-gray-200 active:bg-gray-200"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => { if (!confirmed) setConfirmed(true); }}
        disabled={confirmed || selectedDays.size === 0}
        className={`w-full font-bold min-h-[44px] py-2.5 rounded-full flex items-center justify-center gap-2 transition-all ${
          confirmed
            ? "bg-green-50 text-green-600 border border-green-200 cursor-not-allowed"
            : selectedDays.size === 0
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white active:bg-blue-600"
        }`}
      >
        {confirmed
          ? `✅ 已确认 — 选择了 ${selectedDays.size} 天有晚课`
          : selectedDays.size === 0
          ? "请选择有晚课的日期"
          : `确认统计 (${selectedDays.size}天)`}
      </button>
    </div>
  );
}