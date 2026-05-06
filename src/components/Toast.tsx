"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

// ── Types ────────────────────────────────────────────
interface ToastMessage {
  id: number;
  text: string;
}

interface ToastContextValue {
  showToast: (text: string) => void;
}

// ── Context ──────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

// ── Hook ─────────────────────────────────────────────
export function useToast() {
  return useContext(ToastContext);
}

// ── Provider ─────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((text: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, text }]);

    // Auto-dismiss after 2s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  const value: ToastContextValue = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* ── Toast Layer ──────────────────────── */}
      <div
        aria-live="polite"
        className="fixed bottom-24 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-zinc-800/90 backdrop-blur text-white text-[13px] font-medium px-5 py-2.5 rounded-full shadow-lg
              animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
          >
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}