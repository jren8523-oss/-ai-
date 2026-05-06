"use client";

import type { ReactNode } from "react";
import { FavoritesProvider } from "@/src/store/favoritesStore";
import { AiAssistantProvider } from "@/src/store/aiAssistantStore";
import { CalendarProvider } from "@/src/store/calendarStore";
import { ToastProvider } from "@/src/components/Toast";

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <CalendarProvider>
      <FavoritesProvider>
        <AiAssistantProvider>
          <ToastProvider>{children}</ToastProvider>
        </AiAssistantProvider>
      </FavoritesProvider>
    </CalendarProvider>
  );
}
