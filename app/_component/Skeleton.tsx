"use client";

export function RestaurantCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-orange-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-orange-100 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-4 w-24 bg-orange-100 rounded" />
          <div className="h-4 w-16 bg-orange-100 rounded" />
        </div>
        <div className="h-4 bg-orange-100 rounded w-full" />
        <div className="h-4 bg-orange-100 rounded w-5/6" />
      </div>
    </div>
  );
}

export function RestaurantDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="aspect-[21/9] bg-orange-100 rounded-2xl" />
      <div className="h-8 bg-orange-100 rounded w-1/2" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-orange-100 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-orange-100 rounded-2xl" />
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="animate-pulse flex gap-4 p-4 border border-orange-100 rounded-2xl">
      <div className="w-12 h-12 rounded-full bg-orange-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-orange-100 rounded w-1/3" />
        <div className="h-3 bg-orange-100 rounded w-1/4" />
        <div className="h-4 bg-orange-100 rounded w-full" />
        <div className="h-4 bg-orange-100 rounded w-4/5" />
      </div>
    </div>
  );
}

/** Horizontal scroll card skeleton (e.g. for Trending / Most Saved) */
export function TrendingCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[300px] bg-white rounded-2xl border border-orange-100 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-orange-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-orange-100 rounded w-3/4" />
        <div className="flex justify-between gap-2">
          <div className="h-4 w-16 bg-orange-100 rounded" />
          <div className="h-4 w-10 bg-orange-100 rounded" />
        </div>
        <div className="h-3 bg-orange-100 rounded w-1/2" />
      </div>
    </div>
  );
}

/** Ranked list item skeleton for Top Food section */
export function TopFoodItemSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-orange-100 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <div className="h-4 bg-orange-100 rounded w-1/3" />
        <div className="h-3 bg-orange-100 rounded w-1/4" />
      </div>
      <div className="h-5 w-12 bg-orange-100 rounded" />
    </div>
  );
}
