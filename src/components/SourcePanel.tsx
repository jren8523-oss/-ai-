"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCalendar, type SourceMaterial } from "@/src/store/calendarStore";

interface SourceColor {
  bg: string;
  border: string;
  accent: string;
  text: string;
  dot: string;
}

interface SourcePanelProps {
  sourceColorMap?: Map<string, SourceColor>;
  selectedSourceId?: string | null;
  onSelectSource?: (id: string | null) => void;
}

const TYPE_ICONS: Record<SourceMaterial["type"], string> = {
  image: "🖼️",
  file: "📄",
  text: "📝",
};

export default function SourcePanel({
  sourceColorMap,
  selectedSourceId,
  onSelectSource,
}: SourcePanelProps = {}) {
  const { state, addSource, removeSource } = useCalendar();
  const [pasteText, setPasteText] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Manual Entry State ───────────────────────────
  const [manualTitle, setManualTitle] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [manualLocation, setManualLocation] = useState("");

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const type: SourceMaterial["type"] = file.type.startsWith("image/")
          ? "image"
          : "file";
        const content =
          type === "image"
            ? `[图片] ${file.name}`
            : typeof reader.result === "string"
              ? reader.result
              : "";
        addSource({
          id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type,
          name: file.name,
          content,
          uploadedAt: new Date().toISOString(),
        });
      };
      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    },
    [addSource],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach(processFile);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach(processFile);
      e.target.value = "";
    },
    [processFile],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            processFile(blob);
            return;
          }
        }
      }
      const text = e.clipboardData.getData("text/plain");
      if (text && text.trim()) {
        setPasteText(text);
        setPasteMode(true);
      }
    },
    [processFile],
  );

  const confirmPasteText = useCallback(() => {
    if (!pasteText.trim()) return;
    addSource({
      id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "text",
      name: "手动输入",
      content: pasteText.trim(),
      uploadedAt: new Date().toISOString(),
    });
    setPasteText("");
    setPasteMode(false);
  }, [pasteText, addSource]);

  const cancelPaste = useCallback(() => {
    setPasteText("");
    setPasteMode(false);
  }, []);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (pasteMode && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [pasteMode]);

  const handleManualAdd = useCallback(() => {
    if (!manualTitle.trim()) return;
    addSource({
      id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "text",
      name: `${manualTitle.trim()} ${manualTime || ""} ${manualLocation || ""}`.trim(),
      content: `${manualTitle.trim()} ${manualTime ? `时间:${manualTime}` : ""} ${manualLocation ? `地点:${manualLocation}` : ""}`.trim(),
      uploadedAt: new Date().toISOString(),
    });
    setManualTitle("");
    setManualTime("");
    setManualLocation("");
  }, [manualTitle, manualTime, manualLocation, addSource]);

  return (
    <div className="space-y-3">
      {/* ── Manual Entry ──────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-4 space-y-2.5">
        <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wide">
          手动输入
        </p>
        <input
          value={manualTitle}
          onChange={(e) => setManualTitle(e.target.value)}
          placeholder="日程标题"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:border-indigo-300 transition-all"
        />
        <div className="flex gap-2">
          <input
            value={manualTime}
            onChange={(e) => setManualTime(e.target.value)}
            placeholder="时间 (如 10:00)"
            className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 placeholder:text-zinc-300 focus:outline-none focus:border-indigo-300 transition-all"
          />
          <input
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            placeholder="地点"
            className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 placeholder:text-zinc-300 focus:outline-none focus:border-indigo-300 transition-all"
          />
        </div>
        <button
          onClick={handleManualAdd}
          disabled={!manualTitle.trim()}
          className="w-full py-2 text-xs font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          添加日程
        </button>
      </div>

      {/* ── Upload Zone ─────────────────────────────── */}
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
          dragOver
            ? "border-zinc-400 bg-zinc-100/60 scale-[1.01]"
            : "border-zinc-200 bg-zinc-50/60 hover:border-zinc-300 hover:bg-zinc-100/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <div className="flex flex-col items-center gap-2.5 px-3 py-4">
          <div className="flex items-center gap-3 text-xl">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition-all duration-200"
              title="上传图片"
            >
              🖼️
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition-all duration-200"
              title="导入文件"
            >
              📄
            </button>
            <button
              onClick={() => {
                setPasteText("");
                setPasteMode(true);
              }}
              className="p-2.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition-all duration-200"
              title="粘贴文本"
            >
              📝
            </button>
          </div>

          <p className="text-[10px] text-zinc-400 text-center leading-relaxed max-w-xs">
            拖拽到此处，或
            <kbd className="mx-1 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 text-[10px] font-mono">
              Ctrl+V
            </kbd>
            粘贴
          </p>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.txt,.md,.json,.csv"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* ── Paste Modal ─────────────────────────────── */}
      <AnimatePresence>
        {pasteMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm p-4 space-y-3">
              <p className="text-xs text-zinc-500 font-medium">
                📋 粘贴文本内容
              </p>
              <textarea
                ref={textAreaRef}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="在此粘贴文本…"
                rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 placeholder:text-zinc-300 resize-none focus:outline-none focus:border-zinc-400 transition-all"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={cancelPaste}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmPasteText}
                  disabled={!pasteText.trim()}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 text-white hover:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  添加素材
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Source Cards (素材池) ─────────────────────── */}
      <AnimatePresence>
        {state.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wide">
                素材库 · {state.sources.length} 份
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[130px] overflow-y-auto custom-scrollbar pr-1">
              {state.sources.map((source, idx) => {
                const color = sourceColorMap?.get(source.id) || {
                  bg: "bg-zinc-50",
                  border: "border-zinc-200",
                  accent: "bg-zinc-500",
                  text: "text-zinc-700",
                  dot: "bg-zinc-400",
                };
                const isSelected = selectedSourceId === source.id;
                return (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() =>
                      onSelectSource?.(isSelected ? null : source.id)
                    }
                    className={`relative cursor-pointer rounded-xl p-2.5 border transition-all duration-200 ${
                      color.bg
                    } ${color.border} ${
                      isSelected
                        ? "ring-2 ring-zinc-400 shadow-md scale-[1.02]"
                        : "hover:shadow-sm hover:scale-[1.01]"
                    }`}
                  >
                    {/* Color dot */}
                    <div
                      className={`absolute top-2 right-2 w-2 h-2 rounded-full ${color.dot}`}
                    />

                    {/* Type icon + short label */}
                    <div className="flex items-center gap-1.5 text-sm">
                      <span>{TYPE_ICONS[source.type]}</span>
                      <span className="text-[10px] text-zinc-400">
                        {source.type === "image" ? "图片" : source.type === "file" ? "文件" : "文本"}
                      </span>
                    </div>

                    {/* Time */}
                    <p className="text-[10px] text-zinc-400 mt-1">
                      {new Date(source.uploadedAt).toLocaleTimeString(
                        "zh-CN",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </p>

                    {/* Remove */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSource(source.id);
                      }}
                      className="absolute bottom-1.5 right-1.5 p-1 rounded-md text-zinc-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 hover:!opacity-100 transition-all duration-200"
                      title="移除"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}