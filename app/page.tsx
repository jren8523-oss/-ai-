"use client";
import React, { useState, useEffect, useRef } from "react";
import ClassHeader from "@/src/components/ClassHeader";
import QuickActionsPanel from "@/src/components/QuickActionsPanel";
import ChatInputBar from "@/src/components/ChatInputBar";
import { HomeView } from "@/src/components/HomeView";
import PreferencesModal from "@/src/components/PreferencesModal";
import SurveyFormModal from "@/src/components/SurveyFormModal";
import VaultView from "@/src/components/VaultView";
import ChatTimeline from "@/src/components/ChatTimeline";
import PosterShareModal from "@/src/components/PosterShareModal";
import { QUICK_ACTIONS, orgContextMap, mockTasks } from "@/src/lib/mockData";
import type { UIRequestPayload } from "@/src/lib/uiRequestProtocol";

export default function App() {
  const [view, setView] = useState<"home" | "class">("home");
  const [activeTab, setActiveTab] = useState<"assistant" | "vault">(
    "assistant",
  );
  const [currentOrgName, setCurrentOrgName] = useState<string>("我的班级");
  const [currentOrgRole, setCurrentOrgRole] = useState<"admin" | "member">(
    "admin",
  );

  const [vaultSubView, setVaultSubView] = useState<"overview" | "tasks">(
    "overview",
  );
  const [taskTab, setTaskTab] = useState<"pending" | "completed">("pending");

  const [showPreferences, setShowPreferences] = useState(false);
  const [persona, setPersona] = useState("摸鱼同桌");
  const [nudgeLevel, setNudgeLevel] = useState("常规");
  const [studentExtraMsgs, setStudentExtraMsgs] = useState<string[]>([]);
  const [activeTaskForm, setActiveTaskForm] = useState<string | null>(null);
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);

  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [surveyIntention, setSurveyIntention] = useState("就业");
  const [isSurveySubmitting, setIsSurveySubmitting] = useState(false);

  const [geofenceEnabled, setGeofenceEnabled] = useState(true);
  const [qrCodeEnabled, setQrCodeEnabled] = useState(true);
  const [attendancePublished, setAttendancePublished] = useState(false);

  const [orderAmount, setOrderAmount] = useState({ law: 0, civil: 0 });
  const [orderLocked, setOrderLocked] = useState(false);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showPosterShare, setShowPosterShare] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [pinnedIds, setPinnedIds] = useState<string[]>(["sign", "notice"]);
  const [showMorePanel, setShowMorePanel] = useState(false);
  const [messages, setMessages] = useState<
    {
      id: string;
      role: "user" | "ai";
      type: "text" | "books" | "checkin" | "checkin-config" | "ui-card";
      content?: string;
      uiRequest?: UIRequestPayload;
    }[]
  >([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking, activeTab]);

  useEffect(() => {
    if (view === "class") {
      const context =
        orgContextMap[currentOrgName] || orgContextMap["我的班级"];
      setMessages([
        {
          id: "initial",
          role: "ai",
          type: "text",
          content: context.initialMessage,
        },
      ]);
      setChatInput("");
    }
  }, [view, currentOrgName, currentOrgRole]);

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", type: "text", content: text },
    ]);
    setChatInput("");
    setIsAiThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          contextTitle: currentOrgName,
        }),
      });

      const data = await response.json();
      const reply = response.ok ? data.reply : "抱歉，服务器出现了点问题。";
      const msgType = (response.ok && data.type) ? data.type : "text";

      const newMsg: {
        id: string;
        role: "ai";
        type: "text" | "books" | "checkin" | "checkin-config" | "ui-card";
        content?: string;
        uiRequest?: UIRequestPayload;
      } = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        type: msgType as typeof newMsg.type,
        content: reply as string,
        ...(response.ok && data.uiRequest ? { uiRequest: data.uiRequest as UIRequestPayload } : {}),
      };

      setMessages((prev) => [...prev, newMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: typeof messages[0] = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        type: "text",
        content: "网络连接失败，请稍后重试。",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const [customActions, setCustomActions] = useState<
    {
      id: string;
      icon: string;
      label: string;
      prompt: string;
      isCustom: boolean;
    }[]
  >([]);
  const [showAddCustomAction, setShowAddCustomAction] = useState(false);
  const [newActionLabel, setNewActionLabel] = useState("");
  const [newActionPrompt, setNewActionPrompt] = useState("");

  const allActions = [...QUICK_ACTIONS, ...customActions];

  const [activeApp, setActiveApp] = useState<"files" | "albums" | "highlights">(
    "files",
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleOrderSubmit = () => {
    setIsOrderSubmitting(true);
    setTimeout(() => {
      setIsOrderSubmitting(false);
      setOrderLocked(true);
    }, 1000);
  };

  const handleTaskSubmit = () => {
    setIsTaskSubmitting(true);
    setTimeout(() => {
      setIsTaskSubmitting(false);
      setActiveTaskForm(null);
    }, 1000);
  };

  const handleSurveySubmit = () => {
    setIsSurveySubmitting(true);
    setTimeout(() => {
      setIsSurveySubmitting(false);
      setShowSurveyForm(false);
      setSurveySubmitted(true);
      setStudentExtraMsgs((prev) => [
        ...prev,
        "✅ 收到！你的《毕业流向调查》已完成结构化归档，进度已同步至班委大盘。",
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen antialiased font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full min-h-screen bg-[#f6f7f9] relative flex flex-col">
        {/* --- STATE 1: HOME VIEW (always mounted, hidden via CSS to preserve scroll) --- */}
        <div className={view === "home" ? "" : "hidden"}>
          <HomeView />
        </div>

        {/* --- STATE 2: CLASS SPACE VIEW --- */}
        {view === "class" && (
          <div className="flex flex-col h-full bg-[#f6f7f9] relative overflow-hidden">
            <ClassHeader
              currentOrgName={currentOrgName}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentOrgRole={currentOrgRole}
              onBack={() => setView("home")}
            />

            <div className="flex-1 overflow-hidden relative bg-[#f6f7f9]">
              {activeTab === "assistant" && (
                <div className="flex flex-col h-full">
                  <ChatTimeline
                    messages={messages}
                    isAiThinking={isAiThinking}
                    currentOrgName={currentOrgName}
                    currentOrgRole={currentOrgRole}
                    messagesEndRef={messagesEndRef}
                    orgContextMap={orgContextMap}
                    onSendMessage={(text) => {
                      setChatInput(text);
                      setTimeout(() => handleSend(), 0);
                    }}
                  />
                  <ChatInputBar
                    currentOrgRole={currentOrgRole}
                    activeTab={activeTab}
                    allActions={allActions}
                    pinnedIds={pinnedIds}
                    setChatInput={setChatInput}
                    setShowMorePanel={setShowMorePanel}
                    chatInput={chatInput}
                    isAiThinking={isAiThinking}
                    handleSend={handleSend}
                  />
                </div>
              )}

              {activeTab === "vault" && (
                <VaultView
                  currentOrgRole={currentOrgRole}
                  vaultSubView={vaultSubView}
                  setVaultSubView={setVaultSubView}
                  activeApp={activeApp}
                  setActiveApp={setActiveApp}
                  currentOrgName={currentOrgName}
                  geofenceEnabled={geofenceEnabled}
                  setGeofenceEnabled={setGeofenceEnabled}
                  qrCodeEnabled={qrCodeEnabled}
                  setQrCodeEnabled={setQrCodeEnabled}
                  attendancePublished={attendancePublished}
                  setAttendancePublished={setAttendancePublished}
                  orderAmount={orderAmount}
                  setOrderAmount={setOrderAmount}
                  orderLocked={orderLocked}
                  setOrderLocked={setOrderLocked}
                  isOrderSubmitting={isOrderSubmitting}
                  handleOrderSubmit={handleOrderSubmit}
                  handleTaskSubmit={handleTaskSubmit}
                  showToast={showToast}
                  taskTab={taskTab}
                  setTaskTab={setTaskTab}
                  activeTaskForm={activeTaskForm}
                  setActiveTaskForm={setActiveTaskForm}
                  isTaskSubmitting={isTaskSubmitting}
                  mockTasks={mockTasks}
                />
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        <PreferencesModal
          show={showPreferences}
          onClose={() => setShowPreferences(false)}
          persona={persona}
          setPersona={setPersona}
          nudgeLevel={nudgeLevel}
          setNudgeLevel={setNudgeLevel}
          studentExtraMsgs={studentExtraMsgs}
          setStudentExtraMsgs={setStudentExtraMsgs}
        />

        <SurveyFormModal
          show={showSurveyForm}
          onClose={() => setShowSurveyForm(false)}
          surveyIntention={surveyIntention}
          setSurveyIntention={setSurveyIntention}
          isSurveySubmitting={isSurveySubmitting}
          onSubmit={handleSurveySubmit}
        />

        <QuickActionsPanel
          showMorePanel={showMorePanel}
          setShowMorePanel={setShowMorePanel}
          allActions={allActions}
          pinnedIds={pinnedIds}
          setPinnedIds={setPinnedIds}
          setCustomActions={setCustomActions}
          setChatInput={setChatInput}
          showAddCustomAction={showAddCustomAction}
          setShowAddCustomAction={setShowAddCustomAction}
          newActionLabel={newActionLabel}
          setNewActionLabel={setNewActionLabel}
          newActionPrompt={newActionPrompt}
          setNewActionPrompt={setNewActionPrompt}
        />

        <PosterShareModal
          show={showPosterShare}
          onClose={() => setShowPosterShare(false)}
        />

        {/* Global Toast */}
        {toastMessage && (
          <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-zinc-800 text-white px-5 py-3 rounded-full shadow-lg text-[14px] font-bold whitespace-nowrap">
              {toastMessage}
            </div>
          </div>
        )}
      </div>

      {/* Utilities */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes vertical-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-scroll {
          animation: vertical-scroll 10s linear infinite;
        }
      `}</style>
    </div>
  );
}