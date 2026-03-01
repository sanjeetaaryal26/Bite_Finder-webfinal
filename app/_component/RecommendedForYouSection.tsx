"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRecommendations } from "@/lib/restaurants";
import type { Restaurant } from "@/types/restaurant";
import StarRating from "./StarRating";
import { RestaurantCardSkeleton } from "./Skeleton";
import { useAuth } from "@/context/AuthContext";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=240&fit=crop";

function RecommendationCard({ restaurant }: { restaurant: Restaurant }) {
  const img = restaurant.images?.[0] || PLACEHOLDER_IMG;

  return (
    <Link
      href={`/restaurants/${restaurant._id}`}
      className="group bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-xl hover:shadow-orange-100 hover:border-orange-300 transition-all duration-300 hover:-translate-y-0.5 block"
    >
      <div className="aspect-[4/3] bg-orange-50 relative overflow-hidden">
        <img
          src={img}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-base group-hover:text-orange-600 transition line-clamp-1">
          {restaurant.name}
        </h3>
        <div className="flex items-center justify-between mt-2 gap-2">
          <StarRating rating={restaurant.averageRating} showValue={true} size="sm" />
          {restaurant.district && (
            <span className="text-xs text-gray-500 truncate max-w-[120px]" title={restaurant.district}>
              {restaurant.district}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function RecommendedForYouSection() {
  const { user } = useAuth();
  const [items, setItems] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getRecommendations()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <section className="animate-fade-slide-in">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
        <span className="text-xl" aria-hidden>🧠</span>
        Recommended For You
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-orange-100 p-8 sm:p-10 text-center">
          <p className="text-gray-600 text-sm sm:text-base">
            Start saving restaurants to get recommendations 🍕
          </p>
          <Link
            href="/restaurants"
            className="inline-block mt-3 text-sm font-semibold text-orange-500 hover:text-orange-700 transition"
          >
            Browse restaurants →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((r) => (
            <RecommendationCard key={r._id} restaurant={r} />
          ))}
        </div>
      )}
    </section>
  );
}
