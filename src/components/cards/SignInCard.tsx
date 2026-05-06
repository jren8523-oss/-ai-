"use client";
import React, { useState } from "react";
import { MapPin, CheckCircle } from "lucide-react";

interface SignInCardProps {
  messageId: string;
  deadline?: string;
  location?: string;
  range?: string;
}

export default function SignInCard({ messageId, deadline = "今晚 21:00", location = "3教101", range = "500米内" }: SignInCardProps) {
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-w-[85%] w-full">
      <div className="flex items-center gap-1.5 mb-3">
        <MapPin size={16} className="text-blue-500" />
        <h3 className="text-sm font-semibold text-zinc-800">📍 发布签到</h3>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
          <span className="text-xs text-gray-500">截止时间</span>
          <span className="text-xs font-semibold text-zinc-800">{deadline}</span>
        </div>
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
          <span className="text-xs text-gray-500">地点</span>
          <span className="text-xs font-semibold text-zinc-800">{location}</span>
        </div>
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
          <span className="text-xs text-gray-500">有效范围</span>
          <span className="text-xs font-semibold text-zinc-800">{range}</span>
        </div>
      </div>

      <button
        onClick={() => { if (!checkedIn) setCheckedIn(true); }}
        disabled={checkedIn}
        className={`w-full font-bold min-h-[44px] py-2.5 rounded-full flex items-center justify-center gap-2 transition-all ${
          checkedIn
            ? "bg-green-50 text-green-600 border border-green-200 cursor-not-allowed"
            : "bg-blue-500 text-white active:bg-blue-600"
        }`}
      >
        {checkedIn ? (
          <>
            <CheckCircle size={16} /> ✅ 已签到 &nbsp;位置已记录
          </>
        ) : (
          "立即签到"
        )}
      </button>
    </div>
  );
}