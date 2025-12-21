import { cn } from "@/lib/utils";

interface ProductBadgeProps {
  type: "top" | "discount" | "new" | "sold-out";
  value?: number; // For discount percentage
  className?: string;
}

export function ProductBadge({ type, value, className }: ProductBadgeProps) {
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

  const badge = badges[type];

  return (
    <div
      className={cn(
        "absolute left-2 top-2 z-10 rounded-md px-2 py-1 text-xs font-bold uppercase text-white shadow-md",
        badge.bg,
        className
      )}
    >
      {badge.text}
    </div>
  );
}
