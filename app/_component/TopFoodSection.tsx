"use client";

import { useState, useEffect, useCallback } from "react";
import { getTopFoodByDistrict } from "@/lib/restaurants";
import type { TopFoodItem } from "@/types/restaurant";
import { TrendingCardSkeleton, TopFoodItemSkeleton } from "./Skeleton";
import StarRating from "./StarRating";

const DISTRICTS = ["Kathmandu", "Lalitpur", "Bhaktapur"] as const;

export default function TopFoodSection() {
  const [district, setDistrict] = useState<string>("Kathmandu");
  const [items, setItems] = useState<TopFoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopFood = useCallback(() => {
    setLoading(true);
    getTopFoodByDistrict(district)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [district]);

  useEffect(() => {
    fetchTopFood();
  }, [fetchTopFood]);

  return (
    <section className="animate-fade-slide-in-delay-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl" aria-hidden>🏆</span>
          Top Food in District
        </h2>
        <label className="flex items-center gap-2">
          <span className="text-sm text-gray-600">District:</span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 transition"
          >
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <TopFoodItemSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No food data for this district yet.
          </div>
        ) : (
          <ul className="divide-y divide-orange-50">
            {items.map((item, index) => (
              <li
                key={`${item.foodName}-${index}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-orange-50/50 transition-colors"
              >
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-bold text-sm flex items-center justify-center"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 truncate">
                    {item.foodName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.totalReviews} reviews
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StarRating
                    rating={item.averageRating}
                    showValue={true}
                    size="sm"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
