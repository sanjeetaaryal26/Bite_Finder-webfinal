"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../_component/sidebar";
import StarRating from "../_component/StarRating";
import { getMyReviews, updateReview, deleteReview } from "@/lib/restaurants";
import type { Review } from "@/types/restaurant";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

type Filter = "all" | "5" | "4" | "3" | "below3";

function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 4.5
      ? "bg-green-50 text-green-700 border-green-200"
      : rating >= 3
        ? "bg-orange-50 text-orange-700 border-orange-200"
        : "bg-red-50 text-red-600 border-red-200";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {rating.toFixed(1)}
    </span>
  );
}

export default function MyReviewsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getMyReviews();
      setReviews(data);
    } catch {
      toast.error("Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    void fetchReviews();
  }, [user, router, fetchReviews]);

  const restaurantName = (review: Review) =>
    typeof review.restaurant === "object" && review.restaurant?.name
      ? review.restaurant.name
      : "Restaurant";

  const filteredReviews = useMemo(
    () =>
      reviews.filter(
        (review) => {
          const filterMatch =
            filter === "all" ||
            (filter === "5" && review.rating === 5) ||
            (filter === "4" && review.rating === 4) ||
            (filter === "3" && review.rating === 3) ||
            (filter === "below3" && review.rating < 3);

          return filterMatch && restaurantName(review).toLowerCase().includes(search.toLowerCase());
        }
      ),
    [reviews, filter, search]
  );

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  }, [reviews]);

  const fiveStarCount = useMemo(
    () => reviews.filter((review) => review.rating === 5).length,
    [reviews]
  );
  const lowRatingCount = useMemo(
    () => reviews.filter((review) => review.rating < 3).length,
    [reviews]
  );

  const handleEdit = (review: Review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (editRating < 1 || editRating > 5) {
      toast.error("Please select a rating from 1 to 5");
      return;
    }

    try {
      await updateReview(editingId, { rating: editRating, comment: editComment });
      toast.success("Review updated");
      setEditingId(null);
      await fetchReviews();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Update failed";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview(id);
      toast.success("Review deleted");
      setReviews((prev) => prev.filter((review) => review._id !== id));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Delete failed";
      toast.error(msg);
    }
  };

  const mockUser = { name: user?.name ?? "Guest", level: "Foodie", role: user?.role };
  if (!user) return null;


// main className="ml-64 min-h-screen">
//         <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/80 backdrop-blur">
//           <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 py-4 shadow-sm shadow-orange-50">
//             <div>
//               <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
//                 🔖 My Favorites
//               </h1>
//               <p className="text-xs text-gray-400 mt-0.5">
//                 {favorites.length} saved restaurant{favorites.length !== 1 ? "s" : ""}
//               </p>
//             </div>
//           </div>
//         </header>

//         <div className="max-w-6xl px-8 py-7 space-y-6"></div>


  return (
    <div className="min-h-screen bg-orange-50" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif" }}>
      <Sidebar activeTab="reviews" user={mockUser} />

      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-10 border-b border-orange-100 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 py-4 shadow-sm shadow-orange-50">
            <div>
              <h1 className="text-xl font-extrabold text-gray-800">My Reviews</h1>
              <p className="mt-0.5 text-xs text-gray-500">
                {reviews.length} total reviews · average {averageRating.toFixed(1)}
              </p>
            </div>

            <div className="w-full max-w-xs">
              <input
                type="text"
                placeholder="Search by restaurant"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </header>

        <div className="max-w-6xl px-8 py-7 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Reviews</p>
              <p className="mt-2 text-2xl font-black text-orange-600">{reviews.length}</p>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Average Rating</p>
              <p className="mt-2 text-2xl font-black text-orange-600">{averageRating.toFixed(1)}</p>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">5 Star</p>
              <p className="mt-2 text-2xl font-black text-orange-600">{fiveStarCount}</p>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Below 3</p>
              <p className="mt-2 text-2xl font-black text-orange-600">{lowRatingCount}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all" as Filter, label: "All" },
              { id: "5" as Filter, label: "Rating 5" },
              { id: "4" as Filter, label: "Rating 4" },
              { id: "3" as Filter, label: "Rating 3" },
              { id: "below3" as Filter, label: "Below 3" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                  filter === option.id
                    ? "border-orange-300 bg-orange-100 text-orange-700"
                    : "border-orange-100 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                  <div className="mb-3 h-4 w-40 animate-pulse rounded bg-orange-100" />
                  <div className="mb-2 h-4 w-full animate-pulse rounded bg-orange-100" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-orange-100" />
                </div>
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="rounded-2xl border border-orange-100 bg-white p-14 text-center">
              <p className="text-sm text-gray-500">No reviews found.</p>
              <Link
                href="/restaurants"
                className="mt-3 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                Browse restaurants →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <article
                  key={review._id}
                  className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:border-orange-200 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex text-gray-600 items-center gap-2">
                        <Link
                          href={`/restaurants/${
                            typeof review.restaurant === "object" && review.restaurant
                              ? review.restaurant._id
                              : (review.restaurant as string)
                          }`}
                          className="text-base font-bold text-gray-800 hover:text-orange-700"
                        >
                          {restaurantName(review)}
                        </Link>
                        <RatingBadge rating={review.rating} />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(review)}
                        className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(review._id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <StarRating rating={review.rating} showValue={true} />
                  </div>
                  {review.comment && <p className="mt-2 text-sm leading-relaxed text-gray-600">{review.comment}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-orange-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-gray-800">Edit Review</h2>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-xl text-gray-400 transition hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Rating
                </label>
                <StarRating rating={editRating} interactive onRate={setEditRating} showValue={false} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Comment
                </label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="flex-1 rounded-xl border border-orange-200 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
