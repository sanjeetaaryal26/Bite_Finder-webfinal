"use client";

import Link from "next/link";
import type { Restaurant } from "@/types/restaurant";
import StarRating from "./StarRating";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/context/ToastContext";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=240&fit=crop";

type RestaurantCardProps = {
  restaurant: Restaurant;
  showHeart?: boolean;
};

function HeartIcon({ filled, loading }: { filled: boolean; loading?: boolean }) {
  if (loading) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8">
        <svg
          className="animate-spin h-5 w-5 text-orange-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </span>
    );
  }
  return filled ? (
    <svg className="w-6 h-6 text-red-500 transition transform scale-100" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="w-6 h-6 text-gray-400 hover:text-red-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

export default function RestaurantCard({ restaurant, showHeart = true }: RestaurantCardProps) {
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite, togglingId } = useFavorites();
  const toast = useToast();
  const img = restaurant.images?.[0] || PLACEHOLDER_IMG;
  const desc = restaurant.description
    ? restaurant.description.slice(0, 80) + (restaurant.description.length > 80 ? "…" : "")
    : "No description";

  const favorited = isFavorite(restaurant._id);
  const loading = togglingId === restaurant._id;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Log in to save favorites");
      return;
    }
    if (favorited) {
      removeFavorite(restaurant._id);
    } else {
      addFavorite(restaurant._id);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-xl hover:shadow-orange-100 hover:border-orange-300 transition group">
      <Link href={`/restaurants/${restaurant._id}`} className="block">
        <div className="aspect-[4/3] bg-orange-50 relative overflow-hidden">
          <img
            src={img}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <div className="p-5">
          <h3 className="font-bold text-gray-800 text-base group-hover:text-orange-600 transition">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={restaurant.averageRating} showValue={true} size="sm" />
            <span className="text-xs text-gray-400">({restaurant.totalReviews} reviews)</span>
          </div>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{desc}</p>
        </div>
      </Link>
      {showHeart && (
        <button
          type="button"
          onClick={handleHeartClick}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition"
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <HeartIcon filled={favorited} loading={loading} />
        </button>
      )}
    </div>
  );
}
