"use client";

import { useState } from "react";

const StarIcon = ({ filled, size = "md" }: { filled: boolean; size?: "sm" | "md" | "lg" }) => {
  const sizeClass = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <svg
      className={`${sizeClass} ${filled ? "text-amber-500" : "text-gray-200"}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
};

type StarRatingProps = {
  rating: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
};

export default function StarRating({
  rating,
  interactive = false,
  onRate,
  size = "md",
  showValue = true,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const value = hovered || rating;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          role={interactive ? "button" : undefined}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
          className={interactive ? "cursor-pointer" : ""}
        >
          <StarIcon filled={star <= value} size={size} />
        </span>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-gray-700">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
