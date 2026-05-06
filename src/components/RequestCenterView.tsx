"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ArrowLeft, Megaphone, Plus, X, Send, Search, Star, ShieldAlert, Coffee } from "lucide-react";
import Link from "next/link";
import {
  mockBounties,
  mockReviews,
  mockPosts,
  TEACHER_INDEX,
  type MockBounty,
  type MockReview,
  type HubItem,
  type BountyCategory,
} from "@/src/lib/mockData";

// ══════════════════════════════════════════════════════════
// Design Tokens
// ══════════════════════════════════════════════════════════
const COLORS = {
  bg: "#F6F7F9",
  card: "#ffffff",
  text: "#1e293b",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  accent: "#10b981",
  accentLight: "#ecfdf5",
  accentBorder: "#a7f3d0",
  danger: "#ef4444",
  dangerLight: "#fef2f2",
  warning: "#f59e0b",
  warningLight: "#fffbeb",
  border: "#e8ecf1",
};

// ══════════════════════════════════════════════════════════
// Reward Badge
// ══════════════════════════════════════════════════════════
const REWARD_COLORS: Record<string, string> = {
  points: "#8b5cf6",
  treat: "#f59e0b",
  cash: "#10b981",
};

function RewardBadge({ reward, rewardType }: { reward: string; rewardType: string }) {
  const color = REWARD_COLORS[rewardType] || "#64748b";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{
        color,
        backgroundColor: `${color}14`,
        border: `1px solid ${color}33`,
      }}
    >
      {rewardType === "treat" && <Coffee size={11} />}
      {rewardType === "cash" && <span style={{ fontSize: "11px" }}>¥</span>}
      {rewardType === "points" && <Star size={11} />}
      {reward}
    </span>
  );
}

// ══════════════════════════════════════════════════════════
// Publish Modal — 发布悬赏
// ══════════════════════════════════════════════════════════
function PublishModal({
  open,
  onClose,
  onPublish,
}: {
  open: boolean;
  onClose: () => void;
  onPublish: (title: string, description: string, category: BountyCategory, reward: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BountyCategory>("errand");
  const [reward, setReward] = useState("+5 积分");

  const rewardPresets = ["+5 积分", "+10 积分", "一杯奶茶", "一瓶饮料", "10 元", "25 元"];

  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    onPublish(title.trim(), description.trim(), category, reward);
    setTitle("");
    setDescription("");
    setCategory("errand");
    setReward("+5 积分");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[390px] rounded-t-[24px] p-5 pt-6 pb-[calc(24px+env(safe-area-inset-bottom,0px))] shadow-xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[17px] font-bold text-[#1e293b]">发布悬赏</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center active:scale-90 transition-transform"
          >
            <X size={16} className="text-[#64748b]" />
          </button>
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="简短标题（如：求带二食堂炸鸡）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={40}
          className="w-full bg-[#f8fafc] rounded-xl px-4 py-3 text-[15px] text-[#1e293b] placeholder:text-[#94a3b8] border border-[#e8ecf1] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 mb-3"
        />

        {/* Description */}
        <textarea
          placeholder="详细描述（如：脚崴了求带饭到宿舍）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          rows={3}
          className="w-full bg-[#f8fafc] rounded-xl px-4 py-3 text-[14px] text-[#1e293b] placeholder:text-[#94a3b8] border border-[#e8ecf1] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 mb-3 resize-none"
        />

        {/* Category picker */}
        <div className="flex gap-2 mb-3">
          {([
            { key: "errand" as BountyCategory, label: "跑腿" },
            { key: "book" as BountyCategory, label: "二手书" },
            { key: "material" as BountyCategory, label: "资料求助" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={`px-3.5 py-2 rounded-full text-[12px] font-medium transition-all active:scale-95 ${
                category === tab.key ? "bg-[#10b981] text-white" : "bg-[#f1f5f9] text-[#64748b]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reward picker */}
        <div className="mb-5">
          <p className="text-[11px] text-[#94a3b8] mb-2 font-medium">报酬/积分</p>
          <div className="flex flex-wrap gap-1.5">
            {rewardPresets.map((r) => (
              <button
                key={r}
                onClick={() => setReward(r)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all active:scale-95 ${
                  reward === r
                    ? "bg-[#8b5cf6] text-white shadow-sm"
                    : "bg-[#f1f5f9] text-[#64748b]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !description.trim()}
          className={`w-full py-3.5 rounded-xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            title.trim() && description.trim()
              ? "bg-[#10b981] text-white shadow-md shadow-[#10b981]/20"
              : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
          }`}
        >
          <Send size={16} />
          发布悬赏
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Bounty Card
// ══════════════════════════════════════════════════════════
function BountyCard({ bounty }: { bounty: MockBounty }) {
  const statusLabel: Record<string, string> = {
    waiting: "等待接单",
    "in-progress": "进行中",
    resolved: "已解决",
  };

  return (
    <div className="bg-white rounded-[18px] p-4 shadow-sm border border-[#e8ecf1] flex flex-col gap-2.5 active:scale-[0.99] transition-transform">
      {/* Top: Category + Reward + Time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: bounty.status === "resolved" ? "#f1f5f9" : "#ecfdf5",
              color: bounty.status === "resolved" ? "#94a3b8" : "#10b981",
            }}
          >
            {statusLabel[bounty.status]}
          </span>
          <span className="text-[11px] text-[#94a3b8]">
            {bounty.author} · {bounty.createdAt}
          </span>
        </div>
        <RewardBadge reward={bounty.reward} rewardType={bounty.rewardType} />
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-[#1e293b] leading-snug">{bounty.title}</h3>

      {/* Description */}
      <p className="text-[13px] text-[#64748b] leading-relaxed">{bounty.description}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Review Card
// ══════════════════════════════════════════════════════════
function ReviewCard({ review }: { review: MockReview }) {
  return (
    <div className="bg-white rounded-[18px] p-4 shadow-sm border border-[#e8ecf1] flex flex-col gap-2.5 active:scale-[0.99] transition-transform">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {review.category === "teacher" ? (
            <ShieldAlert size={14} className="text-[#f59e0b]" />
          ) : (
            <Coffee size={14} className="text-[#10b981]" />
          )}
          <span className="text-[13px] font-semibold text-[#1e293b]">{review.targetName}</span>
          {review.rating && (
            <span
              className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: review.rating >= 4 ? "#ecfdf5" : "#fffbeb",
                color: review.rating >= 4 ? "#10b981" : "#f59e0b",
              }}
            >
              {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#94a3b8]">{review.createdAt}</span>
      </div>

      {/* Title */}
      <h3 className="text-[14px] font-semibold text-[#1e293b] leading-snug">{review.title}</h3>

      {/* Description */}
      <p className="text-[13px] text-[#64748b] leading-relaxed">{review.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {review.tags.map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "#eff6ff",
              color: "#3b82f6",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// AI 自动分拣 — 从动态流中自动提取任务
// ══════════════════════════════════════════════════════════
const SORT_KEYWORDS = ["求", "帮我", "出二手", "谁能", "求助", "有偿", "代取", "带饭"];

function autoSortBountiesFromPosts(): MockBounty[] {
  const sorted: MockBounty[] = [];
  for (const post of mockPosts) {
    const text = post.title + " " + post.content;
    const matched = SORT_KEYWORDS.some((kw) => text.includes(kw));
    if (matched) {
      // determine category
      let category: BountyCategory = "errand";
      let rewardType: "points" | "treat" | "cash" = "points";
      let reward = "+5 积分";

      if (text.includes("二手") || text.includes("出二手") || text.includes("卖")) {
        category = "book";
        rewardType = "cash";
        reward = "议价";
      } else if (text.includes("笔记") || text.includes("资料") || text.includes("真题") || text.includes("重点")) {
        category = "material";
        rewardType = "points";
        reward = "+10 积分";
      } else if (text.includes("带饭") || text.includes("快递") || text.includes("取") || text.includes("帮带")) {
        category = "errand";
        rewardType = "treat";
        reward = "一瓶饮料";
      }

      sorted.push({
        id: `ai-${post.id}`,
        type: "bounty",
        title: post.title.length > 30 ? post.title.slice(0, 30) + "…" : post.title,
        description: post.content.length > 80 ? post.content.slice(0, 80) + "…" : post.content,
        category,
        reward,
        rewardType,
        status: "waiting",
        author: post.author.name,
        createdAt: post.createdAt,
      });
    }
  }
  return sorted;
}

// ══════════════════════════════════════════════════════════
// Teacher Search Panel
// ══════════════════════════════════════════════════════════
function TeacherSearch({
  reviews,
}: {
  reviews: MockReview[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MockReview[] | null>(null);

  const handleSearch = () => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }
    // Search by targetName
    const found = reviews.filter(
      (r) => r.category === "teacher" && r.targetName.includes(q)
    );
    setResults(found);
  };

  const displayReviews = results !== null ? results : reviews.filter((r) => r.category === "teacher");

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white rounded-[14px] px-4 py-3 border border-[#e8ecf1]">
        <Search size={16} className="text-[#94a3b8] shrink-0" />
        <input
          type="text"
          placeholder="输入老师姓氏搜索，如：张"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 text-[14px] text-[#1e293b] placeholder:text-[#94a3b8] bg-transparent outline-none"
        />
        <button
          onClick={handleSearch}
          className="shrink-0 px-4 py-1.5 rounded-full bg-[#10b981] text-white text-[12px] font-bold active:scale-95 transition-transform"
        >
          搜老师
        </button>
      </div>

      {/* Results */}
      {results !== null && results.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-2">
          <ShieldAlert size={36} className="text-[#cbd5e1]" />
          <p className="text-[13px] text-[#94a3b8]">暂无该老师的评价，快抢沙发</p>
        </div>
      )}

      {displayReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════
export function RequestCenterView() {
  const [activeTab, setActiveTab] = useState<"bounty" | "review">("bounty");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [bounties, setBounties] = useState<MockBounty[]>(() => {
    const aiSorted = autoSortBountiesFromPosts();
    const userBounties = mockBounties.filter((b) => !aiSorted.some((a) => a.title === b.title));
    return [...aiSorted, ...userBounties];
  });
  const [reviews] = useState<MockReview[]>(mockReviews);

  // Handle publish — creates new bounty card
  const handlePublish = useCallback(
    (title: string, description: string, category: BountyCategory, reward: string) => {
      let rewardType: "points" | "treat" | "cash" = "points";
      if (reward.includes("积分")) rewardType = "points";
      else if (reward.includes("元")) rewardType = "cash";
      else rewardType = "treat";

      const newBounty: MockBounty = {
        id: `user-${Date.now()}`,
        type: "bounty",
        title,
        description,
        category,
        reward,
        rewardType,
        status: "waiting",
        author: "匿名同学",
        createdAt: "刚刚",
      };
      setBounties((prev) => [newBounty, ...prev]);
    },
    [],
  );

  // ── 悬赏互助 Tab ───────────────────────────────────────
  const BountyTab = useMemo(() => {
    const aiSorted = bounties.filter((b) => b.id.startsWith("ai-"));
    const userBounties = bounties.filter((b) => !b.id.startsWith("ai-"));

    return (
      <div className="flex-1 px-3 pt-4 pb-[100px] space-y-3">
        {/* AI 自动分拣区域 */}
        {aiSorted.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-[11px] font-bold text-[#8b5cf6] bg-[#f5f3ff] px-2 py-0.5 rounded-full">
                🤖 AI 自动分拣
              </span>
              <span className="text-[11px] text-[#94a3b8]">从动态流中识别到 {aiSorted.length} 条需求</span>
            </div>
            <div className="space-y-2.5">
              {aiSorted.map((b) => (
                <BountyCard key={b.id} bounty={b} />
              ))}
            </div>
            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#e8ecf1]" />
              <span className="text-[11px] text-[#94a3b8] shrink-0">同学发布</span>
              <div className="flex-1 h-px bg-[#e8ecf1]" />
            </div>
          </div>
        )}

        {/* User Bounties */}
        {userBounties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Megaphone size={40} className="text-[#cbd5e1]" />
            <p className="text-[14px] text-[#94a3b8]">暂无悬赏，快发布第一条</p>
            <button
              onClick={() => setShowPublishModal(true)}
              className="text-[13px] text-[#10b981] font-semibold underline active:text-[#059669]"
            >
              发布第一条
            </button>
          </div>
        )}
        {userBounties.map((b) => (
          <BountyCard key={b.id} bounty={b} />
        ))}
      </div>
    );
  }, [bounties]);

  // ── 评价避雷 Tab ───────────────────────────────────────
  const ReviewTab = useMemo(() => {
    const teacherReviews = reviews.filter((r) => r.category === "teacher");
    const foodReviews = reviews.filter((r) => r.category === "food");

    return (
      <div className="flex-1 px-3 pt-4 pb-[100px] space-y-5">
        {/* Teacher Search */}
        <TeacherSearch reviews={teacherReviews} />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e8ecf1]" />
          <span className="text-[11px] text-[#94a3b8] shrink-0 flex items-center gap-1">
            <Coffee size={12} /> 美食评价
          </span>
          <div className="flex-1 h-px bg-[#e8ecf1]" />
        </div>

        {/* Food Reviews */}
        <div className="space-y-2.5">
          {foodReviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </div>
    );
  }, [reviews]);

  return (
    <div
      className="flex flex-col min-h-screen relative max-w-[390px] mx-auto"
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* ═══════════════════════════════════════════════════════
          Sticky Header
          ═══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-white pt-0 shrink-0">
        {/* Nav bar */}
        <div className="flex items-center gap-3 px-4 h-[52px] border-b border-[#e8ecf1]">
          <Link href="/" className="p-1.5 -ml-1.5 rounded-full active:bg-[#f1f5f9] transition-colors">
            <ArrowLeft size={20} className="text-[#1e293b]" />
          </Link>
          <Megaphone size={20} className="text-[#10b981]" strokeWidth={2} />
          <span className="text-[17px] font-bold text-[#1e293b]">情报与悬赏</span>
        </div>

        {/* Main Tabs: 悬赏互助 | 评价避雷 */}
        <div className="bg-[#F6F7F9] border-b border-[#e8ecf1]">
          <div className="flex gap-1 px-3 py-2.5">
            <button
              onClick={() => setActiveTab("bounty")}
              className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95 ${
                activeTab === "bounty"
                  ? "bg-[#10b981] text-white shadow-sm"
                  : "bg-white text-[#64748b]"
              }`}
            >
              🎯 悬赏互助
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={`flex-1 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95 ${
                activeTab === "review"
                  ? "bg-[#f59e0b] text-white shadow-sm"
                  : "bg-white text-[#64748b]"
              }`}
            >
              ⚠️ 评价避雷
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Publish Floating Button (only in bounty tab)
          ═══════════════════════════════════════════════════════ */}
      {activeTab === "bounty" && (
        <button
          onClick={() => setShowPublishModal(true)}
          className="fixed bottom-8 right-[calc(50%-min(195px,50vw)+12px)] z-50 bg-gradient-to-r from-[#10b981] to-[#059669] text-white w-[calc(100%-24px)] max-w-[351px] mx-auto left-1/2 -translate-x-1/2 py-3.5 rounded-[18px] shadow-lg shadow-[#10b981]/20 flex items-center justify-center gap-2 text-[15px] font-bold active:scale-[0.98] transition-transform"
        >
          <Plus size={18} />
          发布悬赏
        </button>
      )}

      {/* Content */}
      {activeTab === "bounty" ? BountyTab : ReviewTab}

      {/* ═══════════════════════════════════════════════════════
          Publish Modal
          ═══════════════════════════════════════════════════════ */}
      <PublishModal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublish}
      />
    </div>
  );
}

export default RequestCenterView;