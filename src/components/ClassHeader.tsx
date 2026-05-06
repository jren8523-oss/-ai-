"use client";
import React from "react";
import { ChevronLeft, MoreHorizontal, Shield } from "lucide-react";

interface ClassHeaderProps {
  currentOrgName: string;
  activeTab: "assistant" | "vault";
  setActiveTab: (tab: "assistant" | "vault") => void;
  currentOrgRole: "admin" | "member";
  setCurrentOrgRole?: (role: "admin" | "member") => void;
  onBack: () => void;
}

export default function ClassHeader({
  currentOrgName,
  activeTab,
  setActiveTab,
  currentOrgRole,
  setCurrentOrgRole,
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
        <div className="text-[18px] font-bold text-black tracking-wide w-full text-center pointer-events-none truncate px-10 flex items-center justify-center gap-1.5">
          {currentOrgName}
          {currentOrgRole === "admin" && (
            <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 text-[11px] font-bold shrink-0">
              <Shield size={12} strokeWidth={2.5} />
              班委
            </span>
          )}
        </div>
        <button className="p-1.5 -mr-1.5 text-zinc-900 active:bg-zinc-200/60 rounded-full transition-colors flex items-center absolute right-3">
          <MoreHorizontal size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Role Switcher */}
      {setCurrentOrgRole && (
        <div className="flex justify-center px-4 pt-2 pb-1 bg-[#f6f7f9] z-30 shrink-0">
          <div className="flex bg-zinc-100 rounded-full p-0.5 gap-0.5">
            <button
              onClick={() => setCurrentOrgRole("admin")}
              className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                currentOrgRole === "admin"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              我是班委
            </button>
            <button
              onClick={() => setCurrentOrgRole("member")}
              className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                currentOrgRole === "member"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              我是同学
            </button>
          </div>
        </div>
      )}

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
