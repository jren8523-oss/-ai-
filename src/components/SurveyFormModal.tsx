"use client";
import React from "react";
import { X } from "lucide-react";

interface SurveyFormModalProps {
  show: boolean;
  onClose: () => void;
  surveyIntention: string;
  setSurveyIntention: (i: string) => void;
  isSurveySubmitting: boolean;
  onSubmit: () => void;
}

export default function SurveyFormModal({
  show,
  onClose,
  surveyIntention,
  setSurveyIntention,
  isSurveySubmitting,
  onSubmit,
}: SurveyFormModalProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="bg-white w-full rounded-t-[2rem] relative z-10 bottom-0 animate-in slide-in-from-bottom-full duration-300">
        <div className="px-6 pt-5 pb-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-8"></div>
            <h3 className="text-[17px] font-bold text-zinc-900 tracking-tight">
              《毕业流向及意愿摸底调查》
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-zinc-100 rounded-full text-zinc-500 active:scale-95 transition-transform"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Read-only Identity Card */}
            <div className="bg-[#f6f7f9] p-4 rounded-[16px] border border-zinc-100">
              <span className="text-[11px] font-bold text-zinc-400 block mb-2">
                已锁定身份映射
              </span>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-zinc-600 font-medium">姓名</span>
                <span className="font-bold text-zinc-900">张三</span>
              </div>
              <div className="flex justify-between items-center text-[14px] mt-2 border-t border-zinc-200/50 pt-2">
                <span className="text-zinc-600 font-medium">专业</span>
                <span className="font-bold text-zinc-900">
                  计算机科学与技术
                </span>
              </div>
            </div>

            {/* Intent Selection */}
            <div>
              <span className="text-[13px] font-bold text-zinc-500 mb-3 block">
                你的毕业意向是 (单选){" "}
                <span className="text-red-500">*</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {["考研", "考公", "就业", "出国"].map((intent) => (
                  <button
                    key={intent}
                    onClick={() => setSurveyIntention(intent)}
                    className={`px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${
                      surveyIntention === intent
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "bg-white text-zinc-600 border border-zinc-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                    }`}
                  >
                    {intent}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-center text-[11px] text-zinc-400 font-medium mb-3">
              点击提交即代表本人电子签名确权
            </p>
            <button
              onClick={onSubmit}
              disabled={isSurveySubmitting}
              className={`w-full font-bold text-[15px] py-3.5 rounded-2xl active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${
                isSurveySubmitting
                  ? "bg-zinc-200 text-zinc-500"
                  : "bg-blue-600 text-white active:bg-blue-700"
              }`}
            >
              {isSurveySubmitting
                ? "加密存证中..."
                : "确认无误，一键提交"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
