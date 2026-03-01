"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../_component/sidebar";
import StarRating from "../../_component/StarRating";
import { RestaurantDetailSkeleton, ReviewSkeleton } from "../../_component/Skeleton";
import {
  getRestaurantById,
  getRestaurantReviews,
  createReview,
} from "@/lib/restaurants";
import type { Restaurant, Review } from "@/types/restaurant";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRestaurant } from "@/context/RestaurantContext";
import { getFoodFavorites, addFoodFavorite, removeFoodFavorite } from "@/lib/favorites";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop";

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();
  const toast = useToast();
  const { refreshReviews, refreshReviewsTrigger } = useRestaurant();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [foodFavIds, setFoodFavIds] = useState<Set<string>>(new Set());

  const loadRestaurant = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getRestaurantById(id);
      setRestaurant(data);
    } catch {
      toast.error("Restaurant not found");
      router.push("/restaurants");
    } finally {
      setLoading(false);
    }
  }, [id, router, toast]);

  const loadReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const data = await getRestaurantReviews(id);
      setReviews(data);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  useEffect(() => {
    // load user's food favorites for this restaurant
    (async () => {
      try {
        const favs = await getFoodFavorites();
        const ids = new Set<string>();
        favs.forEach((f) => {
          if (f.restaurant && String(f.restaurant._id) === String(id)) {
            ids.add(String(f.foodId));
          }
        });
        setFoodFavIds(ids);
      } catch (err) {
        // ignore
      }
    })();
  }, [id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews, refreshReviewsTrigger]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to submit a review");
      router.push("/login");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating (1-5 stars)");
      return;
    }
    setSubmitting(true);
    try {
      await createReview(id, { rating, comment });
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      refreshReviews();
      loadRestaurant();
      loadReviews();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to submit review";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const images = restaurant?.images?.length
    ? restaurant.images
    : [PLACEHOLDER_IMG];
  const restaurantPrimaryImage = images[0] || PLACEHOLDER_IMG;
  const menuFoods = Array.isArray(restaurant?.foods)
    ? restaurant.foods.filter((food): food is NonNullable<typeof food> => Boolean(food))
    : [];

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const totalReviews = reviews.length;
  const avgRating = totalReviews
    ? reviews.reduce((a, r) => a + r.rating, 0) / totalReviews
    : restaurant?.averageRating ?? 0;

  const mockUser = { name: user?.name ?? "Guest", level: "Foodie", role: user?.role };

  if (loading && !restaurant) {
    return (
      <div className="min-h-screen bg-orange-50">
        <Sidebar activeTab="restaurants" user={mockUser} />
        <main className="ml-64 p-8">
          <RestaurantDetailSkeleton />
        </main>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-orange-50" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}>
      <Sidebar activeTab="restaurants" user={mockUser} />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-10 border-b border-orange-100 text-black bg-white/80 px-8 py-4 backdrop-blur">
          <Link
            href="/restaurants"
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            ← Back to Restaurants
          </Link>
        </header>

        <div className="px-8 py-7 space-y-8">
          {/* Gallery */}
          <div className="rounded-2xl overflow-hidden border border-orange-100 bg-white">
            <div className="aspect-[21/9] flex overflow-x-auto snap-x snap-mandatory">
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${restaurant.name} ${i + 1}`}
                  className="w-full flex-shrink-0 snap-center object-cover"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">{restaurant.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <StarRating rating={restaurant.averageRating} size="lg" />
                <span className="text-gray-500">({restaurant.totalReviews} reviews)</span>
              </div>
              {restaurant.address && (
                <p className="text-sm text-gray-500 mt-1">📍 {restaurant.address}</p>
              )}
            </div>
          </div>

          {restaurant.description && (
            <div className="bg-white rounded-2xl border border-orange-100 p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">About</h2>
              <p className="text-gray-700">{restaurant.description}</p>
            </div>
          )}

          {/* Food list */}
          {menuFoods.length > 0 && (
            <div className="bg-white rounded-2xl border border-orange-100 p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Menu ({menuFoods.length})
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {menuFoods.map((food, i) => {
                  const foodId = String(food._id ?? food.id ?? i);
                  const isFav = foodFavIds.has(foodId);
                  const foodPrice =
                    typeof food.price === "number" ? food.price : Number(food.price) || 0;
                  const foodImage = food.image || restaurantPrimaryImage;
                  const foodRating = Number.isFinite(Number(food.rating))
                    ? Number(food.rating)
                    : Number(restaurant.averageRating) || 0;

                  return (
                    <div
                      key={foodId}
                      className="flex items-center justify-between gap-3 py-2 border-b border-orange-50 last:border-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-orange-100 bg-orange-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={foodImage} alt={food.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-800">{food.name}</p>
                          <div className="truncate text-xs text-gray-500">
                            {food.category ? `${food.category} • ` : ""}⭐ {foodRating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-orange-600">NPR {foodPrice.toFixed(2)}</p>
                        {/* Favorite heart */}
                        <button
                          type="button"
                          onClick={async () => {
                            if (!user) {
                              toast.error("Please log in to save foods");
                              router.push("/login");
                              return;
                            }

                            // optimistic
                            setFoodFavIds((prev) => {
                              const next = new Set(prev);
                              if (isFav) next.delete(foodId);
                              else next.add(foodId);
                              return next;
                            });

                            try {
                              if (!isFav) {
                                await addFoodFavorite(id, foodId);
                                toast.success("Food added to favorites");
                              } else {
                                await removeFoodFavorite(id, foodId);
                                toast.success("Food removed from favorites");
                              }
                            } catch (err: unknown) {
                              // revert
                              setFoodFavIds((prev) => {
                                const next = new Set(prev);
                                if (isFav) next.add(foodId);
                                else next.delete(foodId);
                                return next;
                              });
                              const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to update favorite";
                              toast.error(msg);
                            }
                          }}
                          className="p-1 rounded-full transition-transform hover:scale-110 active:scale-95"
                          aria-label={isFav ? "Remove favorite" : "Add favorite"}
                        >
                          {isFav ? (
                            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ratings breakdown */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Ratings breakdown</h2>
            <div className="space-y-2">
              {ratingCounts.map(({ star, count }) => {
                const pct = totalReviews ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-8 text-right">{star} ★</span>
                    <div className="flex-1 bg-orange-50 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-orange-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add review form */}
          {user && (
            <div className="bg-white rounded-2xl border border-orange-100 p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">✏️ Add your review</h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Rating</label>
                  <StarRating
                    rating={rating}
                    interactive
                    onRate={setRating}
                    showValue={false}
                  />
                  {rating > 0 && (
                    <span className="ml-2 text-sm font-bold text-orange-500">{rating}.0</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Comment (optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience..."
                    className="w-full px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || rating < 1}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            </div>
          )}

          {/* Reviews list */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">💬 Reviews</h2>
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <ReviewSkeleton key={i} />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div
                    key={r._id}
                    className="border border-orange-100 rounded-xl p-4 hover:bg-orange-50/50 transition"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-sm font-bold text-orange-700">
                        {typeof r.user === "object" && r.user?.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {typeof r.user === "object" ? r.user?.name : "User"}
                        </p>
                        <StarRating rating={r.rating} size="sm" showValue={true} />
                      </div>
                      <p className="ml-auto text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
