"use client";
import React, { useState } from "react";
import { Megaphone } from "lucide-react";

interface NoticeCardProps {
  messageId: string;
  title?: string;
  content?: string;
}

export default function NoticeCard({
  messageId,
  title = "重要通知",
  content = "下周一体测，请大家做好准备，穿运动服带学生证。",
}: NoticeCardProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-w-[85%] w-full">
      <div className="flex items-center gap-1.5 mb-3">
        <Megaphone size={16} className="text-blue-500" />
        <h3 className="text-sm font-semibold text-zinc-800">📢 {title}</h3>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-3 mb-4">
        <p className="text-xs text-zinc-700 leading-relaxed">{content}</p>
      </div>

      <button
        onClick={() => { if (!acknowledged) setAcknowledged(true); }}
        disabled={acknowledged}
        className={`w-full font-bold py-2.5 rounded-full flex items-center justify-center gap-2 transition-all ${
          acknowledged
            ? "bg-green-50 text-green-600 border border-green-200 cursor-not-allowed"
            : "bg-blue-500 text-white active:bg-blue-600"
        }`}
      >
        {acknowledged ? "✅ 已确认收到" : "确认收到"}
      </button>
    </div>
  );
}