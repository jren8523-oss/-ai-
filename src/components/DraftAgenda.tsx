"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalendar, type DraftAgendaItem } from "@/src/store/calendarStore";

interface SourceColor {
  bg: string;
  border: string;
  accent: string;
  text: string;
  dot: string;
}

interface DraftAgendaProps {
  draftSourceColor?: (sourceId: string) => SourceColor;
  selectedSourceId?: string | null;
}

export default function DraftAgenda({
  draftSourceColor,
  selectedSourceId,
}: DraftAgendaProps = {}) {
  const { state, confirmItem, updateDraftItem, pendingDraftCount } = useCalendar();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editRequirements, setEditRequirements] = useState("");

  const startEdit = useCallback((item: DraftAgendaItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDate(item.date);
    setEditLocation(item.location || "");
    setEditRequirements(item.requirements || "");
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const saveEdit = useCallback(
    (id: string) => {
      updateDraftItem(id, editTitle, editDate, editLocation || undefined, editRequirements || undefined);
      setEditingId(null);
    },
    [editTitle, editDate, editLocation, editRequirements, updateDraftItem],
  );

  const draftItems = state.draftAgenda;

  if (draftItems.length === 0 && !state.isProcessing) return null;

  return (
    <div className="space-y-3">
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wide">
          建议日程列表
        </span>
        {pendingDraftCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-[10px] font-medium text-amber-600 border border-amber-200">
            {pendingDraftCount} 待确认
          </span>
        )}
        {pendingDraftCount === 0 && draftItems.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-medium text-emerald-600 border border-emerald-200">
            全部确认
          </span>
        )}
      </div>

      {/* ── Processing Animation ──────────────────── */}
      <AnimatePresence>
        {state.isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl bg-white border border-indigo-100 shadow-sm overflow-hidden"
          >
            <div className="p-4">
              {/* Scanning indicators */}
              <div className="space-y-2 mb-4">
                {state.sources.map((src, idx) => (
                  <motion.div
                    key={src.id}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: idx * 0.4, duration: 0.6 }}
                    className="h-1.5 rounded-full bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-300 origin-left"
                    style={{ width: `${70 + Math.random() * 30}%` }}
                  />
                ))}
              </div>

              {/* Progress text */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2.5 text-xs text-zinc-500"
              >
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-indigo-400"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </motion.svg>
                 <motion.span
                   key={state.sources.length}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                 >
                   正在处理中…
                 </motion.span>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Draft Items List ──────────────────────── */}
      <AnimatePresence>
        {draftItems.length > 0 && !state.isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1"
          >
            {draftItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                layout
              >
                {editingId === item.id ? (
                  /* ── Edit Mode ──────────────────── */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl bg-white border border-amber-200 shadow-sm p-3 space-y-2.5"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 mb-1 block">日程标题</label>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-sm text-zinc-700 focus:outline-none focus:border-amber-300 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 mb-1 block">日期</label>
                        <input
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-sm text-zinc-700 focus:outline-none focus:border-amber-300 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 mb-1 block">地点</label>
                        <input
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-sm text-zinc-700 focus:outline-none focus:border-amber-300 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 mb-1 block">要求</label>
                        <input
                          value={editRequirements}
                          onChange={(e) => setEditRequirements(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-sm text-zinc-700 focus:outline-none focus:border-amber-300 transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        放弃
                      </button>
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all"
                      >
                        保存并确认
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* ── Display Mode ────────────────── */
                  <motion.div
                    layout
                  className={`rounded-xl border p-3 transition-all duration-200 ${
                      item.confirmed
                        ? "bg-emerald-50/50 border-emerald-100"
                        : selectedSourceId && item.sourceId === selectedSourceId
                          ? "shadow-md scale-[1.01]"
                          : "hover:border-zinc-200 hover:shadow-sm"
                    } ${
                      !item.confirmed
                        ? (() => {
                            const c = draftSourceColor?.(item.sourceId);
                            return c ? `${c.border} ${c.bg}` : "bg-white border-zinc-100";
                          })()
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status indicator */}
                      <div className="mt-0.5 flex-shrink-0">
                        {item.confirmed ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </motion.div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-amber-300 bg-amber-50" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-medium truncate ${item.confirmed ? "text-zinc-400 line-through decoration-zinc-300" : (() => { const c = draftSourceColor?.(item.sourceId); return c ? c.text : "text-zinc-800"; })()}`}>
                            {item.title}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-500 font-mono whitespace-nowrap">
                            {item.date}
                          </span>
                        </div>

                        {item.time && (
                          <div className="mt-1 text-[11px] text-zinc-500 font-medium">
                            {item.time}
                          </div>
                        )}
                        {item.location && (
                          <div className="mt-0.5 text-[10px] text-zinc-400">
                            {item.location}
                          </div>
                        )}

                      </div>

                      {/* Actions */}
                      {!item.confirmed && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startEdit(item)}
                            className="px-2.5 py-1 text-[11px] rounded-lg border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
                          >
                            修改
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => confirmItem(item.id)}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-all"
                          >
                            确认
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}