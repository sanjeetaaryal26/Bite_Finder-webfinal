export type FoodItem = {
  _id?: string;
  id?: string | number;
  name: string;
  price: number;
  category?: string;
  image?: string;
  rating?: number;
};

export type Restaurant = {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  district?: 'Kathmandu' | 'Lalitpur' | 'Bhaktapur';
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  foods: FoodItem[];
  averageRating: number;
  totalReviews: number;
  totalFavorites?: number;
  images: string[];
  createdBy?: { _id: string; name: string; email?: string };
  createdAt?: string;
};

export type Review = {
  _id: string;
  user: { _id: string; name: string; email?: string };
  restaurant: string | { _id: string; name?: string };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiListResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

/** Shape returned by /api/restaurants/trending */
export type TrendingRestaurant = {
  _id: string;
  name: string;
  district?: string;
  averageRating: number;
  totalReviews: number;
  totalFavorites: number;
  image?: string | null;
};

/** Shape returned by /api/restaurants/most-saved (includes favoriteCount from aggregation) */
export type MostSavedRestaurant = TrendingRestaurant & {
  favoriteCount: number;
};

/** Shape returned by /api/restaurants/top-food */
export type TopFoodItem = {
  foodName: string;
  averageRating: number;
  totalReviews: number;
};
