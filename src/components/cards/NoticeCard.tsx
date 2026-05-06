"use client";
import React, { useState } from "react";
import { Megaphone, CalendarPlus } from "lucide-react";

interface NoticeCardProps {
  messageId: string;
  title?: string;
  content?: string;
}

export default function NoticeCard({
  messageId,
  title = "班级通知",
  content = "下周一体测，请大家做好准备，穿运动服带学生证。",
}: NoticeCardProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  const handleAddToCalendar = () => {
    if (addedToCalendar) return;
    // Generate a .ics file for the notice event
    const now = new Date();
    const nextMonday = new Date();
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(9, 0, 0, 0);

    const formatDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const dtStart = formatDate(nextMonday);
    const dtEnd = formatDate(new Date(nextMonday.getTime() + 2 * 60 * 60 * 1000));

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Class Assistant//Notice Event//CN",
      "BEGIN:VEVENT",
      `UID:${messageId}-notice@class-assistant`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${content.replace(/,/g, "\\,")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setAddedToCalendar(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-w-[85%] w-full">
      <div className="flex items-center gap-1.5 mb-3">
        <Megaphone size={16} className="text-blue-500" />
        <h3 className="text-sm font-semibold text-zinc-800">📢 {title}</h3>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-3 mb-4">
        <p className="text-xs text-zinc-700 leading-relaxed">{content}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!acknowledged) setAcknowledged(true);
          }}
          disabled={acknowledged}
          className={`flex-1 font-bold py-2.5 rounded-full flex items-center justify-center gap-2 transition-all ${
            acknowledged
              ? "bg-green-50 text-green-600 border border-green-200 cursor-not-allowed"
              : "bg-blue-500 text-white active:bg-blue-600"
          }`}
        >
          {acknowledged ? "✅ 已确认" : "已读确认"}
        </button>
        <button
          onClick={handleAddToCalendar}
          disabled={addedToCalendar}
          className={`flex-1 font-bold py-2.5 rounded-full flex items-center justify-center gap-2 transition-all ${
            addedToCalendar
              ? "bg-green-50 text-green-600 border border-green-200 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 active:bg-gray-200"
          }`}
        >
          <CalendarPlus size={14} />
          {addedToCalendar ? "✅ 已添加" : "加入日历"}
        </button>
      </div>
    </div>
  );
}