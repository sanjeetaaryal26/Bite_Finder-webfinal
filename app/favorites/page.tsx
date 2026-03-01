"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../_component/sidebar";
import StarRating from "../_component/StarRating";
import { getFavorites, removeFavorite as apiRemoveFavorite, type FavoriteItem, getFoodFavorites, removeFoodFavorite as apiRemoveFoodFavorite } from "@/lib/favorites";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/context/ToastContext";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=240&fit=crop";
const getInitial = (value?: string | null, fallback = "R") =>
  (value?.trim()?.charAt(0)?.toUpperCase() || fallback);

function FavoriteCard({
  favorite,
  onRemove,
  removing,
}: {
  favorite: FavoriteItem;
  onRemove: () => void;
  removing: boolean;
}) {
  const restaurant = typeof favorite.restaurant === "object" ? favorite.restaurant : null;
  if (!restaurant) return null;
  const img = restaurant.images?.[0] || PLACEHOLDER_IMG;
  const restaurantInitial = getInitial(restaurant.name, "R");

  return (
    <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-xl hover:shadow-orange-100 hover:border-orange-300 transition group">
      <Link href={`/restaurants/${restaurant._id}`} className="block">
        <div className="aspect-[4/3] bg-orange-50 relative overflow-hidden">
          <img
            src={img}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <span className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-black/55 text-sm font-bold text-white shadow-sm">
            {restaurantInitial}
          </span>
        </div>
        <div className="p-5">
          <h3 className="font-bold text-gray-800 text-base group-hover:text-orange-600 transition">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <StarRating rating={restaurant.averageRating} showValue={true} size="sm" />
            <span className="text-xs text-gray-400">({restaurant.totalReviews} reviews)</span>
          </div>
        </div>
      </Link>
      <div className="px-5 pb-5 flex gap-2">
        <Link
          href={`/restaurants/${restaurant._id}`}
          className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl text-center transition"
        >
          View
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          disabled={removing}
          className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold rounded-xl transition disabled:opacity-50"
        >
          {removing ? "…" : "Remove"}
        </button>
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { removeFavorite: contextRemoveFavorite } = useFavorites();
  const toast = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [foodFavorites, setFoodFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const totalSavedCount = favorites.length + foodFavorites.length;

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    Promise.all([getFavorites(), getFoodFavorites()])
      .then(([rests, foods]) => {
        setFavorites(rests || []);
        setFoodFavorites(foods || []);
      })
      .catch(() => {
        toast.error("Failed to load favorites");
        setFavorites([]);
        setFoodFavorites([]);
      })
      .finally(() => setLoading(false));
  }, [user, router, toast]);

  const handleRemove = (restaurantId: string) => {
    setRemovingId(restaurantId);
    setFavorites((prev) => prev.filter((f) => {
      const r = typeof f.restaurant === "object" ? f.restaurant?._id : f.restaurant;
      return r !== restaurantId;
    }));
    contextRemoveFavorite(restaurantId)
      .catch(() => {
        getFavorites().then(setFavorites);
      })
      .finally(() => setRemovingId(null));
  };

  const mockUser = { name: user?.name ?? "Guest", level: "Foodie", role: user?.role };

  if (!user) return null;

  return (
    <div
      className="min-h-screen bg-orange-50"
      style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}
    >
      <Sidebar activeTab="favorites" user={mockUser} />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 py-4 shadow-sm shadow-orange-50">
            <div>
              <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                🔖 My Favorites
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {totalSavedCount} total saved - {favorites.length} restaurant{favorites.length !== 1 ? "s" : ""} - {foodFavorites.length} food{foodFavorites.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-6xl px-8 py-7 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg
                className="animate-spin h-10 w-10 text-orange-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : favorites.length === 0 && foodFavorites.length === 0 ? (
            <div className="bg-white rounded-2xl border border-orange-100 p-16 text-center">
              <p className="text-6xl mb-4">🍕</p>
              <h3 className="text-lg font-bold text-gray-700 mb-1">You haven&apos;t saved any restaurants yet</h3>
              <p className="text-sm text-gray-400 mb-5">
                Start exploring and tap the heart on restaurants you love!
              </p>
              <Link
                href="/restaurants"
                className="inline-block px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md shadow-orange-200 transition"
              >
                Explore Restaurants
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {favorites.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Saved Restaurants</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {favorites.map((fav) => {
                      const restaurant = typeof fav.restaurant === "object" ? fav.restaurant : null;
                      const id = restaurant?._id;
                      if (!id) return null;
                      return (
                        <FavoriteCard
                          key={fav._id}
                          favorite={fav}
                          onRemove={() => handleRemove(id)}
                          removing={removingId === id}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {foodFavorites.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Saved Foods</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foodFavorites.map((f) => {
                      const restaurant = f.restaurant || null;
                      const food = f.food || null;
                      const key = `${f.favoriteId ?? f._id}-${String(f.food?._id ?? f.foodId)}`;
                      const foodInitial = getInitial(food?.name || restaurant?.name, "F");
                      return (
                        <div key={key} className="bg-white rounded-2xl border border-orange-100 p-4 hover:shadow-lg transition group">
                          <Link href={`/restaurants/${restaurant?._id}`} className="block">
                            <div className="aspect-[4/3] bg-orange-50 relative overflow-hidden">
                              <img
                                src={food?.image || restaurant?.image || restaurant?.images?.[0] || PLACEHOLDER_IMG}
                                alt={food?.name || restaurant?.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                              <span className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-black/55 text-sm font-bold text-white shadow-sm">
                                {foodInitial}
                              </span>
                            </div>
                            <div className="p-4">
                              <p className="font-bold text-gray-800 text-sm truncate">{food?.name ?? 'Food'}</p>
                              <p className="text-xs text-gray-500">{food?.category ?? ''}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-sm font-semibold text-orange-600">NPR {(typeof food?.price === 'number' ? food.price : Number(food?.price) || 0).toFixed(2)}</p>
                                <p className="text-xs text-gray-500">{restaurant?.district ?? ''}</p>
                              </div>
                            </div>
                          </Link>
                          <div className="px-4 pb-4 pt-0 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                // optimistic remove
                                const prev = foodFavorites;
                                setFoodFavorites((s) => s.filter((it) => (it.favoriteId ?? it._id) !== (f.favoriteId ?? f._id)));
                                (async () => {
                                  try {
                                    await apiRemoveFoodFavorite(String(restaurant?._id), String(food?._id ?? f.foodId));
                                    toast.success('Removed');
                                  } catch (err) {
                                    setFoodFavorites(prev);
                                    toast.error('Failed to remove');
                                  }
                                })();
                              }}
                              className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold rounded-xl transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
