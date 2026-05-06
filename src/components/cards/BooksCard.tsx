"use client";
import React, { useState } from "react";
import { BookOpen, CheckCircle } from "lucide-react";

interface BookItem {
  name: string;
  price: number;
}

interface BooksCardProps {
  messageId: string;
  books?: BookItem[];
}

const DEFAULT_BOOKS: BookItem[] = [
  { name: "民法学", price: 45 },
  { name: "刑法学", price: 52 },
];

export default function BooksCard({ messageId, books = DEFAULT_BOOKS }: BooksCardProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);

  const toggleBook = (name: string) => {
    if (confirmed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const totalPrice = (books || []).reduce((sum, b) => (selected.has(b.name) ? sum + b.price : sum), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-w-[85%] w-full">
      <div className="flex items-center gap-1.5 mb-3">
        <BookOpen size={16} className="text-blue-500" />
        <h3 className="text-sm font-semibold text-zinc-800">📚 教材征订</h3>
      </div>

      <p className="text-xs text-gray-500 mb-3">请勾选需要订购的教材：</p>

      <div className="space-y-2 mb-4">
        {books.map((book) => {
          const isSelected = selected.has(book.name);
          return (
            <button
              key={book.name}
              onClick={() => toggleBook(book.name)}
              disabled={confirmed}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                confirmed
                  ? isSelected
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-gray-50 border-gray-100 text-gray-400"
                  : isSelected
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-gray-50 border-gray-100 text-gray-700 active:bg-gray-100"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    confirmed && isSelected
                      ? "bg-blue-500 border-blue-500"
                      : isSelected
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {(confirmed ? isSelected : isSelected) && <CheckCircle size={10} className="text-white" />}
                </span>
                {book.name}
              </span>
              <span className="text-blue-600">¥{book.price}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 mb-3 border border-gray-100">
        <span className="text-xs text-gray-500">合计</span>
        <span className="text-xs font-bold text-zinc-800">¥{totalPrice}</span>
      </div>

      <button
        onClick={() => { if (!confirmed) setConfirmed(true); }}
        disabled={confirmed || selected.size === 0}
        className={`w-full font-bold py-2.5 rounded-full flex items-center justify-center gap-2 transition-all ${
          confirmed
            ? "bg-green-50 text-green-600 border border-green-200 cursor-not-allowed"
            : selected.size === 0
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white active:bg-blue-600"
        }`}
      >
        {confirmed
          ? `✅ 已提交 — 共 ¥${totalPrice}`
          : selected.size === 0
          ? "请选择教材"
          : `确认征订 (¥${totalPrice})`}
      </button>
    </div>
  );
}