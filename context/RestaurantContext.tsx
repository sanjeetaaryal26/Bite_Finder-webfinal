"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { Restaurant } from "@/types/restaurant";

type RestaurantContextValue = {
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (r: Restaurant | null) => void;
  refreshReviewsTrigger: number;
  refreshReviews: () => void;
};

const RestaurantContext = createContext<RestaurantContextValue | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [refreshReviewsTrigger, setRefreshReviewsTrigger] = useState(0);

  const refreshReviews = useCallback(() => {
    setRefreshReviewsTrigger((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({
      selectedRestaurant,
      setSelectedRestaurant,
      refreshReviewsTrigger,
      refreshReviews,
    }),
    [selectedRestaurant, refreshReviewsTrigger, refreshReviews]
  );

  return (
    <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used within RestaurantProvider");
  return ctx;
}
