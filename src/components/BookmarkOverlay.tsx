'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, X, Star } from 'lucide-react';
import { useFavorites } from '@/src/store/favoritesStore';
import { mockPosts } from '@/src/lib/mockData';

interface BookmarkOverlayProps {
  onClose: () => void;
}

const BookmarkOverlay: React.FC<BookmarkOverlayProps> = ({ onClose }) => {
  const router = useRouter();
  const { favoritedIds, toggleFavorite } = useFavorites();

  const items = useMemo(() => {
    return mockPosts.filter((p) => favoritedIds.has(p.id));
  }, [favoritedIds]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F6F7F9] max-w-[375px] mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 -ml-1.5"
          aria-label="关闭"
        >
          <X size={20} />
        </button>
        <h2 className="text-base font-semibold text-gray-800">⭐ 我的收藏</h2>
        <span className="text-xs text-gray-400">{items.length} 项</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-sm">
            <div className="text-4xl mb-3 opacity-40">⭐</div>
            <p>暂无收藏</p>
            <p className="text-xs mt-1 text-gray-300">在日程中点击星标即可收藏</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((post) => (
              <div
                key={post.id}
                onClick={() => {
                  router.push(`/post/${post.id}`);
                }}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer active:bg-gray-50 active:scale-[0.98] transition-all duration-150 select-none"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 leading-snug truncate">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span>{post.author.name}</span>
                      <span>{post.createdAt}</span>
                      <span>💬 {post.commentCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(post.id);
                      }}
                      className="p-1.5 rounded-lg text-yellow-500 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                      aria-label="取消收藏"
                    >
                      <Star size={16} fill="currentColor" />
                    </button>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkOverlay;
