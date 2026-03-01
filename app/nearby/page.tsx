"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Sidebar from "../_component/sidebar";
import RestaurantCard from "../_component/RestaurantCard";
import { RestaurantCardSkeleton } from "../_component/Skeleton";
import { getNearbyRestaurants } from "@/lib/restaurants";
import type { Restaurant } from "@/types/restaurant";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const RestaurantMap = dynamic(() => import("../_component/RestaurantMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[400px] rounded-2xl border border-orange-200 bg-orange-100 flex items-center justify-center text-gray-500">
      Loading map…
    </div>
  ),
});

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 };
const DEFAULT_DISTANCE = 5000;

export default function NearbyPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const data = await getNearbyRestaurants({
        lat,
        lng,
        distance: DEFAULT_DISTANCE,
        limit: 30,
      });
      setRestaurants(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load nearby restaurants";
      toast.error(message);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported");
      setLocation(DEFAULT_CENTER);
      fetchNearby(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        setLocationError(null);
        fetchNearby(lat, lng);
      },
      () => {
        setLocationError("Could not get your location. Using default.");
        setLocation(DEFAULT_CENTER);
        fetchNearby(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      }
    );
  }, [fetchNearby]);

  const mockUser = { name: user?.name ?? "Guest", level: "Foodie", role: user?.role };

  return (
    <div className="min-h-screen bg-orange-50" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}>
      <Sidebar activeTab="nearby" user={mockUser} />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/80 px-8 py-4 backdrop-blur">
          <h1 className="text-xl font-extrabold text-gray-800">📍 Nearby Restaurants</h1>
          {locationError && (
            <p className="text-sm text-amber-600 mt-1">{locationError}</p>
          )}
        </header>

        <div className="px-8 py-7 space-y-6">
          {/* Map */}
          <div className="h-[400px] rounded-2xl overflow-hidden">
            <RestaurantMap
              restaurants={restaurants}
              center={location}
              selectedId={selectedRestaurant?._id ?? null}
              onSelectRestaurant={setSelectedRestaurant}
            />
          </div>

          {selectedRestaurant && (
            <div className="bg-white rounded-2xl border border-orange-200 p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{selectedRestaurant.name}</p>
                <p className="text-sm text-gray-500">
                  {selectedRestaurant.averageRating?.toFixed(1)} ★ · {selectedRestaurant.totalReviews} reviews
                </p>
              </div>
              <Link
                href={`/restaurants/${selectedRestaurant._id}`}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl"
              >
                View
              </Link>
            </div>
          )}

          {/* List */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              List
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <RestaurantCardSkeleton key={i} />
                ))}
              </div>
            ) : restaurants.length === 0 ? (
              <div className="bg-white rounded-2xl border border-orange-100 p-16 text-center">
                <p className="text-4xl mb-3">📍</p>
                <p className="text-gray-500">No restaurants found nearby.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((r) => (
                  <RestaurantCard key={r._id} restaurant={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
