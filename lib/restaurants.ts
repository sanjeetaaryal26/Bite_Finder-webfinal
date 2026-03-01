import api from "./api";
import type { Restaurant, Review, Pagination, TrendingRestaurant, MostSavedRestaurant, TopFoodItem } from "@/types/restaurant";

type RestaurantsListData = { restaurants: Restaurant[]; pagination: Pagination };

export async function getRestaurants(params?: {
  page?: number;
  limit?: number;
  minRating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const { data } = await api.get<{ success: boolean; message: string; data: RestaurantsListData }>(
    "/restaurants",
    { params }
  );
  return data.data;
}

export async function filterRestaurants(params: {
  page?: number;
  limit?: number;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  district?: string;
  address?: string;
  sort?: string;
  lat?: number;
  lng?: number;
}) {
  const { data } = await api.get<{
    success: boolean;
    message: string;
    total: number;
    page: number;
    data: Restaurant[];
  }>("/restaurants/filter", { params });
  return data;
}

export async function getRestaurantById(id: string) {
  const { data } = await api.get<{ success: boolean; message: string; data: Restaurant }>(
    `/restaurants/${id}`
  );
  return data.data;
}

export async function createRestaurant(payload: {
  name: string;
  description?: string;
  address?: string;
  district?: "Kathmandu" | "Lalitpur" | "Bhaktapur";
  location: { coordinates: [number, number] };
  foods?: { name: string; price: number; category?: string; image?: string; rating?: number }[];
  images?: string[];
}) {
  const { data } = await api.post<{ success: boolean; message: string; data: Restaurant }>(
    "/restaurants",
    payload
  );
  return data.data;
}

export async function searchRestaurants(params: {
  food: string;
  page?: number;
  limit?: number;
  minRating?: number;
}) {
  const { data } = await api.get<{ success: boolean; message: string; data: RestaurantsListData }>(
    "/restaurants/search",
    { params }
  );
  return data.data;
}

export async function getNearbyRestaurants(params: {
  lng: number;
  lat: number;
  distance?: number;
  limit?: number;
  minRating?: number;
}) {
  const { data } = await api.get<{ success: boolean; message: string; data: Restaurant[] }>(
    "/restaurants/nearby",
    { params }
  );
  return data.data;
}

export async function getTrendingRestaurants(limit?: number) {
  const { data } = await api.get<{ success: boolean; message: string; data: TrendingRestaurant[] }>(
    "/restaurants/trending",
    { params: limit ? { limit } : undefined }
  );
  return data.data;
}

export async function getMostSavedRestaurants(limit?: number) {
  const { data } = await api.get<{ success: boolean; message: string; data: MostSavedRestaurant[] }>(
    "/restaurants/most-saved",
    { params: limit ? { limit } : undefined }
  );
  return data.data;
}

export async function getTopFoodByDistrict(district: string) {
  const { data } = await api.get<{ success: boolean; message: string; data: TopFoodItem[] }>(
    "/restaurants/top-food",
    { params: { district } }
  );
  return data.data;
}

export async function getRecommendations() {
  const { data } = await api.get<{ success: boolean; message: string; data: Restaurant[] }>(
    "/recommendations"
  );
  return data.data;
}

export async function getMyReviews() {
  const { data } = await api.get<{ success: boolean; message: string; data: Review[] }>("/reviews/me");
  return data.data;
}

export async function getRestaurantReviews(restaurantId: string) {
  const { data } = await api.get<{ success: boolean; message: string; data: Review[] }>(
    `/restaurants/${restaurantId}/reviews`
  );
  return data.data;
}

export async function createReview(restaurantId: string, payload: { rating: number; comment?: string }) {
  const { data } = await api.post<{ success: boolean; message: string; data: Review }>(
    `/reviews/${restaurantId}`,
    payload
  );
  return data.data;
}

export async function updateReview(reviewId: string, payload: { rating?: number; comment?: string }) {
  const { data } = await api.put<{ success: boolean; message: string; data: Review }>(
    `/reviews/${reviewId}`,
    payload
  );
  return data.data;
}

export async function deleteReview(reviewId: string) {
  await api.delete(`/reviews/${reviewId}`);
}
