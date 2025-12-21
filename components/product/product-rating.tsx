import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductRatingProps {
  rating: number; // 0-5
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function ProductRating({
  rating,
  reviewCount = 0,
  size = "sm",
  showCount = true,
}: ProductRatingProps) {
  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizes[size],
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-neutral-300 text-neutral-300 dark:fill-neutral-700 dark:text-neutral-700"
            )}
          />
        ))}
      </div>
      {showCount && reviewCount > 0 && (
        <span
          className={cn(
            "text-neutral-600 dark:text-neutral-400",
            textSizes[size]
          )}
        >
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
