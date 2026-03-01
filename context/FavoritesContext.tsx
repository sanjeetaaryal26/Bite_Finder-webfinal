"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { getFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from "@/lib/favorites";
import { useToast } from "@/context/ToastContext";

type FavoritesContextValue = {
  favoriteIds: Set<string>;
  isFavorite: (restaurantId: string) => boolean;
  addFavorite: (restaurantId: string) => Promise<void>;
  removeFavorite: (restaurantId: string) => Promise<void>;
  togglingId: string | null;
  syncFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const syncFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    try {
      const list = await getFavorites();
      const ids = new Set(list.map((f) => (typeof f.restaurant === "object" ? f.restaurant._id : f.restaurant)));
      setFavoriteIds(ids);
    } catch {
      setFavoriteIds(new Set());
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    syncFavorites();
  }, [user, syncFavorites]);

  const isFavorite = useCallback(
    (restaurantId: string) => favoriteIds.has(restaurantId),
    [favoriteIds]
  );

  const addFavorite = useCallback(
    async (restaurantId: string) => {
      if (!user) return;
      setTogglingId(restaurantId);
      setFavoriteIds((prev) => new Set(prev).add(restaurantId));
      try {
        await apiAddFavorite(restaurantId);
        toast.success("Added to favorites");
      } catch (err: unknown) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(restaurantId);
          return next;
        });
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        toast.error(msg || "Failed to add to favorites");
      } finally {
        setTogglingId(null);
      }
    },
    [user, toast]
  );

  const removeFavorite = useCallback(
    async (restaurantId: string) => {
      if (!user) return;
      setTogglingId(restaurantId);
      const prev = new Set(favoriteIds);
      prev.delete(restaurantId);
      setFavoriteIds(prev);
      try {
        await apiRemoveFavorite(restaurantId);
        toast.success("Removed from favorites");
      } catch (err: unknown) {
        setFavoriteIds((prev) => new Set(prev).add(restaurantId));
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        toast.error(msg || "Failed to remove from favorites");
      } finally {
        setTogglingId(null);
      }
    },
    [user, favoriteIds, toast]
  );

  const value = useMemo(
    () => ({
      favoriteIds,
      isFavorite,
      addFavorite,
      removeFavorite,
      togglingId,
      syncFavorites,
    }),
    [favoriteIds, isFavorite, addFavorite, removeFavorite, togglingId, syncFavorites]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
