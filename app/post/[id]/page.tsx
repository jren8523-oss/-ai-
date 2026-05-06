"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Send,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import { mockPosts, type Comment, type Post } from "@/src/lib/mockData";
import { useFavorites } from "@/src/store/favoritesStore";
import { useToast } from "@/src/components/Toast";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const post = mockPosts.find((p) => p.id === id);

  // ---- Hydration-safe mounted guard ----
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ---- Like State ----
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likes ?? 0);

  // Sync likesCount from mockPost on mount (and if post changes)
  useEffect(() => {
    if (post) {
      setLikesCount(post.likes);
      setIsLiked(false);
    }
  }, [post?.id]);

  // ---- Comments State ----
  const [comments, setComments] = useState<Comment[]>([]);
  useEffect(() => {
    if (post) {
      setComments([...post.comments]);
    }
  }, [post?.id]);

  // ---- Comment Input State ----
  const [inputValue, setInputValue] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const newComment: Comment = {
      id: `local-${Date.now()}`,
      postId: post?.id ?? "",
      author: { name: "我", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=me" },
      content: trimmed,
      createdAt: "刚刚",
    };
    setComments((prev) => [newComment, ...prev]);
    setInputValue("");
  }, [inputValue, post?.id]);

  const handleLike = useCallback(() => {
    setIsLiked((prev) => {
      const next = !prev;
      setLikesCount((cnt) => (next ? cnt + 1 : cnt - 1));
      return next;
    });
  }, []);

  // ---- Favorites ----
  const { isFavorited, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

  const handleToggleFavorite = useCallback(() => {
    const nowFavorited = toggleFavorite(id);
    showToast(nowFavorited ? "已存入收藏夹" : "已取消收藏");
  }, [toggleFavorite, showToast, id]);

  // ---- Not found guard ----
  if (!post) {
    return (
      <div className="w-full max-w-md mx-auto bg-white min-h-screen shadow-xl flex flex-col">
        <div className="h-[54px] bg-white flex items-center px-4 border-b border-zinc-100/80 shrink-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-zinc-600 active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} />
            <span className="text-[14px] font-medium">返回</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-zinc-400 text-[14px]">帖子不存在</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen shadow-xl flex flex-col">
      {/* ---- Top Bar ---- */}
      <div className="bg-white flex items-center px-4 border-b border-zinc-100/80 shrink-0 sticky top-0 z-30 h-[54px]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-zinc-600 active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} />
          <span className="text-[14px] font-medium">返回</span>
        </button>
        <span className="flex-1 text-center text-[16px] font-bold text-zinc-900 mr-8">
          帖子详情
        </span>
      </div>

      {/* ---- Scrollable Content ---- */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[80px]">
        {/* ---- Post Card ---- */}
        <div className="bg-white rounded-none p-4 flex flex-col gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[14px] text-zinc-700 font-bold">
              {post.author.name}
            </span>
          </div>

          <div className="text-[14px] font-medium text-zinc-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>

          {post.image && (
            <div className="w-full h-[180px] bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center mt-1">
              <ImageIcon size={36} className="text-zinc-300" />
            </div>
          )}

          <div className="flex items-center justify-between text-zinc-400 mt-2">
            <span className="text-[11px]">{post.createdAt}</span>
            <div className="flex items-center gap-1">
              <MessageCircle size={16} />
              <span className="text-[11px]">{comments.length}</span>
            </div>
          </div>

          {/* Action Buttons: Like + Star */}
          <div className="flex items-center justify-center gap-6 border-t border-zinc-100 mt-2 pt-3">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 px-5 py-1.5 rounded-full active:scale-95 transition-all select-none"
            >
              <Heart
                size={20}
                className={
                  isLiked
                    ? "fill-[#f54f46] text-[#f54f46] transition-colors"
                    : "text-zinc-400 transition-colors"
                }
              />
              <span
                className={
                  isLiked
                    ? "text-[13px] font-bold text-[#f54f46]"
                    : "text-[13px] font-medium text-zinc-400"
                }
              >
                {mounted ? likesCount : post.likes}
              </span>
            </button>

            <button
              onClick={handleToggleFavorite}
              className="flex items-center gap-1.5 px-5 py-1.5 rounded-full active:scale-95 transition-all select-none"
            >
              <Star
                size={20}
                className={
                  isFavorited(id)
                    ? "fill-[#FFD700] text-[#FFD700] transition-colors"
                    : "text-zinc-400 transition-colors"
                }
              />
            </button>
          </div>
        </div>

        {/* ---- Divider ---- */}
        <div className="px-4 py-3">
          <span className="text-[12px] text-zinc-400 font-medium">
            评论 {comments.length}
          </span>
        </div>

        {/* ---- Comment List ---- */}
        <div className="space-y-0 px-0">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white px-4 py-3 flex gap-3 border-b border-zinc-50"
            >
              <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12px] font-bold text-zinc-700">
                    {comment.author.name}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {comment.createdAt}
                  </span>
                </div>
                <p className="text-[13px] text-zinc-600 leading-relaxed break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <div className="flex items-center justify-center py-10">
            <span className="text-[13px] text-zinc-400">暂无评论，快来抢沙发～</span>
          </div>
        )}
      </div>

      {/* ---- Sticky Comment Input Bar ---- */}
      <div className="fixed bottom-0 inset-x-0 bg-white/85 backdrop-blur-xl border-t border-zinc-200/60 px-4 py-2.5 flex items-center gap-3 z-40">
        <div className="w-full max-w-md mx-auto flex items-center gap-3">
          <div className="flex-1 flex items-center bg-zinc-100/80 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="发表评论..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-transparent text-[14px] text-zinc-800 placeholder-zinc-400 outline-none border-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
            style={{
              backgroundColor: inputValue.trim() ? "#3b82f6" : "#d4d4d8",
            }}
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Keyboard safe-area spacer for mobile */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}