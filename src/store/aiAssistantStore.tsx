"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────
export type PersonalityId = "efficiency" | "slacker" | "sarcastic" | "custom";

export interface AiAssistantState {
  personalityId: PersonalityId;
  userPreferences: string;
  growthLevel: number;
  avatarId: string;
  completedTaskIds: string[];
}

export interface AiAssistantContextValue extends AiAssistantState {
  setPersonality: (id: PersonalityId) => void;
  setUserPreferences: (text: string) => void;
  completeTask: (taskId: string) => void;
  isTaskCompleted: (taskId: string) => boolean;
  completedCount: number;
  resetAssistant: () => void;
}

// ── Personality Meta ──────────────────────────────────
export const PERSONALITY_META: Record<
  PersonalityId,
  { label: string; icon: string; description: string; colorClass: string }
> = {
  efficiency: {
    label: "冷面效率型",
    icon: "⚡",
    description: "惜字如金，直击要害",
    colorClass: "from-slate-100 to-blue-50 text-blue-700",
  },
  slacker: {
    label: "摸鱼摆烂型",
    icon: "🦥",
    description: "比你还懒，但靠谱",
    colorClass: "from-amber-50 to-orange-50 text-orange-700",
  },
  sarcastic: {
    label: "阴阳怪气型",
    icon: "🍵",
    description: "温柔刀，刀刀扎心",
    colorClass: "from-purple-50 to-pink-50 text-purple-700",
  },
  custom: {
    label: "自定义",
    icon: "🎭",
    description: "你说了算",
    colorClass: "from-indigo-50 to-violet-50 text-indigo-700",
  },
};

// ── Avatar mapping by growthLevel tier ─────────────────
export function getAvatarByLevel(level: number): {
  avatarId: string;
  emoji: string;
  label: string;
} {
  if (level >= 80) return { avatarId: "legend", emoji: "🦄", label: "传奇助理" };
  if (level >= 60) return { avatarId: "elite", emoji: "🦊", label: "精英助理" };
  if (level >= 40) return { avatarId: "veteran", emoji: "🐱", label: "老手助理" };
  if (level >= 20) return { avatarId: "rookie", emoji: "🐣", label: "新手助理" };
  return { avatarId: "egg", emoji: "🥚", label: "助理蛋" };
}

// ── Accessory mapping for Lv.3+ evolution ────────────
export function getAccessoryByLevel(level: number): string | null {
  if (level >= 80) return "👑";   // Lv.5: crown
  if (level >= 60) return "🎀";   // Lv.4: ribbon
  if (level >= 40) return "✨";   // Lv.3: sparkles
  return null;                     // Lv.1-2: no accessory
}

// ── Constants ──────────────────────────────────────────
const STORAGE_KEY = "ai_assistant_state";
const DEFAULT_STATE: AiAssistantState = {
  personalityId: "efficiency",
  userPreferences: "",
  growthLevel: 0,
  avatarId: "egg",
  completedTaskIds: [],
};
const MAX_USER_PREFERENCES = 100;
const LEVEL_PER_TASK = 20;

// ── Context ────────────────────────────────────────────
const AiAssistantContext = createContext<AiAssistantContextValue>({
  ...DEFAULT_STATE,
  setPersonality: () => {},
  setUserPreferences: () => {},
  completeTask: () => {},
  isTaskCompleted: () => false,
  completedCount: 0,
  resetAssistant: () => {},
});

// ── Provider ──────────────────────────────────────────
export function AiAssistantProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AiAssistantState>(DEFAULT_STATE);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({
          personalityId: parsed.personalityId ?? DEFAULT_STATE.personalityId,
          userPreferences: parsed.userPreferences ?? parsed.customPrompt ?? DEFAULT_STATE.userPreferences,
          growthLevel: parsed.growthLevel ?? DEFAULT_STATE.growthLevel,
          avatarId: parsed.avatarId ?? DEFAULT_STATE.avatarId,
          completedTaskIds: Array.isArray(parsed.completedTaskIds)
            ? parsed.completedTaskIds
            : [],
        });
      }
    } catch {
      // corrupted → use defaults
    }
    setMounted(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota exceeded
    }
  }, [state, mounted]);

  const setPersonality = useCallback((id: PersonalityId) => {
    setState((prev) => ({ ...prev, personalityId: id }));
  }, []);

  const setUserPreferences = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      userPreferences: text.slice(0, MAX_USER_PREFERENCES),
    }));
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setState((prev) => {
      if (prev.completedTaskIds.includes(taskId)) return prev;
      const newIds = [...prev.completedTaskIds, taskId];
      const newLevel = Math.min(100, newIds.length * LEVEL_PER_TASK);
      const avatar = getAvatarByLevel(newLevel);
      return {
        ...prev,
        completedTaskIds: newIds,
        growthLevel: newLevel,
        avatarId: avatar.avatarId,
      };
    });
  }, []);

  const isTaskCompleted = useCallback(
    (taskId: string) => state.completedTaskIds.includes(taskId),
    [state.completedTaskIds],
  );

  const resetAssistant = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const value: AiAssistantContextValue = {
    ...state,
    setPersonality,
    setUserPreferences,
    completeTask,
    isTaskCompleted,
    completedCount: state.completedTaskIds.length,
    resetAssistant,
  };

  return (
    <AiAssistantContext.Provider value={value}>
      {children}
    </AiAssistantContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────
export function useAiAssistant() {
  const ctx = useContext(AiAssistantContext);
  if (!ctx) {
    throw new Error(
      "useAiAssistant must be used within <AiAssistantProvider>",
    );
  }
  return ctx;
}