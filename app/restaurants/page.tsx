"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../_component/sidebar";
import RestaurantCard from "../_component/RestaurantCard";
import { RestaurantCardSkeleton } from "../_component/Skeleton";
import FilterSidebar, { type RestaurantFilters } from "../_component/FilterSidebar";
import { filterRestaurants } from "@/lib/restaurants";
import type { Restaurant } from "@/types/restaurant";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function RestaurantsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFilters: RestaurantFilters = useMemo(() => {
    const sp = searchParams;
    const minRating = sp.get("minRating");
    const minPrice = sp.get("minPrice");
    const maxPrice = sp.get("maxPrice");
    const district = sp.get("district") as RestaurantFilters["district"] | null;
    const address = sp.get("address");
    const sort = (sp.get("sort") as RestaurantFilters["sort"]) ?? "";
    return {
      minRating: minRating ? Number(minRating) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      district: (district || "") as RestaurantFilters["district"],
      address: address || undefined,
      sort: sort || "",
    };
  }, [searchParams]);

  const initialPage = useMemo(() => {
    const p = searchParams.get("page");
    const num = p ? Number(p) : 1;
    return Number.isNaN(num) || num < 1 ? 1 : num;
  }, [searchParams]);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<RestaurantFilters>(initialFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleFiltersChange = (next: RestaurantFilters) => {
    setError(null);
    setGeoError(null);
    // If switching to nearest and we don't have location yet, request it
    if (next.sort === "nearest" && filters.sort !== "nearest" && !location && typeof window !== "undefined") {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setFilters(next);
          setPage(1);
        },
        () => {
          setGeoError("Location permission denied. Cannot sort by nearest.");
          toast.error("Location permission denied");
          // Keep previous sort
        }
      );
    } else {
      setFilters(next);
      setPage(1);
    }
  };

  const handleReset = () => {
    setFilters({});
    setPage(1);
    setGeoError(null);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.minRating != null) params.set("minRating", String(filters.minRating));
    if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
    if (filters.district) params.set("district", filters.district);
    if (filters.address) params.set("address", filters.address);
    if (filters.sort) params.set("sort", filters.sort);
    if (page > 1) params.set("page", String(page));
    if (filters.sort === "nearest" && location) {
      params.set("lat", String(location.lat));
      params.set("lng", String(location.lng));
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }, [filters, page, location, router]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await filterRestaurants({
          page,
          limit: 12,
          minRating: filters.minRating,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          district: filters.district || undefined,
          address: filters.address || undefined,
          sort: filters.sort || undefined,
          lat: filters.sort === "nearest" && location ? location.lat : undefined,
          lng: filters.sort === "nearest" && location ? location.lng : undefined,
        });
        setRestaurants(res.data);
        setTotal(res.total);
        setTotalPages(Math.max(1, Math.ceil(res.total / 12)));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load restaurants";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    // If sort=nearest but we don't have location (and user denied), don't fetch
    if (filters.sort === "nearest" && !location) {
      setLoading(false);
      return;
    }
    fetch();
  }, [filters, page, location, toast]);

  const mockUser = {
    name: user?.name ?? "Guest",
    level: "Foodie",
    role: user?.role,
  };

  const hasActiveFilters =
    !!filters.minRating || !!filters.minPrice || !!filters.maxPrice || !!filters.district || !!filters.address || !!filters.sort;

  const activeTags: { label: string; key: keyof RestaurantFilters }[] = [];
  if (filters.minRating != null) activeTags.push({ label: `Rating ≥ ${filters.minRating}`, key: "minRating" });
  if (filters.minPrice != null) activeTags.push({ label: `Min price ${filters.minPrice}`, key: "minPrice" });
  if (filters.maxPrice != null) activeTags.push({ label: `Max price ${filters.maxPrice}`, key: "maxPrice" });
  if (filters.district) activeTags.push({ label: filters.district, key: "district" });
  if (filters.address) activeTags.push({ label: `Address: ${filters.address}`, key: "address" });
  if (filters.sort === "highestRated") activeTags.push({ label: "Highest Rated", key: "sort" });
  if (filters.sort === "mostReviewed") activeTags.push({ label: "Most Reviewed", key: "sort" });
  if (filters.sort === "nearest") activeTags.push({ label: "Nearest", key: "sort" });

  return (
    <div className="min-h-screen bg-orange-50" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}>
      <Sidebar activeTab="restaurants" onSelect={() => {}} user={mockUser} />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-orange-100 bg-white/80 px-4 md:px-8 py-4 backdrop-blur">
          <h1 className="text-xl font-extrabold text-gray-800">🍽 Restaurants</h1>
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-gray-700"
          >
            <span>🔍</span> Filters
          </button>
        </header>

        <div className="px-4 md:px-8 py-7">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          {geoError && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              {geoError}
            </div>
          )}

          <div className="flex gap-6">
            {/* Desktop sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <FilterSidebar filters={filters} onChange={handleFiltersChange} onReset={handleReset} />
            </aside>

            <div className="flex-1 space-y-4">
              {/* Active filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {activeTags.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => {
                        const next = { ...filters };
                        if (tag.key === "minRating") next.minRating = undefined;
                        if (tag.key === "minPrice") next.minPrice = undefined;
                        if (tag.key === "maxPrice") next.maxPrice = undefined;
                        if (tag.key === "district") next.district = "";
                        if (tag.key === "address") next.address = undefined;
                        if (tag.key === "sort") next.sort = "";
                        setFilters(next);
                        setPage(1);
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs text-orange-700"
                    >
                      <span>{tag.label}</span>
                      <span className="text-orange-400">×</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="ml-1 text-xs font-semibold text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Results */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <RestaurantCardSkeleton key={i} />
                  ))}
                </div>
              ) : restaurants.length === 0 ? (
                <div className="bg-white rounded-2xl border border-orange-100 p-16 text-center">
                  <p className="text-4xl mb-3">🍕</p>
                  <p className="text-gray-500">No restaurants match your filters.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{total} restaurant{total !== 1 ? "s" : ""} found</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map((r) => (
                      <RestaurantCard key={r._id} restaurant={r} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-xl border border-orange-200 bg-white text-orange-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-600">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-xl border border-orange-200 bg-white text-orange-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile filter modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end md:hidden">
            <div className="w-full bg-white rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-extrabold text-gray-800">Filters</h2>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              <FilterSidebar filters={filters} onChange={handleFiltersChange} onReset={handleReset} />
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
              >
                Apply filters
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
