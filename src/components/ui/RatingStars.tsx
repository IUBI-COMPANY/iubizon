"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export const RatingStars = ({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  reviewCount,
  interactive = false,
  onChange,
}: RatingStarsProps) => {
  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const isFilled = index < Math.floor(rating);
        const isHalf = !isFilled && index < rating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index + 1)}
            className={cn(
              interactive &&
                "cursor-pointer hover:scale-110 transition-transform",
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled || isHalf
                  ? "fill-[#f59e0b] text-[#f59e0b]"
                  : "fill-none text-[#e2e8f0]",
              )}
            />
          </button>
        );
      })}

      {showValue && (
        <span className="ml-1 text-sm font-medium text-[#112237]">
          {rating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className="text-sm text-[#64748b]">({reviewCount})</span>
      )}
    </div>
  );
};
