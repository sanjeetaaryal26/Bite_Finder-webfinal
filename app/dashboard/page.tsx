"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../_component/sidebar";
import TrendingSection from "../_component/TrendingSection";
import MostSavedSection from "../_component/MostSavedSection";
import TopFoodSection from "../_component/TopFoodSection";
import RecommendedForYouSection from "../_component/RecommendedForYouSection";
import { useAuth } from "@/context/AuthContext";

const recentSearches = ["Momo", "Pizza", "Biryani", "Thakali Set"];

const trendingFoods = [
  { name: "Buff Momo", emoji: "🥟", query: "momo" },
  { name: "Margherita Pizza", emoji: "🍕", query: "pizza" },
  { name: "Chicken Biryani", emoji: "🍛", query: "biryani" },
  { name: "Newari Khaja", emoji: "🫙", query: "newari" },
];

export default function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("explore");

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) router.push(`/search?food=${encodeURIComponent(q)}`);
    else router.push("/search");
  };

  const mockUser = {
    name: user?.name ?? "Guest",
    location: "Explore",
    level: "Foodie Explorer",
    role: user?.role,
  };

  return (
    <div className="min-h-screen bg-orange-50" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}>
      <Sidebar activeTab={activeTab} onSelect={setActiveTab} user={mockUser} />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-orange-100 bg-white/80 px-8 py-4 backdrop-blur">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-orange-400">🔍</span>
            <input
              type="text"
              placeholder="Search for momo, pizza, biryani..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-xl border border-orange-200 bg-orange-50 py-2.5 pl-11 pr-4 text-sm text-gray-700 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            onClick={() => router.push("/nearby")}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
          >
            <span>📍</span> Near Me
          </button>
        </header>

        <div className="px-8 py-7 space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">
                Good day, {mockUser.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">What are you craving today?</p>
            </div>
          </div>

          {/* Recent Searches */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent Searches</p>
            <div className="flex gap-2 flex-wrap">
              {recentSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => router.push(`/search?food=${encodeURIComponent(s)}`)}
                  className="px-4 py-1.5 bg-white border border-orange-200 text-orange-600 text-sm font-medium rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Recommended For You (logged-in only) */}
          <RecommendedForYouSection />

          {/* Trending Foods */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">🔥 Search by food</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {trendingFoods.map((f) => (
                <button
                  key={f.name}
                  onClick={() => router.push(`/search?food=${encodeURIComponent(f.query)}`)}
                  className="group bg-white rounded-2xl p-4 border border-orange-100 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-100 transition text-left"
                >
                  <p className="text-3xl mb-2">{f.emoji}</p>
                  <p className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition">{f.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Now */}
          <TrendingSection />

          {/* Most Saved */}
          <MostSavedSection />

          {/* Top Food in District */}
          <TopFoodSection />

          {/* Map CTA */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-orange-200">
            <div>
              <h3 className="text-white font-extrabold text-lg">Explore on Map 🗺️</h3>
              <p className="text-orange-100 text-sm mt-1 max-w-sm">
                See nearby restaurants on an interactive map.
              </p>
              <button
                onClick={() => router.push("/nearby")}
                className="mt-4 px-5 py-2 bg-white text-orange-600 font-bold text-sm rounded-xl hover:bg-orange-50 transition shadow"
              >
                Open Map View
              </button>
            </div>
            <div className="text-7xl opacity-80 select-none">🗺️</div>
          </div>
        </div>
      </main>
    </div>
  );
}
