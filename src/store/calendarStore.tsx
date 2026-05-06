"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ── Source Material ───────────────────────────────────
export interface SourceMaterial {
  id: string;
  type: "image" | "file" | "text";
  name: string;
  content: string;
  uploadedAt: string;
}

// ── Draft Agenda Item ──────────────────────────────────
export interface DraftAgendaItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  requirements?: string;
  sourceId: string;
  confirmed: boolean;
}

// ── Confirmed Calendar Event ───────────────────────────
export interface CalendarEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  location?: string;
  requirements?: string;
  confirmedAt: string;
}

// ── State ──────────────────────────────────────────────
export interface CalendarState {
  sources: SourceMaterial[];
  draftAgenda: DraftAgendaItem[];
  isProcessing: boolean;
  confirmedEvents: CalendarEvent[];
}

type CalendarAction =
  | { type: "ADD_SOURCE"; payload: SourceMaterial }
  | { type: "REMOVE_SOURCE"; payload: string }
  | { type: "START_PROCESSING" }
  | { type: "SET_DRAFT_AGENDA"; payload: DraftAgendaItem[] }
  | { type: "CONFIRM_ITEM"; payload: { draftId: string; event: CalendarEvent } }
  | { type: "DELETE_CONFIRMED_EVENT"; payload: string }
  | { type: "UPDATE_DRAFT_ITEM"; payload: { id: string; title: string; date: string; time?: string; location?: string; requirements?: string } }
  | { type: "RESET_DRAFT" };

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case "ADD_SOURCE":
      return { ...state, sources: [...state.sources, action.payload] };

    case "REMOVE_SOURCE":
      return { ...state, sources: state.sources.filter((s) => s.id !== action.payload) };

    case "START_PROCESSING":
      return { ...state, isProcessing: true };

    case "SET_DRAFT_AGENDA":
      return { ...state, isProcessing: false, draftAgenda: action.payload };

    case "CONFIRM_ITEM": {
      const updatedDraft = state.draftAgenda.map((item) =>
        item.id === action.payload.draftId ? { ...item, confirmed: true } : item,
      );
      return {
        ...state,
        draftAgenda: updatedDraft,
        confirmedEvents: [action.payload.event, ...state.confirmedEvents],
      };
    }

    case "UPDATE_DRAFT_ITEM": {
      const updatedDraft = state.draftAgenda.map((item) =>
        item.id === action.payload.id
          ? { ...item, title: action.payload.title, date: action.payload.date, time: action.payload.time, location: action.payload.location, requirements: action.payload.requirements }
          : item,
      );
      return { ...state, draftAgenda: updatedDraft };
    }

    case "DELETE_CONFIRMED_EVENT":
      return { ...state, confirmedEvents: state.confirmedEvents.filter((e) => e.id !== action.payload) };

    case "RESET_DRAFT":
      return { ...state, draftAgenda: [], isProcessing: false };

    default:
      return state;
  }
}

// ── Context Value ──────────────────────────────────────
export interface CalendarContextValue {
  state: CalendarState;
  addSource: (source: SourceMaterial) => void;
  removeSource: (id: string) => void;
  startParsing: () => void;
  completeParsing: (items: DraftAgendaItem[]) => void;
  confirmItem: (draftId: string) => void;
  deleteConfirmedEvent: (id: string) => void;
  discardItem: (draftId: string) => void;
  updateDraftItem: (id: string, title: string, date: string, time?: string, location?: string, requirements?: string) => void;
  resetDraft: () => void;
  pendingDraftCount: number;
  sourcesCount: number;
  mostUrgentTwo: CalendarEvent[];
}

// ── Wizard of Oz Mock Parsing Engine ───────────────────
// Demo: returns 3 anonymized preset events
// regardless of what the user uploads or clicks.
export function mockParsing(_sources: SourceMaterial[]): DraftAgendaItem[] {
  if (_sources.length === 0) return [];

  const events: DraftAgendaItem[] = [
    {
      id: `draft-oz-${Date.now()}-1`,
      title: "民事诉讼法研讨",
      date: "2026-05-05",
      time: "08:30",
      location: "法学院 401",
      requirements: "",
      sourceId: "",
      confirmed: false,
    },
    {
      id: `draft-oz-${Date.now()}-2`,
      title: "模拟法庭实践",
      date: "2026-05-05",
      time: "14:00",
      location: "模拟法庭 B1",
      requirements: "",
      sourceId: "",
      confirmed: false,
    },
    {
      id: `draft-oz-${Date.now()}-3`,
      title: "法律文书写作讲座",
      date: "2026-05-05",
      time: "18:30",
      location: "图书馆 报告厅",
      requirements: "",
      sourceId: "",
      confirmed: false,
    },
  ];

  return events;
}

// ── Context ────────────────────────────────────────────
const CalendarContext = createContext<CalendarContextValue>({
  state: { sources: [], draftAgenda: [], isProcessing: false, confirmedEvents: [] },
  addSource: () => {},
  removeSource: () => {},
  startParsing: () => {},
  completeParsing: () => {},
  confirmItem: () => {},
  deleteConfirmedEvent: () => {},
  discardItem: () => {},
  updateDraftItem: () => {},
  resetDraft: () => {},
  pendingDraftCount: 0,
  sourcesCount: 0,
  mostUrgentTwo: [],
});

const STORAGE_KEY = "calendar_store_state";

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [state, dispatch] = useReducer(calendarReducer, {
    sources: [],
    draftAgenda: [],
    isProcessing: false,
    confirmedEvents: [],
  });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.confirmedEvents)) {
          dispatch({ type: "RESET_DRAFT" });
          for (const evt of parsed.confirmedEvents) {
            dispatch({ type: "CONFIRM_ITEM", payload: { draftId: evt.id, event: evt } });
          }
        }
      }
    } catch {
      // corrupted
    }
    setMounted(true);
  }, []);

  // Persist confirmedEvents
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ confirmedEvents: state.confirmedEvents }));
    } catch {
      // quota exceeded
    }
  }, [state.confirmedEvents, mounted]);

  const addSource = useCallback((source: SourceMaterial) => {
    dispatch({ type: "ADD_SOURCE", payload: source });
  }, []);

  const removeSource = useCallback((id: string) => {
    dispatch({ type: "REMOVE_SOURCE", payload: id });
  }, []);

  const startParsing = useCallback(() => {
    dispatch({ type: "START_PROCESSING" });
  }, []);

  const completeParsing = useCallback((items: DraftAgendaItem[]) => {
    dispatch({ type: "SET_DRAFT_AGENDA", payload: items });
  }, []);

  const confirmItem = useCallback((draftId: string) => {
    const draft = state.draftAgenda.find((d) => d.id === draftId);
    if (!draft || draft.confirmed) return;
    const event: CalendarEvent = {
      id: `evt-${Date.now()}`,
      date: draft.date,
      time: draft.time,
      title: draft.title,
      location: draft.location,
      requirements: draft.requirements,
      confirmedAt: new Date().toISOString(),
    };
    dispatch({ type: "CONFIRM_ITEM", payload: { draftId, event } });
  }, [state.draftAgenda]);

  const deleteConfirmedEvent = useCallback((id: string) => {
    dispatch({ type: "DELETE_CONFIRMED_EVENT", payload: id });
  }, []);

  const updateDraftItem = useCallback((id: string, title: string, date: string, time?: string, location?: string, requirements?: string) => {
    dispatch({ type: "UPDATE_DRAFT_ITEM", payload: { id, title, date, time, location, requirements } });
  }, []);

  const discardItem = useCallback((draftId: string) => {
    dispatch({ type: "RESET_DRAFT" });
  }, []);

  const resetDraft = useCallback(() => {
    dispatch({ type: "RESET_DRAFT" });
  }, []);

  const pendingDraftCount = state.draftAgenda.filter((d) => !d.confirmed).length;
  const sourcesCount = state.sources.length;

  const mostUrgentTwo = useMemo<CalendarEvent[]>(() => {
    const sorted = [...state.confirmedEvents]
      .filter((e) => e.date !== "待确认")
      .sort((a, b) => {
        const normA = normalizeDate(a.date);
        const normB = normalizeDate(b.date);
        return normA.getTime() - normB.getTime();
      });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = sorted.filter((e) => normalizeDate(e.date).getTime() >= today.getTime());
    if (upcoming.length > 0) {
      return upcoming.slice(0, 2);
    }
    return sorted.slice(-2);
  }, [state.confirmedEvents]);

  return (
    <CalendarContext.Provider
      value={{
        state,
        addSource,
        removeSource,
        startParsing,
        completeParsing,
        confirmItem,
        deleteConfirmedEvent,
        discardItem,
        updateDraftItem,
        resetDraft,
        pendingDraftCount,
        sourcesCount,
        mostUrgentTwo,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) {
    throw new Error("useCalendar must be used within <CalendarProvider>");
  }
  return ctx;
}

// ── Helper: normalize various date formats ─────────────
export function normalizeDate(input: string): Date {
  const now = new Date();
  const map: Record<string, number> = {
    "今天": 0, "明天": 1, "后天": 2,
    "周一": 1, "周二": 2, "周三": 3, "周四": 4, "周五": 5, "周六": 6, "周日": 0,
    "下周一": 8, "下周二": 9, "下周三": 10, "下周四": 11, "下周五": 12, "下周六": 13, "下周日": 7,
  };

  if (map[input] !== undefined) {
    const d = new Date(now);
    d.setDate(d.getDate() + map[input]);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const match1 = input.match(/(\d{1,2})月(\d{1,2})[日号]?/);
  if (match1) {
    const d = new Date(now.getFullYear(), parseInt(match1[1]) - 1, parseInt(match1[2]));
    d.setHours(0, 0, 0, 0);
    if (d.getTime() < now.getTime()) d.setFullYear(d.getFullYear() + 1);
    return d;
  }

  const match2 = input.match(/(\d{4})[年-](\d{1,2})[月-](\d{1,2})[日号]?/);
  if (match2) {
    return new Date(parseInt(match2[1]), parseInt(match2[2]) - 1, parseInt(match2[3]), 0, 0, 0, 0);
  }

  return new Date(now.getFullYear(), 11, 31, 0, 0, 0, 0);
}

export { normalizeDate as default };