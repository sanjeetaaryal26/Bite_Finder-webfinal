"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMostSavedRestaurants } from "@/lib/restaurants";
import type { MostSavedRestaurant } from "@/types/restaurant";
import TrendingCard from "./TrendingCard";
import { TrendingCardSkeleton } from "./Skeleton";

const SKELETON_COUNT = 4;

export default function MostSavedSection() {
  const [items, setItems] = useState<MostSavedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMostSavedRestaurants(10)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="animate-fade-slide-in-delay-1">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl" aria-hidden>❤️</span>
          Most Saved
        </h2>
        <Link
          href="/favorites"
          className="text-sm font-semibold text-orange-500 hover:text-orange-700 transition"
        >
          My favorites →
        </Link>
      </div>
      <div className="overflow-x-auto overflow-y-hidden pb-2 -mx-1 scroll-smooth-x">
        <div className="flex gap-4 min-w-0">
          {loading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <TrendingCardSkeleton key={i} />
            ))
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center w-full py-8 text-gray-500 text-sm">
              No saved restaurants yet.
            </div>
          ) : (
            items.map((r) => (
              <TrendingCard
                key={r._id}
                restaurant={r}
                savedCount={r.favoriteCount}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
