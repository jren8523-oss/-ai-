"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Hash,
  Users,
  Compass,
  ChevronUp,
  ChevronRight,
  Bot,
  Star,
  Calendar,
  Megaphone,
  Clock,
  ArrowLeft,
} from "lucide-react";
import {
  mockTasks,
  mockPosts,
  calendarEvents,
  dailyBriefings,
} from "@/src/lib/mockData";
import {
  useAiAssistant,
  getAvatarByLevel,
  getAccessoryByLevel,
} from "@/src/store/aiAssistantStore";
import { generateDailySummary } from "@/src/lib/semanticRewriter";
import type { RewriteResult } from "@/src/lib/semanticRewriter";
import { useFavorites } from "@/src/store/favoritesStore";
import { useCalendar, normalizeDate } from "@/src/store/calendarStore";
import { useToast } from "@/src/components/Toast";
import BookmarkOverlay from "@/src/components/BookmarkOverlay";
import type { CalendarEvent } from "@/src/store/calendarStore";

// ─────────────────────────────────────────────────────
// Helpers (stable on mount, not per-render)
// ─────────────────────────────────────────────────────
const getNextEventCountdown = (): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = calendarEvents
    .map((e) => ({ ...e, d: new Date(e.date) }))
    .filter((e) => e.d.getTime() >= today.getTime())
    .sort((a, b) => a.d.getTime() - b.d.getTime());
  if (upcoming.length === 0) return "暂无日程";
  const next = upcoming[0];
  const diff = Math.ceil(
    (next.d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff === 0
    ? `今天 · ${next.title}`
    : `距"${next.title}" ${diff} 天`;
};

// ─────────────────────────────────────────────────────
// Subcomponent: Micro Avatar (32px with accessory)
// ─────────────────────────────────────────────────────
function MicroAvatar({ growthLevel }: { growthLevel: number }) {
  const emoji = getAvatarByLevel(growthLevel).emoji;
  const accessory = getAccessoryByLevel(growthLevel);

  return (
    <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-sm flex items-center justify-center shrink-0 text-lg relative">
      <span>{emoji}</span>
      {accessory && (
        <span className="absolute -top-1 -right-1 text-[10px] leading-none drop-shadow-sm">
          {accessory}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Subcomponent: Calendar Event Row
// ─────────────────────────────────────────────────────
function CalendarEventRow({ event }: { event: CalendarEvent; index: number }) {
  const timeDisplay = event.time || "全天";

  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-orange-500 font-semibold whitespace-nowrap tabular-nums min-w-[10px]">
        •
      </span>
      <span className="text-orange-500 font-semibold whitespace-nowrap tabular-nums min-w-[40px]">
        {timeDisplay}
      </span>
      <span className="text-orange-800/90 truncate font-medium">
        {event.title}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────
export function HomeView() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const router = useRouter();

  // ── AI Assistant state ──
  const {
    personalityId,
    userPreferences,
    growthLevel,
  } = useAiAssistant();

  // ── Window scroll listener ──
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollTop(y);
      setIsCollapsed(y >= 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsCollapsed(false);
  }, []);

  // Hydration-safe mounted guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ── Calendar store ──
  const { pendingDraftCount, sourcesCount, mostUrgentTwo } = useCalendar();

  // ── Computed values ──
  const classTasks = useMemo(
    () => mockTasks.filter((t) => t.sourceOrg === "我的班级"),
    [],
  );

  const pendingClassCount = useMemo(
    () => classTasks.filter((t) => t.status === "pending").length,
    [classTasks],
  );

  // Generate daily summary via semantic rewriter
  const dailySummary = useMemo((): RewriteResult => {
    if (!mounted) return { rewritten: "", original: "", triggeredCircuitBreaker: false, criticalInfo: "" };
    return generateDailySummary(classTasks, personalityId, userPreferences);
  }, [mounted, classTasks, personalityId, userPreferences]);

  const nextCountdown = useMemo(() => {
    if (!mounted) return "";
    if (mostUrgentTwo.length > 0) {
      const first = mostUrgentTwo[0];
      const d = normalizeDate(first.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const dateStr = diff === 0 ? "今天" : diff === 1 ? "明天" : `${diff}天后`;
      return `${dateStr} · ${first.title}`;
    }
    return getNextEventCountdown();
  }, [mounted, mostUrgentTwo]);

  const todayStr = useMemo(
    () =>
      mounted
        ? new Date().toLocaleDateString("zh-CN", {
            month: "2-digit",
            day: "2-digit",
          })
        : "",
    [mounted],
  );

  const { favoritesCount, isFavorited, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

  const handleToggleFavorite = useCallback(
    (postId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const nowFavorited = toggleFavorite(postId);
      showToast(nowFavorited ? "已存入收藏夹" : "已取消收藏");
    },
    [toggleFavorite, showToast],
  );

  // CSS keyframes for avatar float animation
  useEffect(() => {
    if (typeof document === "undefined") return;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes avatarFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }
      @keyframes slide-up {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-slide-up {
        animation: slide-up 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* ═══════════════════════════════════════════════════════════════
          Sticky Header
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className={`sticky top-0 z-40 bg-white pt-4 shrink-0 flex flex-col ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        {/* ── Tab Bar ── */}
        <div className="border-b border-zinc-100/80 z-10 bg-white">
          <div className="flex items-center justify-center space-x-12 px-3 h-[44px]">
            <span className="text-[15px] text-zinc-400 font-medium">关注</span>
            <span className="text-[15px] text-zinc-400 font-medium">推荐</span>
            <span className="text-[17px] font-bold text-zinc-800 relative">
              我的学校
              <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
            </span>
          </div>
        </div>

        {/* ── 2×2 Service Grid ── */}
        <div
          className="transition-all duration-300 ease-in-out border-b border-slate-100 overflow-hidden"
          style={{
            maxHeight: isCollapsed ? "0px" : "500px",
            margin: isCollapsed ? 0 : undefined,
            opacity: isCollapsed ? 0 : 1,
            pointerEvents: isCollapsed ? "none" : "auto",
          }}
          aria-hidden={isCollapsed}
        >
          <div className="grid grid-cols-2 gap-3 px-3 py-3">
            {/* ═══════════════════════════════════════════════════════
                [我的班级] → 养成系看板 (1/4 cell)
                ═══════════════════════════════════════════════════════ */}
            <div
              className="rounded-2xl border border-white/40 p-3.5 flex flex-col gap-2 shadow-sm relative overflow-hidden cursor-pointer select-none active:scale-[0.98] transition-transform"
              style={{
                background: `linear-gradient(135deg, var(--card-from, #eff6ff), var(--card-to, #e0e7ff))`,
              }}
              onClick={() => {
                window.location.href = "/student";
              }}
            >
              {/* Glass morphism overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] rounded-2xl pointer-events-none" />

              {/* Micro avatar (32px) top-left + Title */}
              <div className="flex items-center gap-2 relative z-10">
                <MicroAvatar growthLevel={growthLevel} />
                <span className="text-[14px] font-bold text-zinc-700">
                  我的班级
                </span>
              </div>

              {/* Single-line summary */}
              <p className="text-sm text-zinc-700 leading-tight line-clamp-1 relative z-10 flex-1 min-w-0">
                {mounted ? dailySummary.rewritten : "加载中..."}
              </p>

              {/* Bottom bar: Task count only */}
              <div className="flex items-center justify-between relative z-10 pt-1 border-t border-white/30">
                <span className="text-[11px] font-medium text-zinc-500">
                  {mounted
                    ? pendingClassCount > 0
                      ? `${pendingClassCount} 项待办`
                      : "暂无待办"
                    : "..."}
                </span>
              </div>
            </div>

            {/* 校历 — connected to calendarStore, shows TWO events */}
            <Link
              href="/calendar"
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100/60 p-3.5 flex flex-col gap-1.5 shadow-sm cursor-pointer select-none active:scale-[0.98] transition-transform block no-underline"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-bold text-orange-900">日历</span>
              </div>

              {/* Two-event list: <time> <title> format */}
              {mounted && mostUrgentTwo.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {mostUrgentTwo.slice(0, 2).map((evt, idx) => (
                    <CalendarEventRow key={evt.id} event={evt} index={idx} />
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-orange-600/70 leading-tight">
                  {mounted ? "暂无已确认日程" : "加载中..."}
                </p>
              )}

            </Link>

            {/* 情报与悬赏 */}
            <Link
              href="/request-center"
              className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/60 p-3.5 flex flex-col gap-1 shadow-sm cursor-pointer select-none active:scale-[0.98] transition-transform block no-underline"
            >
              <div className="flex items-center gap-1.5">
                <Megaphone size={16} className="text-emerald-500" strokeWidth={2} />
                <span className="text-[14px] font-bold text-emerald-900">情报与悬赏</span>
              </div>
              <span className="text-[12px] text-emerald-600/70">
                悬赏互助 · 评价避雷
              </span>
            </Link>

            {/* 收藏夹 */}
            <div
              onClick={() => setShowBookmarks(true)}
              className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100/60 p-3.5 flex flex-col gap-1 shadow-sm cursor-pointer select-none active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-1.5">
                <Star size={16} className="text-pink-500" fill="currentColor" />
                <span className="text-[14px] font-bold text-pink-900">收藏夹</span>
              </div>
              <span className="text-[12px] text-pink-600/70">
                {favoritesCount > 0 ? `${favoritesCount} 条内容` : "暂无收藏"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BookmarkView Overlay Panel
          ═══════════════════════════════════════════════════════════════ */}
      {showBookmarks && (
        <BookmarkOverlay onClose={() => setShowBookmarks(false)} />
      )}

      {/* ═══════════════════════════════════════════════════════════════
          Feed Stream
          ═══════════════════════════════════════════════════════════════ */}
      <div className="px-3 pt-3 pb-[100px] space-y-3 bg-[#f6f7f9] flex-1">
        {/* AI 智库周报 */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-[18px] p-4 shadow-sm border border-purple-100/50">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Bot size={15} className="text-purple-500" />
            <span className="text-[14px] font-bold text-purple-900">
              AI 智库周报
            </span>
          </div>
          <div className="space-y-1.5">
            {dailyBriefings.map((briefing, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-[12.5px] leading-relaxed"
              >
                <span
                  className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    briefing.tag === "避雷"
                      ? "bg-red-100 text-red-600"
                      : briefing.tag === "预警"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  [{briefing.tag}]
                </span>
                <span className="text-zinc-700">{briefing.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 校园热搜 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[18px] p-4 shadow-sm border border-blue-100/50 overflow-hidden">
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[14px] font-bold text-blue-900">
              校园热搜
            </span>
          </div>
          <div className="h-[28px] overflow-hidden relative">
            <div className="flex flex-col gap-2 text-[12.5px] text-blue-600 font-medium animate-scroll">
              <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                #民法典讲座 提前排队
              </div>
              <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                #二食堂炸鸡 恢复营业啦！
              </div>
              <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                #英语四级报名 还有最后2天
              </div>
              <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                #民法典讲座 提前排队
              </div>
              <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                #二食堂炸鸡 恢复营业啦！
              </div>
              <div className="bg-white/80 px-3 py-1.5 rounded-lg truncate shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                #英语四级报名 还有最后2天
              </div>
            </div>
          </div>
        </div>

        {/* Feed Items */}
        {mockPosts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="bg-white rounded-[20px] p-4 flex flex-col gap-2 shadow-sm active:scale-[0.98] transition-transform cursor-pointer select-none block"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[12px] text-zinc-500 font-medium">
                {post.author.name}
              </span>
            </div>
            <div className="text-[14px] font-medium text-zinc-800 line-clamp-2 leading-relaxed">
              {post.content}
            </div>
            {post.image && (
              <div className="w-full rounded-xl overflow-hidden mt-1 aspect-video">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex items-center justify-between text-zinc-400 mt-2">
              <span className="text-[11px]">{post.createdAt}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleToggleFavorite(post.id, e)}
                  className="flex items-center active:scale-95 transition-transform"
                  aria-label={isFavorited(post.id) ? "取消收藏" : "收藏"}
                >
                  <Star
                    size={16}
                    className={
                      isFavorited(post.id)
                        ? "fill-[#FFD700] text-[#FFD700] transition-colors"
                        : "text-zinc-400 transition-colors"
                    }
                  />
                </button>
                <div className="flex items-center gap-2.5">
                  <MessageCircle size={16} />
                  <span className="text-[11px]">{post.comments.length}</span>
                </div>
              </div>
            </div>
            <div
              className="mt-2 text-blue-500 bg-blue-50/80 px-3 py-2 rounded-xl text-[12px] flex items-center gap-1.5 active:bg-blue-100/80 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert(
                  `摘要：${post.content.slice(0, 30)}...，已有${post.comments.length}人参与讨论。`,
                );
              }}
            >
              <Bot size={14} />
              <span className="font-bold">摘要</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Back to Top Button
          ═══════════════════════════════════════════════════════════════ */}
      <button
        className={`fixed bottom-[calc(80px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur rounded-full p-2.5 text-zinc-500 z-50 shadow-md border border-zinc-200 transition-all duration-200 ${
          isCollapsed && scrollTop > 200
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-5 pointer-events-none"
        }`}
        onClick={scrollToTop}
        aria-label="回到顶部"
      >
        <ChevronUp size={20} />
      </button>

      {/* ═══════════════════════════════════════════════════════════════
          Bottom Global Navigation (Tab Bar)
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-[100] bg-white/90 backdrop-blur-lg border-t border-zinc-200 flex justify-around items-start pt-[10px] pb-[env(safe-area-inset-bottom,0px)] px-2 select-none"
        style={{ minHeight: "calc(72px + env(safe-area-inset-bottom, 0px))" }}
      >
        <button className="flex flex-col items-center gap-1 w-[70px] text-zinc-400">
          <MessageCircle size={24} strokeWidth={2} />
          <span className="text-[11px] font-bold">消息</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-[70px] text-blue-500">
          <div className="relative">
            <Hash size={24} strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 w-[9px] h-[9px] bg-[#f54f46] rounded-full border-[1.5px] border-white" />
          </div>
          <span className="text-[11px] font-bold">频道</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-[70px] text-zinc-400">
          <Users size={24} strokeWidth={2} />
          <span className="text-[11px] font-bold">联系人</span>
        </button>
        <button className="flex flex-col items-center gap-1 w-[70px] text-zinc-400">
          <Compass size={24} strokeWidth={2} />
          <span className="text-[11px] font-bold">动态</span>
        </button>
      </div>
    </div>
  );
}