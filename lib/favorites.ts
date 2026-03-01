import api from "./api";
import type { Restaurant } from "@/types/restaurant";

export type FavoriteItem = {
  _id: string;
  user: string;
  restaurant: Restaurant;
  createdAt: string;
};

export async function getFavorites(): Promise<FavoriteItem[]> {
  const { data } = await api.get<{ success: boolean; message: string; data: FavoriteItem[] }>(
    "/favorites"
  );
  return data.data;
}

export async function addFavorite(restaurantId: string): Promise<FavoriteItem> {
  const { data } = await api.post<{ success: boolean; message: string; data: FavoriteItem }>(
    `/favorites/${restaurantId}`
  );
  return data.data;
}

export async function removeFavorite(restaurantId: string): Promise<void> {
  await api.delete(`/favorites/${restaurantId}`);
}

export type FoodFavoriteItem = {
  _id: string;
  user: string;
  restaurant: any;
  foodId: string;
  createdAt: string;
};

export async function getFoodFavorites(): Promise<FoodFavoriteItem[]> {
  const { data } = await api.get<{ success: boolean; message: string; data: FoodFavoriteItem[] }>(
    "/food-favorites"
  );
  return data.data;
}

export async function addFoodFavorite(restaurantId: string, foodId: string): Promise<FoodFavoriteItem> {
  const { data } = await api.post<{ success: boolean; message: string; data: FoodFavoriteItem }>(
    `/food-favorites/${restaurantId}/${foodId}`
  );
  return data.data;
}

export async function removeFoodFavorite(restaurantId: string, foodId: string): Promise<void> {
  await api.delete(`/food-favorites/${restaurantId}/${foodId}`);
}
