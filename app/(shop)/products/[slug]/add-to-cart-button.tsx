"use client";

import { addToCart } from "@/lib/actions/cart";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddToCartButton({
  productId,
  stockQuantity,
}: {
  productId: string;
  stockQuantity: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  async function handleAddToCart() {
    if (stockQuantity === 0) return;

    setIsAdding(true);
    const result = await addToCart(productId, quantity);

    if (result.success) {
      router.push("/cart");
    } else {
      alert(result.error);
      setIsAdding(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="font-medium">Quantity:</span>
        <div className="flex items-center gap-3 border rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
            disabled={quantity >= stockQuantity}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={stockQuantity === 0 || isAdding}
        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isAdding
          ? "Adding..."
          : stockQuantity === 0
            ? "Out of Stock"
            : "Add to Cart"}
      </button>
    </div>
  );
}
