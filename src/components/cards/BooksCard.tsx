"use client";
import React, { useState } from "react";
import { BookOpen, Minus, Plus } from "lucide-react";

interface BookItem {
  name: string;
  price: number;
}

interface BooksCardProps {
  messageId: string;
  books?: BookItem[];
  onConfirm?: () => void;
}

const DEFAULT_BOOKS: BookItem[] = [
  { name: "民法学", price: 45 },
  { name: "刑法学", price: 52 },
];

export default function BooksCard({ messageId, books = DEFAULT_BOOKS, onConfirm }: BooksCardProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [confirmed, setConfirmed] = useState(false);

  const getQty = (name: string) => quantities[name] ?? 0;

  const adjustQty = (name: string, delta: number) => {
    if (confirmed) return;
    setQuantities((prev) => {
      const current = prev[name] ?? 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[name];
      } else {
        updated[name] = next;
      }
      return updated;
    });
  };

  const totalPrice = books.reduce((sum, b) => sum + (getQty(b.name) * b.price), 0);
  const hasSelection = totalPrice > 0;

  if (confirmed) {
    const orderedItems = books
      .filter((b) => getQty(b.name) > 0)
      .map((b) => `${b.name} ×${getQty(b.name)}`);
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-w-[85%] w-full">
        <div className="flex items-center gap-1.5 mb-3">
          <BookOpen size={16} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-zinc-800">📚 教材征订</h3>
        </div>
        <p className="text-xs text-gray-500 mb-2">✅ 订单已提交</p>
        {orderedItems.length > 0 && (
          <p className="text-xs text-gray-600 mb-1">订购：{orderedItems.join("、")}</p>
        )}
        <p className="text-xs font-bold text-zinc-800">合计：¥{totalPrice}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-w-[85%] w-full">
      <div className="flex items-center gap-1.5 mb-3">
        <BookOpen size={16} className="text-blue-500" />
        <h3 className="text-sm font-semibold text-zinc-800">📚 教材征订</h3>
      </div>

      <div className="space-y-2 mb-4">
        {books.map((book) => {
          const qty = getQty(book.name);
          return (
            <div
              key={book.name}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-800">
                  《{book.name}》
                </span>
                <span className="text-xs text-gray-500">{book.price}元</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustQty(book.name, -1)}
                  disabled={qty === 0}
                  className="min-w-[44px] min-h-[44px] rounded-full bg-gray-200 text-gray-600 flex items-center justify-center active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label={`减少${book.name}`}
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-semibold text-zinc-800 w-5 text-center tabular-nums">
                  {qty}
                </span>
                <button
                  onClick={() => adjustQty(book.name, 1)}
                  className="min-w-[44px] min-h-[44px] rounded-full bg-gray-200 text-gray-600 flex items-center justify-center active:bg-gray-300 transition-all"
                  aria-label={`增加${book.name}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 mb-3 border border-gray-100">
        <span className="text-xs text-gray-500">合计</span>
        <span className="text-xs font-bold text-zinc-800">{totalPrice}元</span>
      </div>

      <button
        onClick={() => { setConfirmed(true); onConfirm?.(); }}
        disabled={!hasSelection}
        className={`w-full font-bold min-h-[44px] py-2.5 rounded-full flex items-center justify-center gap-2 transition-all ${
          hasSelection
            ? "bg-blue-500 text-white active:bg-blue-600"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        确认提交订单
      </button>
    </div>
  );
}