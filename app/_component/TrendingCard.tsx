"use client";

import Link from "next/link";
import StarRating from "./StarRating";
import type { TrendingRestaurant } from "@/types/restaurant";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=320&h=200&fit=crop";

type TrendingCardProps = {
  restaurant: TrendingRestaurant;
  savedCount?: number; // use totalFavorites or favoriteCount from most-saved
};

export default function TrendingCard({ restaurant, savedCount }: TrendingCardProps) {
  const img = restaurant.image || PLACEHOLDER_IMG;
  const count = savedCount ?? restaurant.totalFavorites ?? 0;

  return (
    <Link
      href={`/restaurants/${restaurant._id}`}
      className="group flex-shrink-0 w-[280px] sm:w-[300px] bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-xl hover:shadow-orange-100 hover:border-orange-300 transition-all duration-300 hover:-translate-y-0.5"
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
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span className="text-red-500" aria-hidden>❤</span>
            <span>{count}</span>
          </span>
        </div>
        {restaurant.district && (
          <p className="text-xs text-gray-400 mt-1 truncate">{restaurant.district}</p>
        )}
      </div>
    </Link>
  );
}
