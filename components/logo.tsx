import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

export function LogoSquare({ size }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-black",
        sizeClasses[size || "md"]
      )}
    >
      <ShoppingBag
        className={cn(
          "text-black dark:text-white",
          size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
        )}
      />
    </div>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <LogoSquare />
      <span className="font-bold text-lg tracking-tight">NextCommerse</span>
    </div>
  );
}
