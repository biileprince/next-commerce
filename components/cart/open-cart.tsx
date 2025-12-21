"use client";

import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpenCartProps {
  quantity?: number;
  className?: string;
}

export function OpenCart({ quantity, className }: OpenCartProps) {
  return (
    <div
      className={cn(
        "relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white",
        className
      )}
    >
      <ShoppingCart className="h-4 transition-all ease-in-out hover:scale-110" />
      {quantity ? (
        <div className="absolute right-0 top-0 -mr-2 -mt-2 h-4 w-4 rounded bg-blue-600 text-[11px] font-medium text-white">
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
