import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { ProductRating } from "@/components/product/product-rating";

interface ProductLabelProps {
  title: string;
  amount: number;
  currencyCode: string;
  position?: "bottom" | "center";
  originalPrice?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
}

export function ProductLabel({
  title,
  amount,
  currencyCode,
  position = "bottom",
  originalPrice,
  rating,
  reviewCount,
}: ProductLabelProps) {
  const hasDiscount = originalPrice && originalPrice > amount;

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 w-full border-t border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950",
        {
          "lg:px-20 lg:pb-[35%]": position === "center",
        }
      )}
    >
      <h3 className="mb-1.5 line-clamp-2 text-sm font-normal leading-tight text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>

      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-neutral-900 dark:text-white">
              {formatPrice(amount, currencyCode)}
            </p>
            {hasDiscount && (
              <p className="text-xs font-normal text-neutral-500 line-through dark:text-neutral-400">
                {formatPrice(originalPrice, currencyCode)}
              </p>
            )}
          </div>
          {rating && rating > 0 && (
            <ProductRating
              rating={rating}
              reviewCount={reviewCount || 0}
              size="sm"
              showCount={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
