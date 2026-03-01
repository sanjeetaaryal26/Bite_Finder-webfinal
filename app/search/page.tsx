"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Sidebar from "../_component/sidebar";
import RestaurantCard from "../_component/RestaurantCard";
import { RestaurantCardSkeleton } from "../_component/Skeleton";
import { searchRestaurants } from "@/lib/restaurants";
import type { Restaurant } from "@/types/restaurant";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const DEFAULT_CENTER: [number, number] = [27.7172, 85.324];
const DEFAULT_ZOOM = 12;
const RESULT_ZOOM = 14;
const SEARCH_LIMIT = 24;
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=480&h=280&fit=crop";
const CLEAN_MAP_TILE_URL = "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
const CLEAN_MAP_ATTRIBUTION = "&copy; OpenStreetMap contributors &copy; CARTO";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [32, 52],
  iconAnchor: [16, 52],
  popupAnchor: [1, -44],
  shadowSize: [52, 52],
});

type SearchRestaurant = Restaurant & {
  rating?: number;
  image?: string | null;
};

type ApiSearchRestaurant = Partial<SearchRestaurant> & {
  _id?: string;
};

function MapViewportSync({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);

  return null;
}

function normalizeRestaurant(raw: ApiSearchRestaurant): SearchRestaurant | null {
  const id = raw._id ? String(raw._id) : "";
  const coordinates = raw.location?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    console.debug("[search-map] skipping restaurant with missing location", {
      id,
      coordinates,
    });
    return null;
  }

  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    console.debug("[search-map] skipping restaurant with invalid coordinates", {
      id,
      coordinates,
    });
    return null;
  }

  console.debug("[search-map] api [lng, lat] -> leaflet [lat, lng]", {
    id,
    api: [lng, lat],
    leaflet: [lat, lng],
  });

  const rating =
    typeof raw.rating === "number"
      ? raw.rating
      : typeof raw.averageRating === "number"
        ? raw.averageRating
        : 0;

  const imageFromArray =
    Array.isArray(raw.images) && raw.images.length > 0 ? raw.images[0] : null;
  const primaryImage = raw.image ?? imageFromArray ?? null;

  return {
    _id: id,
    name: raw.name?.trim() || "Unnamed restaurant",
    description: raw.description ?? "",
    address: raw.address ?? "",
    district: raw.district,
    location: {
      type: "Point",
      coordinates: [lng, lat],
    },
    foods: Array.isArray(raw.foods) ? raw.foods : [],
    averageRating: rating,
    rating,
    totalReviews: typeof raw.totalReviews === "number" ? raw.totalReviews : 0,
    totalFavorites: typeof raw.totalFavorites === "number" ? raw.totalFavorites : 0,
    images: primaryImage ? [primaryImage] : [],
    image: primaryImage,
    createdBy: raw.createdBy,
    createdAt: raw.createdAt,
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();

  const initialFood = searchParams.get("food") ?? "";
  const [searchInput, setSearchInput] = useState(initialFood);
  const [query, setQuery] = useState(initialFood);
  const [restaurants, setRestaurants] = useState<SearchRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(Boolean(initialFood));
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  const executeSearch = useCallback(
    async (foodInput: string) => {
      const food = foodInput.trim();
      if (!food) {
        toast.error("Enter a food name to search.");
        return;
      }

      setLoading(true);
      setSearched(true);
      setQuery(food);

      try {
        const response = await searchRestaurants({ food, limit: SEARCH_LIMIT });
        const rawList = Array.isArray(response?.restaurants)
          ? (response.restaurants as ApiSearchRestaurant[])
          : [];

        const normalized = rawList
          .map((restaurant) => normalizeRestaurant(restaurant))
          .filter((restaurant): restaurant is SearchRestaurant => restaurant !== null);

        setRestaurants(normalized);

        if (normalized.length > 0) {
          const [lng, lat] = normalized[0].location.coordinates;
          setMapCenter([lat, lng]);
          setMapZoom(RESULT_ZOOM);
        } else {
          setMapCenter(DEFAULT_CENTER);
          setMapZoom(DEFAULT_ZOOM);
          toast.toast("No restaurants found.");
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Search failed";
        toast.error(message);
        setRestaurants([]);
        setMapCenter(DEFAULT_CENTER);
        setMapZoom(DEFAULT_ZOOM);
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!initialFood) return;
    setSearchInput(initialFood);
    void executeSearch(initialFood);
  }, [initialFood, executeSearch]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void executeSearch(searchInput);
  };

  const mockUser = { name: user?.name ?? "Guest", level: "Foodie", role: user?.role };

  return (
    <div
      className="min-h-screen bg-orange-50"
      style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}
    >
      <Sidebar activeTab="search" user={mockUser} />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/80 px-8 py-4 backdrop-blur">
          <h1 className="mb-4 text-xl font-extrabold text-gray-800">Food Search</h1>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search for pizza, momo, biryani..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </header>

        <div className="px-8 py-7">
          <div className="mb-6">
            <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white">
              <div className="relative h-[420px]">
                {loading && (
                  <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/60">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-300 border-t-orange-500" />
                  </div>
                )}

                <MapContainer
                  center={DEFAULT_CENTER}
                  zoom={DEFAULT_ZOOM}
                  style={{ height: "100%", width: "100%" }}
                >
                  <MapViewportSync center={mapCenter} zoom={mapZoom} />
                  <TileLayer
                    attribution={CLEAN_MAP_ATTRIBUTION}
                    url={CLEAN_MAP_TILE_URL}
                  />

                  {restaurants.map((restaurant) => {
                    const [lng, lat] = restaurant.location.coordinates;
                    const position: [number, number] = [lat, lng];
                    const rating =
                      typeof restaurant.rating === "number"
                        ? restaurant.rating
                        : restaurant.averageRating;
                    const imageUrl =
                      restaurant.image ?? restaurant.images?.[0] ?? PLACEHOLDER_IMAGE;

                    return (
                      <Marker key={restaurant._id} position={position} icon={markerIcon}>
                        <Popup>
                          <div className="w-60">
                            <div className="mb-2 h-28 w-full overflow-hidden rounded-md bg-gray-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imageUrl}
                                alt={restaurant.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <h4 className="mb-1 text-sm font-bold">{restaurant.name}</h4>
                            <div className="mb-2 text-xs text-gray-500">
                              Rating: {rating.toFixed(1)}
                            </div>
                            <Link
                              href={`/restaurants/${restaurant._id}`}
                              className="inline-block w-full rounded-md bg-orange-500 px-3 py-2 text-center text-sm text-white hover:bg-orange-600"
                            >
                              View Details
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>

          {query && <p className="mb-4 text-sm text-gray-500">Results for &quot;{query}&quot;</p>}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <RestaurantCardSkeleton key={index} />
              ))}
            </div>
          ) : !searched ? (
            <div className="rounded-2xl border border-orange-100 bg-white p-16 text-center">
              <p className="font-medium text-gray-600">Search by food name</p>
              <p className="mt-1 text-sm text-gray-400">
                Examples: pizza, momo, biryani, thakali
              </p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="rounded-2xl border border-orange-100 bg-white p-16 text-center">
              <h3 className="mb-1 text-lg font-bold text-gray-700">No restaurants found</h3>
              <p className="mb-4 text-sm text-gray-400">
                Try a different food name or browse all restaurants.
              </p>
              <Link
                href="/restaurants"
                className="inline-block rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
              >
                View all restaurants
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
