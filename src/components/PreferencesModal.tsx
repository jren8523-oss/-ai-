"use client";
import React from "react";
import { X } from "lucide-react";

interface PreferencesModalProps {
  show: boolean;
  onClose: () => void;
  persona: string;
  setPersona: (p: string) => void;
  nudgeLevel: string;
  setNudgeLevel: (n: string) => void;
  studentExtraMsgs: string[];
  setStudentExtraMsgs: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function PreferencesModal({
  show,
  onClose,
  persona,
  setPersona,
  nudgeLevel,
  setNudgeLevel,
  studentExtraMsgs,
  setStudentExtraMsgs,
}: PreferencesModalProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-[120] flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="bg-white w-full rounded-t-[2rem] relative z-10 bottom-0 animate-in slide-in-from-bottom-full duration-300">
        <div className="px-6 pt-5 pb-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-8"></div>
            <h3 className="text-[17px] font-bold text-zinc-900 tracking-tight">
              助理设定
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-zinc-100 rounded-full text-zinc-500 active:scale-95 transition-transform"
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <span className="text-[13px] font-bold text-zinc-500 mb-3 block">
              助理人格 (Persona)
            </span>
            <div className="flex flex-wrap gap-2.5">
              {["严谨辅导员", "摸鱼同桌", "律政先锋"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  className={`px-4 py-2 rounded-full text-[14px] font-bold transition-colors ${persona === p ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-[#f6f7f9] text-zinc-600 border border-transparent"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[13px] font-bold text-zinc-500 mb-3 block">
              免打扰级别 (Nudge)
            </span>
            <div className="flex flex-wrap gap-2.5">
              {["强提醒", "常规", "考前突击模式"].map((n) => (
                <button
                  key={n}
                  onClick={() => setNudgeLevel(n)}
                  className={`px-4 py-2 rounded-full text-[14px] font-bold transition-colors ${nudgeLevel === n ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-[#f6f7f9] text-zinc-600 border border-transparent"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              setStudentExtraMsgs([
                ...studentExtraMsgs,
                `设置已生效！现在我是你的${persona}了，有事直接吩咐~`,
              ]);
            }}
            className="w-full bg-zinc-900 text-white font-bold text-[15px] py-3.5 rounded-2xl active:scale-[0.98] transition-transform shadow-[0_4px_12px_rgba(0,0,0,0.1)] mt-2"
          >
            保存并应用
          </button>
        </div>
      </div>
    </div>
  );
}
