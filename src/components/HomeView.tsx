"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  MessageCircle,
  Hash,
  Users,
  Compass,
  ChevronLeft,
  Shield,
  Sparkles,
  Bot,
  Image as ImageIcon,
  Heart,
} from "lucide-react";

// ===================== Data =====================
const orgList = [
  {
    id: "1",
    name: "我的班级",
    icon: Shield,
    unread: 2,
    summary: "2项高优待办：毕业论文定稿...",
    role: "admin",
    colors: "from-blue-500 to-indigo-600",
    time: "10:24",
  },
  {
    id: "2",
    name: "院学生会",
    icon: Users,
    unread: 3,
    summary: "[AI 总结] 收集“迎新晚会”策划案...",
    role: "member",
    colors: "from-orange-400 to-red-500",
    time: "昨天",
  },
  {
    id: "3",
    name: "志愿者服务",
    icon: Heart,
    unread: 2,
    summary: "[AI 总结] 周末敬老院活动报名名单确认...",
    role: "member",
    colors: "from-green-500 to-emerald-600",
    time: "10-12",
  },
];

// ===================== Types =====================
type SchoolTab = "orgs" | "feed";
type OrgRole = "admin" | "member";

interface HomeViewProps {
  activeSchoolTab: SchoolTab;
  setActiveSchoolTab: (tab: SchoolTab) => void;
  isGlobalAiExpanded: boolean;
  setIsGlobalAiExpanded: (v: boolean) => void;
  setCurrentOrgName: (name: string) => void;
  setCurrentOrgRole: (role: OrgRole) => void;
  setView: (view: "home" | "class") => void;
}

// ===================== Component =====================
export function HomeView({
  activeSchoolTab,
  setActiveSchoolTab,
  isGlobalAiExpanded,
  setIsGlobalAiExpanded,
  setCurrentOrgName,
  setCurrentOrgRole,
  setView,
}: HomeViewProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Global Navigation Container */}
      <div className="pt-[54px] pb-0 px-0 bg-white sticky top-0 z-40 flex flex-col border-b border-zinc-100/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] shrink-0">
        {/* Layer 1: Main Title Area */}
        <div className="flex items-center justify-between px-3 h-10 w-full">
          <div className="w-10 h-10 flex items-center justify-start">
            <button className="text-zinc-900 p-1 active:bg-zinc-100 rounded-full transition-colors opacity-0 pointer-events-none">
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex-1 flex justify-center items-center">
            <span className="text-[18px] font-bold text-black tracking-wide">
              我的学校
            </span>
          </div>
          <div className="w-10 h-10 flex items-center justify-end">
            <button className="text-zinc-900 p-1 active:bg-zinc-100 rounded-full transition-colors">
              <Plus size={26} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Layer 2: Sub Tabs */}
        <div className="flex justify-center items-center space-x-12 mt-1 relative w-full">
          <button
            onClick={() => setActiveSchoolTab("orgs")}
            className={`text-[15px] pb-2 transition-colors relative font-medium cursor-pointer ${
              activeSchoolTab === "orgs"
                ? "text-blue-500 font-bold"
                : "text-zinc-500"
            }`}
          >
            我的组织
            {activeSchoolTab === "orgs" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveSchoolTab("feed")}
            className={`text-[15px] pb-2 transition-colors relative font-medium cursor-pointer ${
              activeSchoolTab === "feed"
                ? "text-blue-500 font-bold"
                : "text-zinc-500"
            }`}
          >
            校园动态
            {activeSchoolTab === "feed" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[24px] h-[3px] bg-blue-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-hidden relative bg-[#f6f7f9] w-full">
        <div
          className="flex w-[200%] h-full transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(${activeSchoolTab === "orgs" ? "0%" : "-50%"})`,
          }}
        >
          {/* Left Page: Organizations (List Mode) */}
          <div className="w-1/2 h-full overflow-y-auto px-3 pt-3 pb-[100px] hide-scrollbar space-y-2.5">
            {/* AI 全局调度中心卡片 */}
            <div
              className="bg-blue-50 border border-blue-100 rounded-[20px] p-4 shadow-sm relative overflow-hidden flex flex-col gap-2 cursor-pointer transition-all active:scale-[0.98]"
              onClick={() => setIsGlobalAiExpanded(!isGlobalAiExpanded)}
            >
              <div className="flex items-center gap-2 z-10 w-full">
                <Sparkles size={18} className="text-blue-500 shrink-0" />
                <span className="text-[14px] font-bold text-blue-900 truncate">
                  {isGlobalAiExpanded ? "AI 统筹" : "AI 统筹：今日 2 项紧急待办未结"}
                </span>
              </div>
              {isGlobalAiExpanded && (
                <div className="text-[13px] text-blue-800/80 leading-relaxed z-10 font-medium mt-1">
                  今天你有 <span className="text-blue-900 font-bold">2</span> 项跨组织的紧急待办。<br/>
                  班级：<span className="text-blue-900 font-bold">期中论文定稿</span> (剩 5 小时)<br/>
                  院学生会：<span className="text-blue-900 font-bold">策划案初稿</span> (剩 1 天)
                </div>
              )}
            </div>

            {orgList.map((org) => (
              <Link
                href={org.name === "我的班级" ? "/student" : "#"}
                key={org.id}
                  onClick={(e) => {
                   if (org.name === "我的班级") {
                     // Follow link to /student
                     setCurrentOrgRole("admin");
                     return;
                   }
                  e.preventDefault();
                  setCurrentOrgName(org.name);
                  setCurrentOrgRole(org.role as OrgRole);
                  setView("class");
                  router.push("#class");
                }}
                className="flex items-center bg-white p-3.5 rounded-[20px] active:scale-[0.98] transition-all cursor-pointer select-none shadow-sm relative"
              >
                {/* Left Avatar */}
                <div
                  className={`w-[48px] h-[48px] bg-gradient-to-br ${org.colors} rounded-[16px] flex items-center justify-center shrink-0 shadow-inner overflow-hidden relative`}
                >
                  <org.icon
                    fill={org.id === "1" ? "currentColor" : "none"}
                    className={`text-white/20 w-7 h-7 absolute ${org.id === "1" ? "block" : "hidden"}`}
                  />
                  <org.icon className="text-white w-6 h-6 stroke-[2] relative z-10" />
                </div>

                {/* Center Content */}
                <div className="flex-1 ml-3.5 min-w-0 pr-[4.5rem]">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="font-bold text-[16px] text-zinc-900 truncate tracking-tight">
                      {org.name}
                    </div>
                  </div>
                  <div className="text-[13px] text-zinc-500 mt-0.5 truncate">
                    {org.id === "1" ? (
                      <span className="text-[#f54f46] font-medium shrink-0">
                        🔴{" "}
                        {org.role === "admin"
                          ? "3人未交：毕业论文定稿..."
                          : "2项高优待办：毕业论文定稿..."}
                      </span>
                    ) : (
                      org.summary
                    )}
                  </div>
                </div>

                {/* Right Metadata */}
                <div className="flex flex-col items-end shrink-0 pl-1 self-stretch pt-0.5 justify-between absolute right-3.5 top-3.5 bottom-3.5">
                  <span className="text-zinc-400 text-[11px] font-medium">
                    {org.time}
                  </span>

                  <div className="flex flex-col items-end gap-1">
                    {org.role === "admin" ? (
                      <div className="px-1.5 py-0.5 rounded bg-blue-500 text-white text-[10px] font-bold">
                        管理员
                      </div>
                    ) : (
                      <div className="px-1.5 py-0.5 rounded bg-[#ebedf0] text-[#555] text-[10px] font-bold">
                        成员
                      </div>
                    )}

                    {org.unread > 0 && (
                      <div className="min-w-[18px] h-[18px] bg-[#f54f46] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1.5 shadow-[0_2px_6px_rgba(245,79,70,0.3)] mt-0.5">
                        {org.unread}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Page: Feed (Waterfall Mode) */}
          <div className="w-1/2 h-full overflow-y-auto px-3 pt-3 pb-[100px] hide-scrollbar space-y-3">
            {/* AI Hot Topics Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[18px] p-4 shadow-sm border border-blue-100/50 overflow-hidden">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles size={16} className="text-blue-500" />
                <span className="text-[14px] font-bold text-blue-900">
                  AI 校园热搜
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
                  {/* Duplicate for smooth scroll */}
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

            {/* Feed Item 1 */}
            <div
              onClick={() => alert("进入帖子详情")}
              className="bg-white rounded-[20px] p-4 flex flex-col gap-2 shadow-sm active:scale-95 transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-zinc-200"></div>
                <span className="text-[12px] text-zinc-500 font-medium">
                  吃货小分队
                </span>
              </div>

              <div className="text-[14px] font-medium text-zinc-800 line-clamp-2 leading-relaxed">
                谁知道二食堂那家炸鸡什么时候恢复营业啊？等好几天了，真的很想吃😭
              </div>
              <div className="flex items-center justify-between text-zinc-400 mt-2">
                <span className="text-[11px]">10分钟前</span>
                <div className="flex items-center gap-2.5">
                  <MessageCircle size={16} />
                  <span className="text-[11px]">12</span>
                </div>
              </div>
              <div
                className="mt-2 text-blue-500 bg-blue-50/80 px-3 py-2 rounded-xl text-[12px] flex items-center gap-1.5 active:bg-blue-100/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  alert("AI 摘要：发帖人正在询问二食堂炸鸡店的恢复营业时间，已有12人参与讨论。");
                }}
              >
                <Bot size={14} />
                <span className="font-bold">AI 摘要</span>
              </div>
            </div>

            {/* Feed Item 2 */}
            <div
              onClick={() => alert("进入帖子详情")}
              className="bg-white rounded-[20px] p-4 flex flex-col gap-2 shadow-sm active:scale-95 transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-zinc-200"></div>
                <span className="text-[12px] text-zinc-500 font-medium">
                  法学院小透明
                </span>
              </div>

              <div className="text-[14px] font-medium text-zinc-800 line-clamp-2 leading-relaxed">
                这周四下午的民法典讲座有人去吗？我占座多一个位置，先到先得~
              </div>
              <div className="w-full h-[120px] bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center mt-1">
                <ImageIcon size={28} className="text-zinc-300" />
              </div>
              <div className="flex items-center justify-between text-zinc-400 mt-2">
                <span className="text-[11px]">45分钟前</span>
                <div className="flex items-center gap-2.5">
                  <MessageCircle size={16} />
                  <span className="text-[11px]">34</span>
                </div>
              </div>
              <div
                className="mt-2 text-blue-500 bg-blue-50/80 px-3 py-2 rounded-xl text-[12px] flex items-center gap-1.5 active:bg-blue-100/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  alert("AI 摘要：发帖人提供一个周四下午民法典讲座的占位，目前已有34人留言。");
                }}
              >
                <Bot size={14} />
                <span className="font-bold">AI 摘要</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Global Navigation */}
      <div className="absolute bottom-0 inset-x-0 h-[88px] bg-white/95 backdrop-blur-xl border-t border-zinc-200/60 flex justify-around items-start pt-[14px] px-2 z-40 shrink-0 select-none">
        <button className="flex flex-col items-center gap-1.5 w-[70px] text-zinc-400">
          <MessageCircle size={24} strokeWidth={2.5} className="mb-0.5" />
          <span className="text-[11px] font-bold">消息</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 w-[70px] text-blue-500">
          <div className="relative">
            <Hash size={24} strokeWidth={3} className="mb-0.5" />
            <div className="absolute -top-1 -right-1 w-[9px] h-[9px] bg-[#f54f46] rounded-full border-[1.5px] border-white"></div>
          </div>
          <span className="text-[11px] font-bold">频道</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 w-[70px] text-zinc-400">
          <Users size={24} strokeWidth={2.5} className="mb-0.5" />
          <span className="text-[11px] font-bold">联系人</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 w-[70px] text-zinc-400">
          <Compass size={24} strokeWidth={2.5} className="mb-0.5" />
          <span className="text-[11px] font-bold">动态</span>
        </button>
      </div>
    </div>
  );
}
