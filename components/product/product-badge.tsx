import { cn } from "@/lib/utils";
import { Badge } from "@/types";

interface ProductBadgeProps {
  type?: "top" | "discount" | "new" | "sold-out";
  value?: number; // For discount percentage
  className?: string;
  // For dynamic badges from database
  badge?: Badge;
}

export function ProductBadge({ type, value, className, badge }: ProductBadgeProps) {
  // If a dynamic badge is passed, use it
  if (badge) {
    return (
      <div
        className={cn(
          "absolute left-2 top-2 z-10 rounded-md px-2 py-1 text-xs font-bold uppercase shadow-md",
          className
        )}
        style={{ backgroundColor: badge.color, color: badge.textColor }}
      >
        {badge.label}
      </div>
    );
  }

  // Fallback to static badge types
  const badges = {
    top: {
      bg: "bg-orange-500",
      text: "TOP",
    },
    discount: {
      bg: "bg-red-500",
      text: value ? `-${value}%` : "SALE",
    },
    new: {
      bg: "bg-green-500",
      text: "NEW",
    },
    "sold-out": {
      bg: "bg-neutral-500",
      text: "SOLD OUT",
    },
  };

  if (!type) return null;

  const badgeConfig = badges[type];

  return (
    <div
      className={cn(
        "absolute left-2 top-2 z-10 rounded-md px-2 py-1 text-xs font-bold uppercase text-white shadow-md",
        badgeConfig.bg,
        className
      )}
    >
      {badgeConfig.text}
    </div>
  );
}

// Component to render multiple badges stacked
export function ProductBadges({
  badges,
  stockQuantity,
  className,
}: {
  badges?: Badge[];
  stockQuantity: number;
  className?: string;
}) {
  // If out of stock, only show sold out badge
  if (stockQuantity === 0) {
    return <ProductBadge type="sold-out" className={className} />;
  }

  // If no dynamic badges, return null
  if (!badges || badges.length === 0) {
    return null;
  }

  // Show the first badge (highest priority)
  const primaryBadge = badges[0];

  return <ProductBadge badge={primaryBadge} className={className} />;
}
