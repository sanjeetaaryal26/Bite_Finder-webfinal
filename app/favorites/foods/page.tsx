"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../_component/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getFoodFavorites, removeFoodFavorite } from "@/lib/favorites";
import { RestaurantCardSkeleton } from "../../_component/Skeleton";
import Link from "next/link";

const getInitial = (value?: string | null, fallback = "F") =>
  value?.trim()?.charAt(0)?.toUpperCase() || fallback;

type FavItem = {
  favoriteId: string;
  restaurant: { _id: string; name?: string; district?: string; image?: string } | null;
  food: { _id?: string | null; name?: string; price?: number; image?: string; category?: string } | null;
  savedAt?: string | Date | null;
  restaurantRaw?: any;
  foodIdRaw?: any;
};

export default function FavoriteFoodsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<FavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getFoodFavorites();
        const normalized: FavItem[] = data.map((d: any) => {
          if (d && (d.favoriteId || d.savedAt)) {
            return {
              favoriteId: d.favoriteId || d._id,
              restaurant: d.restaurant || null,
              food: d.food || null,
              savedAt: d.savedAt || d.createdAt || null,
              restaurantRaw: d.restaurant,
              foodIdRaw: d.food?._id ?? d.foodId,
            };
          }

          return {
            favoriteId: d._id || `${d.restaurant?._id}-${d.foodId}`,
            restaurant: d.restaurant || null,
            food: d.food || null,
            savedAt: d.createdAt || null,
            restaurantRaw: d.restaurant,
            foodIdRaw: d.foodId,
          };
        });
        setItems(normalized);
      } catch {
        toast.error("Failed to load saved foods");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const handleRemove = async (item: FavItem) => {
    if (!user) {
      toast.error("Please log in");
      return;
    }

    const restaurantId = item.restaurant?._id ?? item.restaurantRaw?._id;
    const foodId = item.food?._id ?? item.foodIdRaw;
    if (!restaurantId || !foodId) {
      toast.error("Cannot remove: missing ids");
      return;
    }

    const prev = items;
    setItems((current) => current.filter((it) => it.favoriteId !== item.favoriteId));
    try {
      await removeFoodFavorite(String(restaurantId), String(foodId));
      toast.success("Removed from favorites");
    } catch {
      setItems(prev);
      toast.error("Failed to remove");
    }
  };

  const mockUser = { name: user?.name ?? "Guest", level: "Foodie", role: user?.role };

  return (
    <div className="min-h-screen bg-orange-50" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}>
      <Sidebar activeTab="favorites" user={mockUser} />

      <main className="ml-64 min-h-screen px-8 py-8">
        <h1 className="mb-4 text-2xl font-extrabold">Saved Foods</h1>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <RestaurantCardSkeleton />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center">
            <p className="text-lg font-semibold text-gray-700">You have not saved any foods yet.</p>
            <p className="mt-2 text-gray-500">Browse restaurants and save dishes to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const initial = getInitial(item.food?.name || item.restaurant?.name, "F");
              const image = item.food?.image || item.restaurant?.image || "";
              const price =
                typeof item.food?.price === "number"
                  ? item.food.price
                  : Number(item.food?.price) || 0;

              return (
                <div
                  key={item.favoriteId}
                  className="transform rounded-2xl border border-orange-100 bg-white p-4 transition-all duration-150 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative mb-3 h-40 overflow-hidden rounded-xl bg-orange-50">
                    {image ? (
                      <img
                        src={image}
                        alt={item.food?.name || item.restaurant?.name || "Food"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl text-orange-300">
                        F
                      </div>
                    )}
                    <span className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-black/55 text-sm font-bold text-white shadow-sm">
                      {initial}
                    </span>
                  </div>

                  <div className="mb-2 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 truncate text-sm font-bold text-gray-800">{item.food?.name ?? "Food"}</p>
                      <p className="truncate text-xs text-gray-500">{item.food?.category ?? ""}</p>
                    </div>
                      <div className="ml-4 text-right">
                      <p className="text-sm font-semibold text-orange-600">NPR {price.toFixed(2)}</p>
                      <button
                        onClick={() => handleRemove(item)}
                        className="mt-2 rounded-full p-2 text-red-500 hover:bg-red-50"
                        aria-label="Remove favorite"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <Link href={`/restaurants/${item.restaurant?._id}`} className="truncate">
                      {item.restaurant?.name ?? "Restaurant"}
                    </Link>
                    <span>{item.restaurant?.district ?? ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
