import { cn } from "@/lib/utils";
import Image from "next/image";
import { ProductLabel } from "./product-label";

interface GridTileImageProps {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: number;
    currencyCode: string;
    position?: "bottom" | "center";
    originalPrice?: number | null;
    rating?: number | null;
    reviewCount?: number | null;
  };
  src?: string | null;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  src,
  alt,
  fill,
  sizes,
  priority,
  className,
}: GridTileImageProps) {
  return (
    <div
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-lg border bg-white transition-all hover:shadow-lg dark:bg-neutral-950",
        {
          "border-2 border-blue-500": active,
          "border-neutral-200 dark:border-neutral-800": !active,
        },
        className
      )}
    >
      <div className="relative aspect-square w-full">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill={fill}
            sizes={sizes}
            priority={priority}
            className={cn("relative h-full w-full object-contain p-4", {
              "transition duration-300 ease-in-out group-hover:scale-105":
                isInteractive,
            })}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-50 dark:bg-neutral-900">
            <span className="text-4xl text-neutral-400">📦</span>
          </div>
        )}
      </div>
      {label && (
        <ProductLabel
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
          originalPrice={label.originalPrice}
          rating={label.rating}
          reviewCount={label.reviewCount}
        />
      )}
    </div>
  );
}
