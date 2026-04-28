import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, ChevronDown, Check, X, ShieldAlert, Zap, FileText, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AILoading } from './ui/AILoading';

// ----------------------------------------
// Subcomponent: Call AI Tab (Admin)
// ----------------------------------------
function CallAITab() {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([
    {
      id: '0',
      type: 'bot',
      content: "班委你好，我是班级调度中枢。请直接输入要布置的任务或需要归档的文件。例如：“下周三之前每人交50块钱班费购买辅导资料”。"
    }
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const query = input;
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', content: query }]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      setMessages(prev => [
        ...prev, 
        { 
          id: (Date.now() + 1).toString(), 
          type: 'task-card', 
          data: {
            title: query.includes("班费") ? "收取班费" : "新任务下发",
            labels: ["#收缴", "#紧急"],
            amount: query.includes("50") ? "50" : "",
            deadline: ""
          }
        }
      ]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 border-b border-zinc-200">
        {messages.map((msg) => {
          if (msg.type === 'task-card') {
             return (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className="max-w-md bg-white border border-blue-200 shadow-md rounded-2xl overflow-hidden focus-within:border-blue-400 transition-colors">
                  <div className="bg-blue-50/50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
                     <span className="font-semibold text-blue-900 flex items-center gap-2">
                       <Zap size={16} className="text-yellow-500" />
                       留白核准 (任务配置)
                     </span>
                  </div>
                  <div className="p-4 space-y-4">
                     <div>
                       <label className="text-xs font-medium text-zinc-500 mb-1 block">AI提取标签 (可修正)</label>
                       <div className="flex gap-2">
                          {msg.data.labels.map((lb: string) => (
                             <span key={lb} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100 flex items-center gap-1 group cursor-pointer hover:bg-indigo-100 transition-colors">
                               {lb} <X size={12} className="opacity-50 group-hover:opacity-100" />
                             </span>
                          ))}
                          <button className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md border border-zinc-200 hover:bg-zinc-200 transition-colors border-dashed">
                             + 添加标签
                          </button>
                       </div>
                     </div>
                     <div className="space-y-3">
                       <div>
                         <label className="text-xs font-medium text-zinc-500 mb-1 block">任务金额 (元)</label>
                         <input type="number" defaultValue={msg.data.amount} placeholder="AI未分析到，请补充" className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-amber-400 bg-amber-50/30" />
                       </div>
                       <div>
                         <label className="text-xs font-medium text-zinc-500 mb-1 block">截止日期</label>
                         <input type="datetime-local" placeholder="AI未分析到，请补充" className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-amber-400 bg-amber-50/30 text-zinc-700" />
                       </div>
                     </div>
                     <button className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm">
                       确权并下发
                     </button>
                  </div>
               </motion.div>
             )
          }

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex gap-3 max-w-full ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                msg.type === 'user' ? 'bg-zinc-800 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
              }`}>
                {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.type === 'user' 
                  ? 'bg-zinc-800 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          )
        })}
        
        {isThinking && (
          <div className="flex gap-3 max-w-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm text-white">
              <Bot size={16} />
            </div>
            <AILoading text="语义解析 & 提取动作中..." />
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white z-20 border-t border-zinc-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSend} className="relative shadow-sm rounded-2xl border border-zinc-200 bg-white flex items-center overflow-hidden focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-50 transition-all">
           <button type="button" className="pl-4 pr-2 text-zinc-400 hover:text-blue-500 transition-colors">
              <Upload size={18} />
           </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="指派新任务或管理文件..."
            className="flex-1 px-2 py-3.5 outline-none text-sm text-zinc-900 placeholder-zinc-400"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isThinking}
            className="mr-2 px-3 py-2 bg-zinc-900 hover:bg-black disabled:bg-zinc-100 disabled:text-zinc-400 text-white text-sm font-medium rounded-xl transition-all"
          >
            发布
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------
// Subcomponent: Workbench Tab (Admin)
// ----------------------------------------
function WorkbenchTab() {
  const [taskExpanded, setTaskExpanded] = useState(false);
  const [isUrging, setIsUrging] = useState(false);
  const [urgeDone, setUrgeDone] = useState(false);

  const handleUrge = () => {
    setIsUrging(true);
    setTimeout(() => {
       setIsUrging(false);
       setUrgeDone(true);
    }, 1500);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 space-y-6">
       
       {/* Member Approvals */}
       <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
         <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <ShieldAlert size={16} className="text-orange-500" />
              新同学申请 (1)
            </h3>
         </div>
         <div className="flex items-center justify-between p-3 bg-orange-50/50 rounded-xl border border-orange-100/50">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-zinc-200 flex-shrink-0 flex items-center justify-center text-zinc-500 overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
               </div>
               <div>
                  <h4 className="text-sm font-medium text-zinc-900">李华</h4>
                  <p className="text-xs text-zinc-500">学号: 20231405099</p>
               </div>
            </div>
            <div className="flex gap-2">
               <button className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-600 text-xs font-medium rounded-lg hover:bg-zinc-50">拒绝</button>
               <button className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-medium rounded-lg">通过</button>
            </div>
         </div>
       </div>

       {/* Task Flow Board */}
       <div>
         <h3 className="text-sm font-semibold text-zinc-900 mb-3 px-1">任务流看板</h3>
         <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div 
              className="p-4 flex items-start justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
              onClick={() => setTaskExpanded(!taskExpanded)}
            >
               <div>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 cursor-help" title="点击修正标签">#收缴</span>
                    <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100">#紧急</span>
                 </div>
                 <h4 className="text-sm font-semibold text-zinc-900">收取班费</h4>
                 <p className="text-xs text-zinc-500 mt-1">发布于 2 小时前</p>
               </div>
               <div className="text-right">
                 <div className="text-lg font-bold text-zinc-800">28<span className="text-xs text-zinc-400 font-normal">/30</span></div>
                 <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                   展开详情 <ChevronDown size={14} className={`transition-transform ${taskExpanded ? 'rotate-180' : ''}`}/>
                 </div>
               </div>
            </div>

            <AnimatePresence>
              {taskExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-zinc-100 bg-zinc-50 overflow-hidden"
                >
                  <div className="p-4">
                     <p className="text-xs font-medium text-red-500 mb-3 block">深度审计：未完成红名单 (2人)</p>
                     <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1.5 bg-white border border-red-200 text-red-700 text-xs rounded-lg shadow-sm">王磊</span>
                        <span className="px-3 py-1.5 bg-white border border-red-200 text-red-700 text-xs rounded-lg shadow-sm">赵敏</span>
                     </div>
                     
                     {isUrging ? (
                        <div className="mt-2"><AILoading text="正在生成拟人化代催话术..." /></div>
                     ) : urgeDone ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2.5 rounded-xl border border-green-200 w-fit">
                          <Check size={16} /> 已通过AI私聊分发催办指令
                        </div>
                     ) : (
                        <button 
                          onClick={handleUrge}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
                        >
                          <Zap size={16} /> AI 一键拟态代催
                        </button>
                     )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
       </div>

       {/* Format Purifier */}
       <div>
         <h3 className="text-sm font-semibold text-zinc-900 mb-3 px-1 flex items-center justify-between">
           <span>格式净化池</span>
           <button className="text-xs text-blue-600 font-medium hover:underline">一键打包ZIP</button>
         </h3>
         <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 text-xs text-zinc-500 font-medium flex justify-between">
               <span>混沌文件名</span>
               <span>合规重命名</span>
            </div>
            <div className="divide-y divide-zinc-100">
               <div className="p-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-zinc-600 line-through decoration-red-300 w-[120px] truncate">
                    <FileText size={14} className="flex-shrink-0 text-zinc-400"/>
                    <span className="truncate">文档(1).docx</span>
                  </div>
                  <ChevronDown size={14} className="text-zinc-300 -rotate-90 flex-shrink-0" />
                  <div className="flex items-center gap-2 text-green-700 font-medium w-[150px] truncate justify-end">
                    <span className="truncate">学号_王磊_实验报告.docx</span>
                    <Check size={14} className="flex-shrink-0 text-green-500"/>
                  </div>
               </div>
               <div className="p-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-zinc-600 line-through decoration-red-300 w-[120px] truncate">
                    <FileText size={14} className="flex-shrink-0 text-zinc-400"/>
                    <span className="truncate">未命名.pdf</span>
                  </div>
                  <ChevronDown size={14} className="text-zinc-300 -rotate-90 flex-shrink-0" />
                  <div className="flex items-center gap-2 text-green-700 font-medium w-[150px] truncate justify-end">
                    <span className="truncate">学号_赵敏_实验报告.pdf</span>
                    <Check size={14} className="flex-shrink-0 text-green-500"/>
                  </div>
               </div>
            </div>
         </div>
       </div>

    </div>
  );
}

// ----------------------------------------
// Main Component
// ----------------------------------------
export function AdminView() {
  const [activeTab, setActiveTab] = useState<'callAI' | 'workbench'>('callAI');

  return (
    <div className="flex flex-col h-full bg-zinc-100">
      <div className="flex bg-zinc-900 text-white shadow-sm shrink-0">
         <button 
           onClick={() => setActiveTab('callAI')}
           className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'callAI' ? 'text-white border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'}`}
         >
            呼叫AI (指派中心)
         </button>
         <button 
           onClick={() => setActiveTab('workbench')}
           className={`flex-1 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'workbench' ? 'text-white border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'}`}
         >
            班委工作台
         </button>
      </div>

      {activeTab === 'callAI' ? <CallAITab /> : <WorkbenchTab />}
    </div>
  );
}
