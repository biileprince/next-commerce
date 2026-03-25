"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateCartItem, removeFromCart, clearCart } from "@/lib/actions/cart";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_COST } from "@/lib/constants";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
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
        item.id === id ? { ...item, quantity } : item,
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
    0,
  );

  const total = subtotal + SHIPPING_COST;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
      {/* Cart Items */}
      <div className="space-y-4 lg:col-span-2">
        {optimisticCart.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:flex-row"
          >
            {/* Product Image */}
            <div className="relative mx-auto h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 sm:mx-0 sm:h-24 sm:w-24">
              {item.product.images?.[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-neutral-400" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {formatPrice(item.product.price, item.product.currency)}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {item.product.stockQuantity > 0
                    ? `${item.product.stockQuantity} in stock`
                    : "Out of stock"}
                </p>
              </div>

              {/* Quantity Controls and Total */}
              <div className="flex flex-col items-center gap-3 sm:items-end">
                {/* Quantity Controls */}
                <div className="flex h-9 items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1 || isPending}
                    className="flex h-full w-9 items-center justify-center rounded-l-full transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1)
                    }
                    disabled={
                      item.quantity >= item.product.stockQuantity || isPending
                    }
                    className="flex h-full w-9 items-center justify-center rounded-r-full transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Item Total */}
                <p className="text-lg font-semibold">
                  {formatPrice(
                    item.product.price * item.quantity,
                    item.product.currency,
                  )}
                </p>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={isPending}
                  className="flex items-center gap-1 text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Clear Cart Button */}
        <button
          onClick={handleClearCart}
          disabled={isClearing || isPending}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          {isClearing ? "Clearing..." : "Clear Cart"}
        </button>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

          <div className="mb-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">
                Subtotal
              </span>
              <span className="font-medium">
                {formatPrice(subtotal, "GHS")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">
                Shipping
              </span>
              <span className="font-medium">
                {formatPrice(SHIPPING_COST, "GHS")}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-lg font-bold dark:border-neutral-700">
              <span>Total</span>
              <span>{formatPrice(total, "GHS")}</span>
            </div>
          </div>

          <a
            href="/checkout"
            className="block w-full rounded-lg bg-black py-3 text-center font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Proceed to Checkout
          </a>

          <a
            href="/products"
            className="mt-3 block w-full py-2 text-center text-sm text-neutral-600 hover:underline dark:text-neutral-400"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
}
