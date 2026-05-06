"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "favorites_ids";

// ── Context Shape ────────────────────────────────────
interface FavoritesContextValue {
  /** Set of post IDs currently favorited */
  favoritedIds: Set<string>;
  /** Number of favorited posts */
  favoritesCount: number;
  /** Check if a post is favorited */
  isFavorited: (postId: string) => boolean;
  /** Toggle favorite status for a post; returns new status */
  toggleFavorite: (postId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favoritedIds: new Set(),
  favoritesCount: 0,
  isFavorited: () => false,
  toggleFavorite: () => false,
});

// ── Provider ─────────────────────────────────────────
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: string[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavoritedIds(new Set(parsed));
        }
      }
    } catch {
      // corrupted data → start fresh
    }
    setMounted(true);
  }, []);

  // Persist to localStorage on change (skip initial mount)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...favoritedIds]),
      );
    } catch {
      // storage quota exceeded → silently fail
    }
  }, [favoritedIds, mounted]);

  const isFavorited = useCallback(
    (postId: string) => favoritedIds.has(postId),
    [favoritedIds],
  );

  const toggleFavorite = useCallback((postId: string): boolean => {
    let newStatus = false;
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        newStatus = false;
      } else {
        next.add(postId);
        newStatus = true;
      }
      return next;
    });
    return newStatus;
  }, []);

  const value: FavoritesContextValue = {
    favoritedIds,
    favoritesCount: favoritedIds.size,
    isFavorited,
    toggleFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within <FavoritesProvider>");
  }
  return ctx;
}