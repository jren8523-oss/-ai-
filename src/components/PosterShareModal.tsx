"use client";
import React from "react";

interface PosterShareModalProps {
  show: boolean;
  onClose: () => void;
}

export default function PosterShareModal({ show, onClose }: PosterShareModalProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative z-10 animate-in zoom-in-95 duration-300 w-full flex flex-col items-center gap-6 pb-12">
        {/* Poster Card */}
        <div className="w-[320px] bg-white rounded-[32px] overflow-hidden shadow-2xl relative">
          <img
            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop"
            className="w-full h-48 object-cover"
            alt="Class event cover"
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-[12px] font-black text-blue-600">
              本周简报
            </span>
          </div>

          <div className="p-6 text-center space-y-4">
            <h2 className="text-[24px] font-black tracking-tight text-zinc-900 border-b border-zinc-100 pb-4">
              法学256班
            </h2>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="flex flex-col items-center">
                <span className="text-[32px] font-black text-amber-500 leading-tight">
                  12
                </span>
                <span className="text-[12px] font-bold text-zinc-500 mt-1">
                  本周完成任务数
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[32px] font-black text-green-500 leading-tight">
                  100<span className="text-[18px]">%</span>
                </span>
                <span className="text-[12px] font-bold text-zinc-500 mt-1">
                  全班考勤率
                </span>
              </div>
            </div>

            <p className="text-[12px] text-zinc-400 font-medium pt-2">
              — 智能助理 AI Studio 生成 —
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-[320px] flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white font-bold text-[15px] py-4 rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all"
          >
            保存到本地 / 转发到频道
          </button>
          <button
            onClick={onClose}
            className="w-full bg-white/20 text-white font-bold text-[15px] py-3 rounded-xl backdrop-blur-sm active:bg-white/30 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}