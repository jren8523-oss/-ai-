"use client";

import { StudentView } from "@/src/components/StudentView";
import Link from "next/link";
import { ChevronLeft, MoreHorizontal } from "lucide-react";

export default function StudentPage() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4 antialiased sm:p-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Physical Container Limit */}
      <div className="w-[390px] h-[844px] bg-[#f6f7f9] rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col border-[12px] border-[#101010] shrink-0">
        {/* Fake Phone Notch */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none">
          <div className="w-[124px] h-7 bg-[#101010] rounded-b-3xl"></div>
        </div>

        {/* Top Navigation */}
        <div className="pt-[54px] pb-0 px-0 bg-white sticky top-0 z-40 flex flex-col border-b border-zinc-100/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] shrink-0">
          <div className="flex items-center justify-between px-3 h-10 w-full relative">
            <Link
              href="/"
              className="p-1.5 -ml-1.5 text-zinc-900 active:bg-zinc-200/60 rounded-full transition-colors flex items-center absolute left-3 z-10"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </Link>
            <div className="text-[18px] font-bold text-black tracking-wide w-full text-center pointer-events-none truncate px-10">
              我的班级
            </div>
            <button className="p-1.5 -mr-1.5 text-zinc-900 active:bg-zinc-200/60 rounded-full transition-colors flex items-center absolute right-3 z-10">
              <MoreHorizontal size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden relative">
          <StudentView />
        </div>
      </div>
    </div>
  );
}
