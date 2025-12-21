"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateCartItem, removeFromCart, clearCart } from "@/lib/actions/cart";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
    images: string[];
    currency: string;
  };
};

type Cart = {
  id: string;
  items: CartItem[];
};

export function CartContent({ initialCart }: { initialCart: Cart }) {
  const [isPending, startTransition] = useTransition();
  const [isClearing, setIsClearing] = useState(false);
  const router = useRouter();

  const [optimisticCart, updateOptimisticCart] = useOptimistic<
    CartItem[],
    { type: "remove" | "update"; id: string; quantity?: number }
  >(initialCart.items, (state, { type, id, quantity }) => {
    if (type === "remove") {
      return state.filter((item) => item.id !== id);
    }
    if (type === "update" && quantity !== undefined) {
      return state.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
    }
    return state;
  });

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    updateOptimisticCart({ type: "update", id: itemId, quantity: newQuantity });

    startTransition(async () => {
      const result = await updateCartItem(itemId, newQuantity);
      if (!result.success) {
        alert(result.error);
        router.refresh();
      }
    });
  };

  const handleRemove = (itemId: string) => {
    updateOptimisticCart({ type: "remove", id: itemId });

    startTransition(async () => {
      const result = await removeFromCart(itemId);
      if (!result.success) {
        alert(result.error);
        router.refresh();
      }
    });
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    setIsClearing(true);
    const result = await clearCart();
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
      setIsClearing(false);
    }
  };

  const subtotal = optimisticCart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const shippingCost = 2000; // Fixed shipping for MVP
  const total = subtotal + shippingCost;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {optimisticCart.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 flex gap-4 bg-white shadow-sm"
          >
            {/* Product Image */}
            <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0">
              {/* Placeholder for image */}
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.product.name}</h3>
              <p className="text-gray-600 mt-1">
                {item.product.currency} {item.product.price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {item.product.stockQuantity > 0
                  ? `${item.product.stockQuantity} in stock`
                  : "Out of stock"}
              </p>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1 || isPending}
                  className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity + 1)
                  }
                  disabled={
                    item.quantity >= item.product.stockQuantity || isPending
                  }
                  className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Item Total & Remove */}
            <div className="text-right flex flex-col justify-between">
              <p className="font-semibold text-lg">
                {item.product.currency}{" "}
                {(item.product.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => handleRemove(item.id)}
                disabled={isPending}
                className="text-red-600 text-sm hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* Clear Cart Button */}
        <button
          onClick={handleClearCart}
          disabled={isClearing || isPending}
          className="text-red-600 text-sm hover:underline disabled:opacity-50"
        >
          {isClearing ? "Clearing..." : "Clear Cart"}
        </button>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="border rounded-lg p-6 bg-white shadow-sm sticky top-4">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">NGN {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">NGN {shippingCost.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>NGN {total.toFixed(2)}</span>
            </div>
          </div>

          <a
            href="/checkout"
            className="block w-full bg-black text-white text-center py-3 rounded hover:bg-gray-800 transition"
          >
            Proceed to Checkout
          </a>

          <a
            href="/products"
            className="block w-full text-center py-3 mt-2 text-gray-600 hover:underline"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
}
