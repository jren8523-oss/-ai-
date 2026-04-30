"use client";
import React from "react";
import { ChevronLeft, MoreHorizontal } from "lucide-react";

interface ClassHeaderProps {
  currentOrgName: string;
  activeTab: "assistant" | "vault";
  setActiveTab: (tab: "assistant" | "vault") => void;
  currentOrgRole: "admin" | "member";
  onBack: () => void;
}

export default function ClassHeader({
  currentOrgName,
  activeTab,
  setActiveTab,
  currentOrgRole,
  onBack,
}: ClassHeaderProps) {
  return (
    <>
      {/* Class Top Nav */}
      <div className="pt-[52px] pb-2.5 px-3 bg-[#f6f7f9] sticky top-0 z-40 flex items-center shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 text-zinc-900 active:bg-zinc-200/60 rounded-full transition-colors flex items-center absolute left-3"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="text-[18px] font-bold text-black tracking-wide w-full text-center pointer-events-none truncate px-10">
          {currentOrgName}
        </div>
        <button className="p-1.5 -mr-1.5 text-zinc-900 active:bg-zinc-200/60 rounded-full transition-colors flex items-center absolute right-3">
          <MoreHorizontal size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Tab Toggle (Level Tabs) */}
      <div className="flex px-4 shrink-0 bg-[#f6f7f9] relative z-30 pt-1 border-b border-zinc-200/50">
        <div className="flex w-full justify-center gap-10 pb-2 relative">
          <button
            onClick={() => setActiveTab("assistant")}
            className={`text-[15px] pb-1.5 transition-colors relative font-medium ${activeTab === "assistant" ? "text-blue-500 font-bold" : "text-zinc-500"}`}
          >
            {currentOrgRole === "member" ? "智能助理" : "呼叫 AI"}
            {activeTab === "assistant" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("vault")}
            className={`text-[15px] pb-1.5 transition-colors relative font-medium ${activeTab === "vault" ? "text-blue-500 font-bold" : "text-zinc-500"}`}
          >
            {currentOrgRole === "member" ? "智能资产仓" : "管理工作台"}
            {activeTab === "vault" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}