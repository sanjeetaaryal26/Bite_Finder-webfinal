"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminStats,
  getAdminUsers,
  getAdminRestaurants,
  deleteAdminUser,
  deleteAdminRestaurant,
  updateAdminRestaurant,
  addAdminRestaurantFood,
  updateAdminRestaurantFood,
  type AdminStats as AdminStatsType,
  type AdminUser,
  type AdminRestaurant,
} from "@/lib/admin";
import { getRestaurantById } from '@/lib/restaurants';
import type { Restaurant } from '@/types/restaurant';
import ConfirmModal from "../_component/ConfirmModal";
import ImageUpload from "../_component/ImageUpload";
import { getAdminAnalytics, type TimeSeriesPoint } from "@/lib/admin";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const ADMIN_NAV = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "restaurants", label: "Restaurants", icon: "🍽" },
  { id: "reviews", label: "Reviews", icon: "✍️" },
];

const DISTRICTS = ["Kathmandu", "Lalitpur", "Bhaktapur"] as const;
type FoodEditDraft = { name: string; price: number; category?: string; image?: string; rating?: number };
type NewFoodDraft = { name: string; price: number; category: string; image: string; rating: number };

function StatCard({
  label,
  value,
  icon,
}: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <span className="text-3xl opacity-80" aria-hidden>{icon}</span>
      </div>
    </div>
  );
}

function OverviewSection({ stats, loading }: { stats: AdminStatsType | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-orange-100 bg-white p-6 animate-pulse">
            <div className="h-4 w-24 bg-orange-100 rounded mb-3" />
            <div className="h-8 w-16 bg-orange-100 rounded" />
          </div>
        ))}
      </div>
    );
  }
  if (!stats) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
      <StatCard label="Total Restaurants" value={stats.totalRestaurants} icon="🍽" />
      <StatCard label="Total Reviews" value={stats.totalReviews} icon="⭐" />
      <StatCard label="Total Favorites" value={stats.totalFavorites} icon="❤️" />
      {stats.topDistrict && (
        <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-orange-100 bg-white p-4">
          <p className="text-sm text-gray-500">Top district</p>
          <p className="font-semibold text-gray-900">{stats.topDistrict.name} ({stats.topDistrict.count} restaurants)</p>
        </div>
      )}
    </div>
  );
}

function AnalyticsSection() {
  const [period, setPeriod] = useState<'7d' | '28d' | '90d'>('28d');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TimeSeriesPoint[]>([]);
  const [restaurants, setRestaurants] = useState<TimeSeriesPoint[]>([]);
  const [reviews, setReviews] = useState<TimeSeriesPoint[]>([]);
  const [favorites, setFavorites] = useState<TimeSeriesPoint[]>([]);

  const load = useCallback(async (p: '7d' | '28d' | '90d') => {
    setLoading(true);
    try {
      const data = await getAdminAnalytics(p);
      setUsers(data.users || []);
      setRestaurants(data.restaurants || []);
      setReviews(data.reviews || []);
      setFavorites(data.favorites || []);
    } catch {
      setUsers([]);
      setRestaurants([]);
      setReviews([]);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(period); }, [period, load]);

  const ChartCard = ({ title, data, color }: { title: string; data: TimeSeriesPoint[]; color?: string }) => (
    <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={color || '#f97316'} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Activity (by day)</h3>
        <div className="flex items-center gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value as "7d" | "28d" | "90d")} className="rounded-xl border px-3 py-1 text-sm">
            <option value="7d">Last 7 Days</option>
            <option value="28d">Last 28 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-56 bg-orange-100 animate-pulse rounded" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="New Users" data={users} color="#2563eb" />
          <ChartCard title="New Restaurants" data={restaurants} color="#059669" />
          <ChartCard title="New Reviews" data={reviews} color="#f97316" />
          <ChartCard title="New Favorites" data={favorites} color="#ef4444" />
        </div>
      )}
    </div>
  );
}

function UsersTable({
  users,
  loading,
  onDelete,
}: {
  users: AdminUser[];
  loading: boolean;
  onDelete: (user: AdminUser) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white overflow-hidden">
        <div className="animate-pulse p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-orange-100 rounded" />
          ))}
        </div>
      </div>
    );
  }
  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center text-gray-500">
        No users found.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-orange-100 bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-orange-100 bg-orange-50/50">
              <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-700 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-orange-50 hover:bg-orange-50/30">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(u)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RestaurantsTable({
  restaurants,
  loading,
  onDelete,
  onEdit,
}: {
  restaurants: AdminRestaurant[];
  loading: boolean;
  onDelete: (r: AdminRestaurant) => void;
  onEdit: (r: AdminRestaurant) => void;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white overflow-hidden">
        <div className="animate-pulse p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-orange-100 rounded" />
          ))}
        </div>
      </div>
    );
  }
  if (restaurants.length === 0) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center text-gray-500">
        No restaurants found.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-orange-100 bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-orange-100 bg-orange-50/50">
              <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-700">District</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Rating</th>
              <th className="px-4 py-3 font-semibold text-gray-700 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r._id} className="border-b border-orange-50 hover:bg-orange-50/30">
                <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                <td className="px-4 py-3 text-gray-600">{r.district ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{Number(r.averageRating).toFixed(1)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(r)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading, checkAuth } = useAuth();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState<AdminStatsType | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    type: "user" | "restaurant" | null;
    item: AdminUser | AdminRestaurant | null;
    loading: boolean;
  }>({ open: false, type: null, item: null, loading: false });

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await getAdminUsers({ page: 1, limit: 50 });
      setUsers(data.users);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadRestaurants = useCallback(async () => {
    setRestaurantsLoading(true);
    try {
      const data = await getAdminRestaurants({ page: 1, limit: 50 });
      setRestaurants(data.restaurants);
    } catch {
      setRestaurants([]);
    } finally {
      setRestaurantsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      checkAuth().then((u) => {
        if (!u || u.role !== "admin") {
          setVerified(false);
          window.location.href = "/login";
        } else {
          setVerified(true);
        }
      });
      return;
    }
    if (user.role !== "admin") {
      setVerified(false);
      window.location.href = "/dashboard";
      return;
    }
    setVerified(true);
  }, [user, authLoading, checkAuth]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    loadStats();
  }, [user?.role, loadStats]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    if (tab === "users") loadUsers();
  }, [user?.role, tab, loadUsers]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    if (tab === "restaurants") loadRestaurants();
  }, [user?.role, tab, loadRestaurants]);

  const handleDeleteUser = (u: AdminUser) => {
    setConfirm({ open: true, type: "user", item: u, loading: false });
  };

  const handleDeleteRestaurant = (r: AdminRestaurant) => {
    setConfirm({ open: true, type: "restaurant", item: r, loading: false });
  };

  const handleConfirmDelete = async () => {
    if (!confirm.item || !confirm.type) return;
    setConfirm((c) => ({ ...c, loading: true }));
    try {
      if (confirm.type === "user") {
        await deleteAdminUser(confirm.item._id);
        setUsers((prev) => prev.filter((u) => u._id !== confirm.item!._id));
        if (stats) setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
      } else {
        await deleteAdminRestaurant(confirm.item._id);
        setRestaurants((prev) => prev.filter((r) => r._id !== confirm.item!._id));
        if (stats) setStats({ ...stats, totalRestaurants: stats.totalRestaurants - 1 });
      }
      setConfirm({ open: false, type: null, item: null, loading: false });
    } catch {
      setConfirm((c) => ({ ...c, loading: false }));
    }
  };

  // Editing restaurant + foods
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [foodEditId, setFoodEditId] = useState<string | null>(null);
  const [foodEdits, setFoodEdits] = useState<Record<string, FoodEditDraft>>({});
  const [addingFood, setAddingFood] = useState(false);
  const [newFood, setNewFood] = useState<NewFoodDraft>({
    name: "",
    price: 0,
    category: "",
    image: "",
    rating: 0,
  });

  const buildFoodEdits = (restaurant: Restaurant) => {
    const map: Record<string, FoodEditDraft> = {};
    (restaurant.foods || []).forEach((food, index) => {
      // Use stable fallback index when legacy food rows have no id fields.
      const id = food._id || food.id || String(index);
      map[String(id)] = {
        name: food.name || "",
        price: Number(food.price) || 0,
        category: food.category || "",
        image: food.image || "",
        rating: Number(food.rating) || 0,
      };
    });
    setFoodEdits(map);
  };

  const handleEditRestaurant = async (r: AdminRestaurant) => {
    try {
      setEditingLoading(true);
      setEditError(null);
      const full = await getRestaurantById(r._id);
      setEditingRestaurant(full);
      buildFoodEdits(full);
    } catch {
      setEditingRestaurant(null);
      setFoodEdits({});
      setEditError("Failed to load restaurant details.");
    } finally {
      setEditingLoading(false);
    }
  };

  const closeEdit = () => {
    setEditingRestaurant(null);
    setFoodEditId(null);
    setFoodEdits({});
    setEditError(null);
    setNewFood({ name: "", price: 0, category: "", image: "", rating: 0 });
  };

  const saveRestaurantChanges = async () => {
    if (!editingRestaurant) return;
    const coordinates = editingRestaurant.location?.coordinates;
    const hasCoordinates = Array.isArray(coordinates) && coordinates.length === 2;
    const lng = hasCoordinates ? Number(coordinates[0]) : NaN;
    const lat = hasCoordinates ? Number(coordinates[1]) : NaN;

    if (!editingRestaurant.name?.trim()) {
      setEditError("Restaurant name is required.");
      return;
    }

    const oneCoordinateProvided =
      hasCoordinates &&
      ((coordinates?.[0] !== undefined && String(coordinates[0]).trim() !== "") ||
        (coordinates?.[1] !== undefined && String(coordinates[1]).trim() !== ""));
    const bothCoordinatesValid = Number.isFinite(lng) && Number.isFinite(lat);
    if (oneCoordinateProvided && !bothCoordinatesValid) {
      setEditError("Longitude and latitude must both be valid numbers.");
      return;
    }

    const payload: {
      name?: string;
      district?: "Kathmandu" | "Lalitpur" | "Bhaktapur" | "";
      address?: string;
      description?: string;
      location?: { coordinates: [number, number] };
      images?: string[];
    } = {
      name: editingRestaurant.name.trim(),
      district: editingRestaurant.district || "",
      address: editingRestaurant.address || "",
      description: editingRestaurant.description || "",
      images: Array.isArray(editingRestaurant.images) ? editingRestaurant.images : [],
    };

    if (bothCoordinatesValid) {
      payload.location = { coordinates: [lng, lat] };
    }

    try {
      setEditingLoading(true);
      setEditError(null);
      const updated = await updateAdminRestaurant(editingRestaurant._id, payload);
      setRestaurants((prev) =>
        prev.map((restaurant) =>
          restaurant._id === updated._id
            ? { ...restaurant, name: updated.name, district: updated.district }
            : restaurant
        )
      );
      closeEdit();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save restaurant changes.";
      setEditError(message);
    } finally {
      setEditingLoading(false);
    }
  };

  const saveFoodEdits = async (foodId: string) => {
    if (!editingRestaurant) return;
    const payload = foodEdits[String(foodId)];
    if (!payload?.name?.trim()) {
      setEditError("Food name is required.");
      return;
    }
    try {
      setEditingLoading(true);
      setEditError(null);
      await updateAdminRestaurantFood(editingRestaurant._id, String(foodId), {
        name: payload.name,
        price: payload.price,
        category: payload.category,
        image: payload.image,
        rating: Number(payload.rating) || 0,
      });
      const refreshed = await getRestaurantById(editingRestaurant._id);
      setEditingRestaurant(refreshed);
      buildFoodEdits(refreshed);
      setFoodEditId(null);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save food changes.";
      setEditError(message);
    } finally {
      setEditingLoading(false);
    }
  };

  const addFoodToRestaurant = async () => {
    if (!editingRestaurant) return;
    if (!newFood.name.trim()) {
      setEditError("New food name is required.");
      return;
    }
    try {
      setAddingFood(true);
      setEditError(null);
      const updated = await addAdminRestaurantFood(editingRestaurant._id, {
        name: newFood.name.trim(),
        price: Number(newFood.price) || 0,
        category: newFood.category || undefined,
        image: newFood.image || undefined,
        rating: Number(newFood.rating) || 0,
      });
      setEditingRestaurant(updated);
      buildFoodEdits(updated);
      setNewFood({ name: "", price: 0, category: "", image: "", rating: 0 });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to add food.";
      setEditError(message);
    } finally {
      setAddingFood(false);
    }
  };

  const showSpinner = authLoading || verified === false || (user != null && user.role !== "admin") || (user == null && verified !== true);
  if (showSpinner) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 border-r border-orange-100 bg-white shadow-sm z-10">
        <div className="flex items-center gap-2 px-5 py-5 text-gray-700 border-b border-orange-100">
          <Link href="/dashboard" className="text-xl font-bold text-gray-800">
            Bite<span className="text-orange-500">Finder</span>
          </Link>
          <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
            Admin
          </span>
        </div>
        <nav className="p-3 space-y-1">
          {ADMIN_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-medium transition ${
                tab === item.id
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 text-gray-500 left-4 right-4">
          <Link
            href="/dashboard"
            className="block text-center rounded-xl border border-orange-200 py-2 text-sm font-medium hover:bg-orange-50"
          >
            ← Back to app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/90 backdrop-blur px-8 py-4">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {tab === "overview" && "Overview"}
            {tab === "users" && "Manage users"}
            {tab === "restaurants" && "Manage restaurants"}
            {tab === "reviews" && "Reviews"}
          </p>
        </header>

        <div className="p-6 md:p-8">
          {tab === "overview" && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
              <OverviewSection stats={stats} loading={statsLoading} />
              <div className="mt-8">
                <AnalyticsSection />
              </div>
            </section>
          )}

          {tab === "users" && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Users</h2>
              <UsersTable users={users} loading={usersLoading} onDelete={handleDeleteUser} />
            </section>
          )}

          {tab === "restaurants" && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Restaurants</h2>
              <RestaurantsTable
                restaurants={restaurants}
                loading={restaurantsLoading}
                onDelete={handleDeleteRestaurant}
                onEdit={handleEditRestaurant}
              />
            </section>
          )}

          {editingRestaurant && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={closeEdit} />
              <div className="relative z-10 w-full max-w-4xl rounded-lg bg-white p-6 shadow-2xl overflow-auto max-h-[90vh]">
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Edit Restaurant</h3>
                    <p className="text-sm text-gray-500 mt-1">ID: <span className="font-mono text-xs text-gray-400">{editingRestaurant._id}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={closeEdit} aria-label="Close" className="rounded-md p-2 hover:bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 011.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10 3.636 5.05A1 1 0 015.05 3.636L10 8.586z" clipRule="evenodd"/></svg>
                    </button>
                  </div>
                </header>

                {editError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {editError}
                  </div>
                )}

                <section className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant name</label>
                      <input
                        value={editingRestaurant.name || ""}
                        onChange={(e) =>
                          setEditingRestaurant((r) => (r ? { ...r, name: e.target.value } : r))
                        }
                        className="w-full rounded-lg text-gray-500 border px-3 py-2 shadow-sm focus:ring-2 focus:ring-orange-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <select
                        value={editingRestaurant.district || ""}
                        onChange={(e) =>
                          setEditingRestaurant((r) =>
                            r
                              ? {
                                  ...r,
                                  district: (e.target.value || undefined) as Restaurant["district"],
                                }
                              : r
                          )
                        }
                        className="w-full rounded-xl text-gray-500 border px-3 py-2 shadow-sm"
                      >
                        <option value="">-- Select district --</option>
                        {DISTRICTS.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        value={editingRestaurant.address || ""}
                        onChange={(e) =>
                          setEditingRestaurant((r) => (r ? { ...r, address: e.target.value } : r))
                        }
                        className="w-full rounded-lg text-gray-500 border px-3 py-2 shadow-sm focus:ring-2 focus:ring-orange-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editingRestaurant.description || ""}
                        onChange={(e) =>
                          setEditingRestaurant((r) =>
                            r ? { ...r, description: e.target.value } : r
                          )
                        }
                        rows={3}
                        className="w-full rounded-lg text-gray-500 border px-3 py-2 shadow-sm focus:ring-2 focus:ring-orange-200 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={editingRestaurant.location?.coordinates?.[0] ?? ""}
                          onChange={(e) =>
                            setEditingRestaurant((r) => {
                              if (!r) return r;
                              const current = r.location?.coordinates || [0, 0];
                              return {
                                ...r,
                                location: {
                                  type: "Point",
                                  coordinates: [Number(e.target.value), Number(current[1])],
                                },
                              };
                            })
                          }
                          className="w-full rounded-lg text-gray-500 border px-3 py-2 shadow-sm focus:ring-2 focus:ring-orange-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={editingRestaurant.location?.coordinates?.[1] ?? ""}
                          onChange={(e) =>
                            setEditingRestaurant((r) => {
                              if (!r) return r;
                              const current = r.location?.coordinates || [0, 0];
                              return {
                                ...r,
                                location: {
                                  type: "Point",
                                  coordinates: [Number(current[0]), Number(e.target.value)],
                                },
                              };
                            })
                          }
                          className="w-full rounded-lg text-gray-500 border px-3 py-2 shadow-sm focus:ring-2 focus:ring-orange-200"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Update restaurant details and save once. Food rows can be edited individually below.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-700">Restaurant photos</p>
                    <ImageUpload
                      folder="restaurants"
                      value={editingRestaurant.images || []}
                      onChange={() => {}}
                      onMultipleChange={(urls) =>
                        setEditingRestaurant((r) => (r ? { ...r, images: urls } : r))
                      }
                      multiple
                      maxCount={10}
                      label=""
                    />
                  </div>
                </section>

                <section className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900">Foods</h4>
                  <div className="mt-3 rounded-lg border border-orange-100 bg-orange-50 p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add food</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        className="rounded border text-gray-500 px-2 py-1"
                        placeholder="Food name"
                        value={newFood.name}
                        onChange={(e) => setNewFood((prev) => ({ ...prev, name: e.target.value }))}
                      />
                      <input
                        type="number"
                        className="rounded border text-gray-500 px-2 py-1"
                        placeholder="Price"
                        value={newFood.price}
                        onChange={(e) =>
                          setNewFood((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))
                        }
                      />
                      <input
                        className="rounded border text-gray-500 px-2 py-1"
                        placeholder="Category"
                        value={newFood.category}
                        onChange={(e) =>
                          setNewFood((prev) => ({ ...prev, category: e.target.value }))
                        }
                      />
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        className="rounded border text-gray-500 px-2 py-1"
                        placeholder="Rating (0 - 5)"
                        value={newFood.rating}
                        onChange={(e) =>
                          setNewFood((prev) => ({ ...prev, rating: Number(e.target.value) || 0 }))
                        }
                      />
                      <div className="md:col-span-2">
                        <ImageUpload
                          folder="foods"
                          value={newFood.image}
                          onChange={(url) =>
                            setNewFood((prev) => ({ ...prev, image: url }))
                          }
                          label="New food photo"
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={addFoodToRestaurant}
                        disabled={addingFood}
                        className="rounded-md px-3 py-1.5 text-sm bg-orange-600 text-white disabled:opacity-60"
                      >
                        {addingFood ? "Adding..." : "Add food"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {(editingRestaurant.foods || []).map((f, index) => {
                      const fid = String(f._id || f.id || index);
                      const isEditing = foodEditId === fid;
                      return (
                        <article key={fid} className="flex items-center gap-4 rounded-lg border bg-white p-3 shadow-sm">
                          <div className="h-16 w-16 flex-shrink-0 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                            {f.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={f.image} alt={f.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="text-xs text-gray-400">No image</div>
                            )}
                          </div>

                          <div className="flex-1">
                            {!isEditing ? (
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-gray-800">{f.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {f.category || "-"} - NPR {f.price} - Rating {(Number(f.rating) || 0).toFixed(1)}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <button className="text-sm rounded-md px-3 py-1 bg-blue-50 text-blue-600" onClick={() => setFoodEditId(fid)}>Edit</button>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  className="rounded border text-gray-500 px-2 py-1"
                                  placeholder="Food name"
                                  value={foodEdits[fid]?.name || ""}
                                  onChange={(e) =>
                                    setFoodEdits((prev) => ({
                                      ...prev,
                                      [fid]: { ...prev[fid], name: e.target.value },
                                    }))
                                  }
                                />
                                <input
                                  type="number"
                                  className="rounded border text-gray-500 px-2 py-1"
                                  placeholder="Price"
                                  value={foodEdits[fid]?.price ?? 0}
                                  onChange={(e) =>
                                    setFoodEdits((prev) => ({
                                      ...prev,
                                      [fid]: { ...prev[fid], price: Number(e.target.value) },
                                    }))
                                  }
                                />
                                <input
                                  className="rounded border text-gray-500 px-2 py-1"
                                  placeholder="Category"
                                  value={foodEdits[fid]?.category || ""}
                                  onChange={(e) =>
                                    setFoodEdits((prev) => ({
                                      ...prev,
                                      [fid]: { ...prev[fid], category: e.target.value },
                                    }))
                                  }
                                />
                                <input
                                  type="number"
                                  min={0}
                                  max={5}
                                  step={0.1}
                                  className="rounded border text-gray-500 px-2 py-1"
                                  placeholder="Rating (0 - 5)"
                                  value={foodEdits[fid]?.rating ?? 0}
                                  onChange={(e) =>
                                    setFoodEdits((prev) => ({
                                      ...prev,
                                      [fid]: { ...prev[fid], rating: Number(e.target.value) || 0 },
                                    }))
                                  }
                                />
                                <div className="col-span-2">
                                  <ImageUpload
                                    folder="foods"
                                    value={foodEdits[fid]?.image || ""}
                                    onChange={(url) =>
                                      setFoodEdits((prev) => ({
                                        ...prev,
                                        [fid]: { ...prev[fid], image: url },
                                      }))
                                    }
                                    label="Food photo"
                                  />
                                </div>
                                <div className="col-span-2 flex items-center gap-2 mt-2">
                                  <button className="rounded px-3 py-1 text-sm bg-green-600 text-white" onClick={() => saveFoodEdits(fid)}>Save</button>
                                  <button className="rounded px-3 py-1 text-sm bg-gray-100" onClick={() => setFoodEditId(null)}>Cancel</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <footer className="mt-6 flex items-center justify-end gap-3">
                  <button className="rounded-md px-4 py-2 bg-white border" onClick={closeEdit}>Cancel</button>
                  <button className="rounded-md px-4 py-2 bg-orange-600 text-white" onClick={saveRestaurantChanges}>{editingLoading ? 'Saving...' : 'Save changes'}</button>
                </footer>
              </div>
            </div>
          )}

          {tab === "reviews" && (
            <section>
              <div className="rounded-2xl border border-orange-100 bg-white p-8 text-center text-gray-500">
                <p>Manage individual reviews from each restaurant&apos;s detail page.</p>
                <Link href="/restaurants" className="mt-3 inline-block text-sm font-medium text-orange-600 hover:text-orange-700">
                  Browse restaurants →
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>

      <ConfirmModal
        open={confirm.open}
        title={confirm.type === "user" ? "Delete user?" : "Delete restaurant?"}
        message={
          confirm.type === "user" && confirm.item
            ? `This will permanently delete "${(confirm.item as AdminUser).name}" and their favorites/reviews.`
            : confirm.type === "restaurant" && confirm.item
              ? `This will permanently delete "${(confirm.item as AdminRestaurant).name}" and all related favorites and reviews.`
              : "This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirm({ open: false, type: null, item: null, loading: false })}
        loading={confirm.loading}
      />
    </div>
  );
}
