import { Package, AlertCircle } from "lucide-react";

export function StockIndicator({ stockQuantity }: { stockQuantity: number }) {
  if (stockQuantity === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <AlertCircle className="h-4 w-4" />
        <span className="font-medium">Out of Stock</span>
      </div>
    );
  }

  if (stockQuantity < 10) {
    return (
      <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
        <Package className="h-4 w-4" />
        <span className="font-medium">Only {stockQuantity} left in stock</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
      <Package className="h-4 w-4" />
      <span className="font-medium">In Stock</span>
    </div>
  );
}
