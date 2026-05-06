"use client";

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SourcePanel from "@/src/components/SourcePanel";
import DraftAgenda from "@/src/components/DraftAgenda";
import { useCalendar } from "@/src/store/calendarStore";
import { mockParsing } from "@/src/store/calendarStore";

export default function CalendarView() {
  const { state, startParsing, completeParsing, resetDraft } = useCalendar();
  const hasSources = state.sources.length > 0;
  const hasDraft = state.draftAgenda.length > 0;
  const isProcessing = state.isProcessing;

  const handleSmartParse = useCallback(() => {
    if (isProcessing || !hasSources) return;
    startParsing();

    // Simulate AI processing delay
    setTimeout(() => {
      const results = mockParsing(state.sources);
      completeParsing(results);
    }, 2000);
  }, [isProcessing, hasSources, state.sources, startParsing, completeParsing]);

  const handleReset = useCallback(() => {
    resetDraft();
  }, [resetDraft]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ────────────────────────────────── */}
      <div className="p-4 pb-2 border-b border-zinc-100">
        <h2 className="text-base font-bold text-zinc-800">日历</h2>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          上传通知、截图或粘贴文字，AI 帮你提取日程
        </p>
      </div>

      {/* ── Scrollable Content ──────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
        {/* ── Step 1: Source Collection ─────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
              1
            </span>
            <span className="text-xs font-medium text-zinc-600">添加素材</span>
          </div>
          <SourcePanel />
        </section>

        {/* ── Smart Parse Button ─────────────────── */}
        <AnimatePresence>
          {hasSources && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-center"
            >
              {!isProcessing && !hasDraft && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSmartParse}
                  disabled={isProcessing}
                  className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                  智能整理
                </motion.button>
              )}

              {isProcessing && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50 border border-indigo-100"
                >
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-indigo-500"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </motion.svg>
                  <span className="text-xs text-indigo-600 font-medium">AI 正在解析素材…</span>
                </motion.div>
              )}

              {hasDraft && !isProcessing && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleReset}
                  className="px-4 py-2 rounded-full border border-zinc-200 text-xs text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-all"
                >
                  重新整理
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step 2: Draft Agenda ──────────────── */}
        {(hasDraft || isProcessing) && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span className="text-xs font-medium text-zinc-600">审阅议程</span>
            </div>
            <DraftAgenda />
          </section>
        )}

        {/* ── Step 3: Confirmed hint ─────────────── */}
        {state.confirmedEvents.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span className="text-xs font-medium text-zinc-600">已确认日程</span>
            </div>
            <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-3">
              <div className="space-y-1.5">
                {state.confirmedEvents.slice(-5).reverse().map((evt) => (
                  <div key={evt.id} className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-zinc-600 font-medium truncate">{evt.title}</span>
                    <span className="text-zinc-400 text-[10px] font-mono whitespace-nowrap">{evt.date}</span>
                    {evt.location && <span className="text-zinc-300 text-[10px] truncate ml-auto">{evt.location}</span>}
                  </div>
                ))}
              </div>
              {state.confirmedEvents.length > 5 && (
                <p className="text-[10px] text-zinc-400 mt-2 text-center">
                  …共 {state.confirmedEvents.length} 条已确认日程
                </p>
              )}
            </div>
          </motion.section>
        )}

        {/* ── Empty state ────────────────────────── */}
        {!hasSources && !hasDraft && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl mb-3"
            >
              📎
            </motion.div>
            <p className="text-sm text-zinc-400 font-medium mb-1">还没有素材</p>
            <p className="text-[11px] text-zinc-300 max-w-[200px]">
              拖拽文件、上传图片或直接粘贴文字开始
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}