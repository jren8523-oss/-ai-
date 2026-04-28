import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function AILoading({ text = "AI分析推理中..." }: { text?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-blue-600 text-sm p-3 bg-blue-50/80 rounded-xl border border-blue-100 min-w-[140px] w-fit shadow-sm"
    >
      <Sparkles className="w-4 h-4 animate-pulse text-indigo-500" />
      <span className="font-medium text-blue-800">{text}</span>
      <div className="flex gap-1 ml-1 items-center h-full pt-1">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
      </div>
    </motion.div>
  );
}
