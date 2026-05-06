"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  Image,
  Loader2,
  CheckCircle2,
  Sparkles,
  Plus,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ClipboardPaste,
  Pencil,
  Trash2,
} from "lucide-react";
import { useCalendar, type SourceMaterial, type DraftAgendaItem, mockParsing, normalizeDate } from "@/src/store/calendarStore";
import Link from "next/link";

// ══════════════════════════════════════════════════════════
// Design Tokens — QQ Channel inspired light theme
// ══════════════════════════════════════════════════════════
const COLORS = {
  bg: "#f6f7f9",
  card: "#ffffff",
  text: "#1e293b",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  accent: "#4f46e5",
  accentLight: "#eef2ff",
  accentBorder: "#c7d2fe",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  border: "#e2e8f0",
  skeleton: "#f1f5f9",
};

// ── 周历头部组件 ─────────────────────────────────────────
function WeekHeader({
  events,
}: {
  events: { date: string; title: string; time?: string }[];
}) {
  const today = new Date();
  const weekDays: { label: string; date: Date; isToday: boolean }[] = [];
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    const dayLabels = ["一", "二", "三", "四", "五", "六", "日"];
    weekDays.push({ label: dayLabels[i], date: d, isToday });
  }

  function getEventsForDate(d: Date): { title: string; time?: string }[] {
    return events.filter((e) => {
      const norm = normalizeDate(e.date);
      return (
        norm.getDate() === d.getDate() &&
        norm.getMonth() === d.getMonth() &&
        norm.getFullYear() === d.getFullYear()
      );
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-[20px] p-4 shadow-sm border border-[#e8ecf1]"
    >
      {/* 月份标签 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-semibold text-[#1e293b] tracking-wide">
          {today.getFullYear()}年{today.getMonth() + 1}月 · 周历
        </h3>
        <span className="text-[10px] text-[#94a3b8] bg-[#f8fafc] px-2 py-0.5 rounded-full">
          已确认 {events.length} 项
        </span>
      </div>

      {/* 横向滚动的周历条 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {weekDays.map((wd, i) => {
          const dayEvents = getEventsForDate(wd.date);
          const hasEvents = dayEvents.length > 0;
          return (
            <div
              key={i}
              className={`flex-shrink-0 w-[60px] rounded-xl py-2.5 px-1 text-center transition-all ${
                wd.isToday
                  ? "bg-[#4f46e5] text-white shadow-md shadow-[#4f46e5]/20"
                  : hasEvents
                  ? "bg-[#eef2ff] text-[#4f46e5]"
                  : "bg-[#f8fafc] text-[#94a3b8]"
              }`}
            >
              <div className="text-[10px] opacity-70 mb-0.5">{wd.label}</div>
              <div className="text-[15px] font-semibold">{wd.date.getDate()}</div>
              {hasEvents && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {dayEvents.slice(0, 3).map((_, ei) => (
                    <div
                      key={ei}
                      className={`w-1 h-1 rounded-full ${
                        wd.isToday ? "bg-white" : "bg-[#4f46e5]"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 今日日程速览 */}
      <div className="mt-3 pt-3 border-t border-[#f1f5f9]">
        <AnimatePresence mode="wait">
          {(() => {
            const todayEvents = getEventsForDate(today);
            if (todayEvents.length === 0) {
              return (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[12px] text-[#94a3b8] text-center py-2"
                >
                  今日暂无已确认日程
                </motion.p>
              );
            }
            return (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-1.5"
              >
                {todayEvents.map((ev, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    <div className="w-1 h-4 rounded-full bg-[#4f46e5] flex-shrink-0" />
                    <span className="text-[#4f46e5] font-medium text-[11px] tabular-nums flex-shrink-0">
                      {ev.time || "全天"}
                    </span>
                    <span className="text-[#1e293b] truncate">{ev.title}</span>
                  </motion.div>
                ))}
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── 已确认事件卡片 ────────────────────────────────────────
function ConfirmedEventCard({
  event,
  index,
  onEdit,
  onDelete,
}: {
  event: { id: string; date: string; time?: string; title: string; location?: string };
  index: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-[#e8ecf1]"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#eef2ff] flex items-center justify-center">
        <CheckCircle2 size={16} className="text-[#4f46e5]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#1e293b] truncate">
          {event.title}
        </p>
        <p className="text-[11px] text-[#94a3b8] mt-0.5">
          {event.time ? `${event.time}  ` : ""}{event.date}
          {event.location ? ` · ${event.location}` : ""}
        </p>
      </div>
      {/* Edit & Delete icons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event.id);
            }}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#4f46e5] hover:bg-[#eef2ff] transition-colors"
            aria-label="编辑日程"
          >
            <Pencil size={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event.id);
            }}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
            aria-label="删除日程"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <span className="text-[10px] text-[#94a3b8] bg-[#f8fafc] px-2 py-0.5 rounded-full flex-shrink-0">
        已确认
      </span>
    </motion.div>
  );
}

// ── 草稿卡片（待确认） ──────────────────────────────────────
function DraftCard({
  draft,
  onConfirm,
  onDiscard,
}: {
  draft: DraftAgendaItem;
  onConfirm: (id: string) => void;
  onDiscard: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      exit={{ y: -40, opacity: 0, scale: 0.8, transition: { duration: 0.35, ease: "easeOut" } }}
      className="bg-[#fffdf5] border border-[#fef3c7] rounded-xl p-3.5"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#fef9c3] flex items-center justify-center">
          <AlertCircle size={14} className="text-[#f59e0b]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-semibold text-[#1e293b] truncate">
            {draft.title}
          </h4>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {draft.time && (
              <span className="text-[11px] text-[#94a3b8]">
                {draft.time}
              </span>
            )}
            {draft.location && (
              <span className="text-[11px] text-[#94a3b8]">
                {draft.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-[#fef3c7]/70">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onDiscard(draft.id)}
          className="flex items-center gap-1 px-3 py-1.5 text-[11px] rounded-lg text-[#94a3b8] hover:text-[#64748b] hover:bg-[#f8fafc] transition-colors"
        >
          <X size={12} />
          丢弃
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onConfirm(draft.id)}
          className="flex items-center gap-1 px-3 py-1.5 text-[11px] rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors shadow-sm shadow-[#4f46e5]/20"
        >
          <CheckCircle2 size={12} />
          确认入库
        </motion.button>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function CalendarDetailView() {
  const {
    state,
    addSource,
    removeSource,
    startParsing,
    completeParsing,
    confirmItem,
    deleteConfirmedEvent,
    discardItem,
    resetDraft,
    pendingDraftCount,
    sourcesCount,
  } = useCalendar();

  const [dragOver, setDragOver] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [sourceListExpanded, setSourceListExpanded] = useState(false);

  // Section 2: Manual entry form (moved above 素材池)
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [manualDate, setManualDate] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteRef = useRef<HTMLTextAreaElement>(null);
  const manualFormRef = useRef<HTMLDivElement>(null);

  // ── Helpers ─────────────────────────────────────────
  const triggerParse = useCallback(
    (sources: SourceMaterial[]) => {
      if (sources.length === 0) return;
      startParsing();
      // Simulate AI processing delay
      setTimeout(() => {
        const drafts = mockParsing(sources);
        completeParsing(drafts);
      }, 900);
    },
    [startParsing, completeParsing],
  );

  const handleFiles = useCallback(
    (files: FileList) => {
      const newSources: SourceMaterial[] = [];
      Array.from(files).forEach((file) => {
        const isImage = file.type.startsWith("image/");
        const source: SourceMaterial = {
          id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: isImage ? "image" : "file",
          name: file.name,
          content: `[${isImage ? "图片" : "文件"}] ${file.name}`,
          uploadedAt: new Date().toISOString(),
        };
        addSource(source);
        newSources.push(source);
      });
      triggerParse(newSources);
    },
    [addSource, triggerParse],
  );

  const handlePasteSubmit = useCallback(() => {
    const text = pastedText.trim();
    if (!text) return;
    const source: SourceMaterial = {
      id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "text",
      name: "粘贴文本",
      content: text,
      uploadedAt: new Date().toISOString(),
    };
    addSource(source);
    setPastedText("");
    setShowPasteArea(false);
    triggerParse([source]);
  }, [pastedText, addSource, triggerParse]);

  const handleManualSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualTitle.trim() || !manualDate.trim() || !manualLocation.trim()) return;

      // Directly create a draft item from manual entry (bypass OCR)
      const draft: DraftAgendaItem = {
        id: `draft-manual-${Date.now()}`,
        title: manualTitle,
        date: manualDate,
        time: manualTime || undefined,
        location: manualLocation,
        sourceId: "",
        confirmed: false,
      };
      completeParsing([draft]);

      // Reset form
      setManualTitle("");
      setManualTime("");
      setManualLocation("");
      setManualDate("");
      setShowManualForm(false);
    },
    [manualTitle, manualTime, manualLocation, manualDate, completeParsing],
  );

  const handleConfirm = useCallback(
    (draftId: string) => {
      confirmItem(draftId);
    },
    [confirmItem],
  );

  const handleDiscard = useCallback(
    (draftId: string) => {
      resetDraft();
    },
    [resetDraft],
  );

  const todayStr = new Date().toISOString().split("T")[0];

  // ── Derived data ────────────────────────────────────
  const pendingDrafts = state.draftAgenda.filter((d) => !d.confirmed);
  const confirmedDrafts = state.draftAgenda.filter((d) => d.confirmed);

  // Merge confirmedEvents + confirmed drafts for overview (with type tag)
  const allConfirmed: Array<{
    id: string;
    date: string;
    time?: string;
    title: string;
    location?: string;
    origin: "event" | "draft";
  }> = [
    ...state.confirmedEvents.map((e) => ({
      id: e.id,
      date: e.date,
      time: e.time,
      title: e.title,
      location: e.location,
      origin: "event" as const,
    })),
    ...confirmedDrafts.map((d) => ({
      id: d.id,
      date: d.date,
      time: d.time,
      title: d.title,
      location: d.location,
      origin: "draft" as const,
    })),
  ];

  // ── Event action handlers ─────────────────────────
  const handleDeleteEvent = useCallback(
    (id: string, origin: "event" | "draft") => {
      if (origin === "event") {
        deleteConfirmedEvent(id);
      } else {
        discardItem(id);
      }
    },
    [deleteConfirmedEvent, discardItem],
  );

  const handleEditEvent = useCallback(
    (_id: string, _origin: "event" | "draft") => {
      // Simple edit placeholder: toggle manual form for future implementation
      setShowManualForm(true);
      setManualDate(todayStr);
    },
    [todayStr],
  );

  // ── Render ──────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* ── Fixed Header ─────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#f6f7f9]/90 backdrop-blur-md border-b border-[#e8ecf1]">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#1e293b] hover:text-[#4f46e5] transition-colors">
            <ArrowLeft size={18} />
            <span className="text-[14px] font-semibold">日历 · 素材池</span>
          </Link>
          <div className="flex items-center gap-2">
            {state.isProcessing && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] text-[#4f46e5] flex items-center gap-1"
              >
                <Loader2 size={12} className="animate-spin" />
                分析中
              </motion.span>
            )}
            {pendingDraftCount > 0 && (
              <span className="text-[10px] bg-[#fef9c3] text-[#92400e] px-2 py-0.5 rounded-full font-medium">
                {pendingDraftCount} 待确认
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-24">
        {/* ═══════════════════════════════════════════
            Section 1: 手动添加 (Manual Entry — top priority)
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          ref={manualFormRef}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-4 rounded-full bg-[#22c55e]" />
            <h2 className="text-[14px] font-semibold text-[#1e293b] tracking-wide">
              手动添加
            </h2>
          </div>

          {!showManualForm ? (
            <button
              onClick={() => {
                setShowManualForm(true);
                setManualDate(todayStr);
              }}
              className="w-full flex items-center justify-center gap-2 bg-white rounded-[20px] border-2 border-dashed border-[#e2e8f0] p-4 text-[#64748b] hover:text-[#4f46e5] hover:border-[#c7d2fe] hover:bg-[#fafaff] transition-all shadow-sm"
            >
              <Plus size={18} />
              <span className="text-[13px] font-medium">新增日程</span>
            </button>
          ) : (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-[20px] border border-[#e8ecf1] p-4 shadow-sm overflow-hidden"
            >
              <form onSubmit={handleManualSubmit} className="space-y-3">
                {/* 事项名称 — single-line Title */}
                <div>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="日程标题"
                    required
                    className="w-full h-10 px-3 text-[13px] font-medium text-[#1e293b] placeholder-[#c0c8d4] bg-[#f8fafc] rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]/20 transition-all"
                  />
                </div>

                {/* 下方小字 Time/Location */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    placeholder="时间 (如 10:00 AM)"
                    className="w-full h-9 px-3 text-[12px] text-[#64748b] placeholder-[#c0c8d4] bg-[#f8fafc] rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f46e5] transition-all"
                  />
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="地点 (如 法学院302)"
                    className="w-full h-9 px-3 text-[12px] text-[#64748b] placeholder-[#c0c8d4] bg-[#f8fafc] rounded-xl border border-[#e2e8f0] outline-none focus:border-[#4f46e5] transition-all"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="px-3 py-1.5 text-[11px] text-[#94a3b8] hover:text-[#64748b] transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={!manualTitle.trim() || !manualTime.trim() || !manualLocation.trim()}
                    className="flex items-center gap-1 px-4 py-1.5 text-[11px] rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-[#4f46e5]/20"
                  >
                    <Plus size={12} />
                    添加待确认
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>

        {/* ═══════════════════════════════════════════
            Section 2: 总览日历 (Academic Summary)
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-4 rounded-full bg-[#4f46e5]" />
            <h2 className="text-[14px] font-semibold text-[#1e293b] tracking-wide">
              总览日历
            </h2>
            <span className="text-[11px] text-[#94a3b8]">
              · 教务日历
            </span>
          </div>

          <WeekHeader events={allConfirmed} />

          {/* All confirmed events list */}
          {allConfirmed.length > 0 && (
            <div className="mt-3 space-y-2">
              {allConfirmed.slice(0, 5).map((ev, idx) => (
                <ConfirmedEventCard
                  key={ev.id}
                  event={ev}
                  index={idx}
                  onEdit={(id) => handleEditEvent(id, ev.origin)}
                  onDelete={(id) => handleDeleteEvent(id, ev.origin)}
                />
              ))}
              {allConfirmed.length > 5 && (
                <p className="text-[11px] text-[#94a3b8] text-center py-1">
                  还有 {allConfirmed.length - 5} 项已确认日程
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* ═══════════════════════════════════════════
            Section 3: 素材池 (Source Ingestion)
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1 h-4 rounded-full bg-[#22c55e]" />
            <h2 className="text-[14px] font-semibold text-[#1e293b] tracking-wide">
              素材池
            </h2>
            {sourcesCount > 0 && (
              <span className="text-[10px] bg-[#f0fdf4] text-[#16a34a] px-2 py-0.5 rounded-full font-medium">
                {sourcesCount} 份素材
              </span>
            )}
          </div>

          {/* Upload Zone */}
          <motion.div
            whileTap={{ scale: 0.99 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-[20px] border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? "border-[#4f46e5] bg-[#eef2ff] scale-[1.01]"
                : "border-[#e2e8f0] bg-white hover:border-[#c7d2fe] hover:bg-[#fafaff]"
            } shadow-sm`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                }
                e.target.value = "";
              }}
            />
            <Upload
              size={28}
              className={`mx-auto mb-2 transition-colors ${
                dragOver ? "text-[#4f46e5]" : "text-[#94a3b8]"
              }`}
            />
            <p className="text-[13px] font-medium text-[#1e293b] mb-1">
              拖拽文件到此处
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              支持 JPG、PNG、PDF · 或点击选择
            </p>
          </motion.div>

          {/* Paste text toggle */}
          <div className="mt-3">
            <button
              onClick={() => {
                setShowPasteArea(!showPasteArea);
                if (!showPasteArea) {
                  setTimeout(() => pasteRef.current?.focus(), 100);
                }
              }}
              className="flex items-center gap-1.5 text-[12px] text-[#64748b] hover:text-[#4f46e5] transition-colors"
            >
              <ClipboardPaste size={14} />
              {showPasteArea ? "收起粘贴区" : "粘贴文字"}
            </button>
          </div>

          <AnimatePresence>
            {showPasteArea && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-2 bg-white rounded-xl border border-[#e8ecf1] p-3 shadow-sm">
                  <textarea
                    ref={pasteRef}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="在此粘贴通知、课程表或日程相关的文字..."
                    className="w-full h-24 text-[13px] text-[#1e293b] placeholder-[#94a3b8] bg-transparent resize-none outline-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setPastedText("");
                        setShowPasteArea(false);
                      }}
                      className="px-3 py-1.5 text-[11px] text-[#94a3b8] hover:text-[#64748b] transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handlePasteSubmit}
                      disabled={!pastedText.trim()}
                      className="flex items-center gap-1 px-4 py-1.5 text-[11px] rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <Sparkles size={12} />
                      智能识别
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── 原始凭证 (Collapsible Source List) ── */}
          {state.sources.length > 0 && (
            <div className="mt-2.5">
              <button
                onClick={() => setSourceListExpanded(!sourceListExpanded)}
                className="flex items-center gap-1.5 text-[11px] text-[#64748b] hover:text-[#4f46e5] bg-white rounded-lg px-3 py-1.5 border border-[#e8ecf1] shadow-sm transition-colors"
              >
                <FileText size={13} />
                <span>原始凭证</span>
                <span className="text-[10px] bg-[#f1f5f9] text-[#64748b] px-1.5 py-0.5 rounded-full font-medium">
                  {state.sources.length}份
                </span>
                <span className="text-[10px] ml-0.5">{sourceListExpanded ? "▲" : "▼"}</span>
              </button>

              <AnimatePresence>
                {sourceListExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 space-y-1.5">
                      {state.sources.map((src) => (
                        <motion.div
                          key={src.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12 }}
                          className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-[#e8ecf1] shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {src.type === "image" ? (
                              <Image size={15} className="text-[#94a3b8] flex-shrink-0" />
                            ) : (
                              <FileText size={15} className="text-[#94a3b8] flex-shrink-0" />
                            )}
                            <span className="text-[12px] text-[#1e293b] truncate">
                              {src.type === "image" ? "图片素材" : src.type === "file" ? "文件素材" : "文本素材"}
                            </span>
                          </div>
                          <button
                            onClick={() => removeSource(src.id)}
                            className="flex-shrink-0 ml-2 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Processing indicator */}
          <AnimatePresence>
            {state.isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 flex items-center gap-2.5 bg-white rounded-xl p-3 border border-[#e8ecf1] shadow-sm"
              >
                <Loader2 size={16} className="animate-spin text-[#4f46e5]" />
                <span className="text-[12px] text-[#64748b]">
                  正在分析素材中的日程信息…
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ═══════════════════════════════════════════
            Section 4: 预审区 (Draft Review — "待确认")
            ═══════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {pendingDrafts.length > 0 && (
            <motion.div
              key="review-section"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-1 h-4 rounded-full bg-[#f59e0b]" />
                <h2 className="text-[14px] font-semibold text-[#1e293b] tracking-wide">
                  预审区
                </h2>
                <span className="text-[10px] bg-[#fef9c3] text-[#92400e] px-2 py-0.5 rounded-full font-medium">
                  {pendingDrafts.length} 待确认
                </span>
              </div>

              <div className="space-y-2.5">
                <AnimatePresence>
                  {pendingDrafts.map((draft, idx) => (
                    <DraftCard
                      key={draft.id}
                      draft={draft}
                      onConfirm={handleConfirm}
                      onDiscard={handleDiscard}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty State ────────────────────────── */}
        {state.sources.length === 0 && pendingDrafts.length === 0 && state.confirmedEvents.length === 0 && !state.isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center py-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-4">
              <CalendarIcon size={28} className="text-[#94a3b8]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#1e293b] mb-1">
              还没有任何日程
            </h3>
            <p className="text-[12px] text-[#94a3b8] max-w-[240px]">
              上传通知截图、粘贴课程文字，或手动添加一条日程开始使用
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}