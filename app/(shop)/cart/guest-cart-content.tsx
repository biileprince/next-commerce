"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_COST } from "@/lib/constants";

export function GuestCartContent() {
  const { cart, updateItemQuantity, removeItem, clearCart } = useCart();

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const total = subtotal + (items.length > 0 ? SHIPPING_COST : 0);

  if (!items.length) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-lg text-gray-500">Your cart is empty</p>
        <Link
          href="/products"
          className="inline-block rounded bg-black px-6 py-3 text-white transition hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:flex-row"
          >
            <div className="relative mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 sm:mx-0 sm:h-24 sm:w-24">
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

            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {formatPrice(item.product.price, item.product.currency)}
                </p>
              </div>

              <div className="flex flex-col items-center gap-3 sm:items-end">
                <div className="flex h-9 items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                  <button
                    onClick={() =>
                      updateItemQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="flex h-full w-9 items-center justify-center rounded-l-full transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateItemQuantity(item.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.product.stockQuantity}
                    className="flex h-full w-9 items-center justify-center rounded-r-full transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-lg font-semibold">
                  {formatPrice(
                    item.product.price * item.quantity,
                    item.product.currency,
                  )}
                </p>

                <button
                  onClick={() => removeItem(item.id)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:underline"
        >
          Clear Cart
        </button>
      </div>

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
                {formatPrice(items.length > 0 ? SHIPPING_COST : 0, "GHS")}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-lg font-bold dark:border-neutral-700">
              <span>Total</span>
              <span>{formatPrice(total, "GHS")}</span>
            </div>
          </div>

          <Link
            href="/sign-in?redirect=/checkout"
            className="block w-full rounded-lg bg-black py-3 text-center font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Sign in to Checkout
          </Link>

          <Link
            href="/products"
            className="mt-3 block w-full py-2 text-center text-sm text-neutral-600 hover:underline dark:text-neutral-400"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
