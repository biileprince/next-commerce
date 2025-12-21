"use client";

import { useCart } from "@/components/cart/cart-context";
import { Product } from "@/types";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const availableQuantity = product.stockQuantity;
  const inStock = availableQuantity > 0;

  async function handleAddToCart() {
    if (!inStock) return;

    setIsAdding(true);
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${quantity} ${product.name} to cart`);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      {inStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-medium">{quantity}</span>
            <button
              onClick={() =>
                setQuantity(Math.min(availableQuantity, quantity + 1))
              }
              disabled={quantity >= availableQuantity}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-neutral-500">
            ({availableQuantity} available)
          </span>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!inStock || isAdding}
        className="w-full rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        {isAdding ? "Adding..." : !inStock ? "Out of Stock" : "Add to Cart"}
      </button>

      {/* Stock Status */}
      <div className="text-sm">
        {inStock ? (
          <p className="text-green-600 dark:text-green-400">✓ In Stock</p>
        ) : (
          <p className="text-red-600 dark:text-red-400">✗ Out of Stock</p>
        )}
      </div>
    </div>
  );
}
