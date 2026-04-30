import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, FileText, User, Sparkles, Folder, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AILoading } from './ui/AILoading';

// ----------------------------------------
// Subcomponent: Assistant Tab
// ----------------------------------------
function AssistantTab() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<any[]>([
    {
      id: '1',
      type: 'bot',
      content: (
        <div className="space-y-3">
          <p>同学你好！我是你的班级助理。所有班级通知、打卡收集都会在这里下发。</p>
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-medium mb-2 text-zinc-800">
               <FileText size={16} className="text-blue-500"/>
               <span>待办交互演示</span>
            </div>
            <p className="text-xs text-zinc-500 mb-3">辅导员发起了《中秋留校意愿统计》</p>
            <div className="space-y-2">
               <button className="w-full text-left px-3 py-2 text-sm border border-zinc-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors focus:ring-1 focus:ring-blue-400">
                 留校（参加学校晚会）
               </button>
               <button className="w-full text-left px-3 py-2 text-sm border border-zinc-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors focus:ring-1 focus:ring-blue-400">
                 回家（已买好车票）
               </button>
            </div>
          </div>
        </div>
      )
    }
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', content: input }]);
    const query = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          contextTitle: '我的班级',
        }),
      });

      const data = await response.json();
      const reply = response.ok ? data.reply : '抱歉，AI 服务器暂时出现了点问题，请稍后再试。';

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: <div className="whitespace-pre-wrap">{reply}</div>
      }]);
    } catch (error) {
      console.error('Chat API error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: <div className="whitespace-pre-wrap text-red-500">网络连接失败，请检查网络后重试。</div>
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const faqs = ["帮我找下那个民法课件", "本周青年大学习截止时间？", "请假流程是什么？"];

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-32 z-10">
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={`flex gap-3 max-w-full ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
              msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
            }`}>
              {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm ${
              msg.type === 'user' 
                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                : 'bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-3 max-w-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm text-white">
              <Bot size={16} />
            </div>
            <AILoading text="语义识别与检索中..." />
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-white via-white to-transparent z-20">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
          {faqs.map(faq => (
            <button 
              key={faq}
              onClick={() => { setInput(faq); }}
              className="px-3 py-1.5 flex-shrink-0 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-100 transition-colors shadow-sm"
            >
              {faq}
            </button>
          ))}
        </div>
        <form onSubmit={handleSend} className="relative shadow-sm rounded-2xl border border-zinc-200 bg-white flex items-center overflow-hidden focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="下达指令或对话..."
            className="flex-1 px-4 py-3.5 outline-none text-sm text-zinc-900 placeholder-zinc-400"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="mr-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-100 disabled:text-zinc-400 text-white rounded-xl transition-all"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------
// Subcomponent: Asset Tab
// ----------------------------------------
function AssetTab() {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 space-y-6">
      {/* Identity Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-5 text-white shadow-xl shadow-zinc-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">张轶铭 (学生)</h2>
            <p className="text-zinc-400 text-sm font-mono">ID: 20231405022</p>
          </div>
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
            <User size={20} className="text-zinc-200" />
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between relative z-10">
          <div>
             <p className="text-xs text-zinc-400 mb-1">班级</p>
             <p className="text-sm font-medium">法学23级 1班</p>
          </div>
          <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">完善信息</button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm flex items-center gap-5">
         <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path className="text-zinc-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-blue-500" strokeWidth="4" strokeDasharray="80, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-800">
              80%
            </div>
         </div>
         <div>
            <h3 className="font-semibold text-zinc-900 text-sm">本周任务达成度</h3>
            <p className="text-xs text-zinc-500 mt-1">综合测评审批材料待补充 (1 / 5)</p>
            <button className="mt-2 text-xs font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700">
              去处理助手待办 <ChevronRight size={14} />
            </button>
         </div>
      </div>

      {/* Private Cloud */}
      <div>
         <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500"/> 个人私有云 (AI元数据解析)
         </h3>
         <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-zinc-800">蓝桥杯省一等奖证书.pdf</span>
              </div>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-medium">
                 综测预估加分: +2.0
              </span>
            </div>
            <div className="px-4 py-3 bg-zinc-50/50 text-xs text-zinc-600 line-clamp-2">
               AI已提取：证书所属人(张轶铭), 奖项级别(省级), 名次(一等奖)。该资料已被自动上锁，仅限本人调阅并生成审计日志。
            </div>
         </div>
      </div>

      {/* Public KB */}
      <div>
         <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
            <Folder size={16} className="text-amber-500"/> 公共知识库
         </h3>
         <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-amber-300 transition-colors shadow-sm cursor-pointer">
               <Folder size={24} className="text-amber-400 mb-3" />
               <h4 className="text-sm font-medium text-zinc-800">专业必修课件</h4>
               <p className="text-xs text-zinc-500 mt-1">12个 AI打捞文件</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-amber-300 transition-colors shadow-sm cursor-pointer">
               <Folder size={24} className="text-amber-400 mb-3" />
               <h4 className="text-sm font-medium text-zinc-800">团建照片记录</h4>
               <p className="text-xs text-zinc-500 mt-1">45个 共享文件</p>
            </div>
         </div>
      </div>

      <div className="h-6" />
    </div>
  );
}

// ----------------------------------------
// Main Component
// ----------------------------------------
export function StudentView() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'assets'>('assistant');

  return (
    <div className="flex flex-col h-full bg-zinc-100">
      {/* View Switcher Tabs */}
      <div className="flex bg-white shadow-sm border-b border-zinc-200 shrink-0">
         <button 
           onClick={() => setActiveTab('assistant')}
           className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'assistant' ? 'text-blue-600 border-blue-600' : 'text-zinc-500 border-transparent hover:text-zinc-800'}`}
         >
            智能助理
         </button>
         <button 
           onClick={() => setActiveTab('assets')}
           className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'assets' ? 'text-blue-600 border-blue-600' : 'text-zinc-500 border-transparent hover:text-zinc-800'}`}
         >
            智能资产仓
         </button>
      </div>

      {activeTab === 'assistant' ? <AssistantTab /> : <AssetTab />}
    </div>
  );
}
