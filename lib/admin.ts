import api from "./api";
import type { Restaurant } from "@/types/restaurant";

export type AdminStats = {
  totalUsers: number;
  totalRestaurants: number;
  totalReviews: number;
  totalFavorites: number;
  topDistrict: { name: string; count: number } | null;
  mostReviewedRestaurant: { _id: string; name: string; totalReviews: number } | null;
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "owner";
  profileImage?: string;
  createdAt: string;
  updatedAt?: string;
};

export type AdminRestaurant = {
  _id: string;
  name: string;
  district?: string;
  address?: string;
  averageRating: number;
  totalReviews: number;
  totalFavorites?: number;
  createdAt?: string;
};

export async function getAdminStats() {
  const { data } = await api.get<{ success: boolean; message: string; data: AdminStats }>(
    "/admin/stats"
  );
  return data.data;
}

export async function getAdminUsers(params?: { page?: number; limit?: number }) {
  const { data } = await api.get<{
    success: boolean;
    message: string;
    data: { users: AdminUser[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
  }>("/admin/users", { params });
  return data.data;
}

export async function getAdminRestaurants(params?: { page?: number; limit?: number }) {
  const { data } = await api.get<{
    success: boolean;
    message: string;
    data: { restaurants: AdminRestaurant[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
  }>("/admin/restaurants", { params });
  return data.data;
}

export async function deleteAdminUser(id: string) {
  await api.delete(`/admin/users/${id}`);
}

export async function getAdminUserById(id: string) {
  const { data } = await api.get<{ success: boolean; message: string; data: AdminUser }>(`/admin/users/${id}`);
  return data.data;
}

export async function updateAdminUser(
  id: string,
  payload: {
    name?: string;
    email?: string;
    role?: "user" | "admin" | "owner";
    profileImage?: string;
  }
) {
  const { data } = await api.put<{ success: boolean; message: string; data: AdminUser }>(`/admin/users/${id}`, payload);
  return data.data;
}

export async function deleteAdminRestaurant(id: string) {
  await api.delete(`/admin/restaurants/${id}`);
}

export async function updateAdminRestaurant(
  id: string,
  payload: {
    name?: string;
    district?: "Kathmandu" | "Lalitpur" | "Bhaktapur" | "";
    address?: string;
    description?: string;
    location?: { coordinates: [number, number] };
    images?: string[];
  }
) {
  const { data } = await api.put<{ success: boolean; message: string; data: AdminRestaurant }>(`/admin/restaurants/${id}`, payload);
  return data.data;
}

export async function updateAdminRestaurantFood(restaurantId: string, foodId: string, payload: { name?: string; price?: number; category?: string; image?: string; rating?: number }) {
  const { data } = await api.put<{ success: boolean; message: string; data: Restaurant }>(`/admin/restaurants/${restaurantId}/foods/${foodId}`, payload);
  return data.data;
}

export async function addAdminRestaurantFood(
  restaurantId: string,
  payload: { name: string; price?: number; category?: string; image?: string; rating?: number }
) {
  const { data } = await api.post<{ success: boolean; message: string; data: Restaurant }>(
    `/admin/restaurants/${restaurantId}/foods`,
    payload
  );
  return data.data;
}

export type TimeSeriesPoint = { date: string; count: number };

export async function getAdminAnalytics(period: '7d' | '28d' | '90d') {
  const { data } = await api.get<{ success: boolean; message: string; data: { users: TimeSeriesPoint[]; restaurants: TimeSeriesPoint[]; reviews: TimeSeriesPoint[]; favorites: TimeSeriesPoint[] } }>(
    `/admin/analytics`, { params: { period } }
  );
  return data.data;
}
