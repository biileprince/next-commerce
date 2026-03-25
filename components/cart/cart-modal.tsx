"use client";

import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_COST } from "@/lib/constants";
import { LoadingDots } from "@/components/loading-dots";
import { useState } from "react";

export function CartModal() {
  const {
    cart,
    isOpen,
    closeCart,
    removeItem,
    updateItemQuantity,
    totalAmount,
    totalQuantity,
  } = useCart();

  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setLoadingItems((prev) => new Set(prev).add(itemId));
    await updateItemQuantity(itemId, quantity);
    setLoadingItems((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleRemove = async (itemId: string) => {
    setLoadingItems((prev) => new Set(prev).add(itemId));
    await removeItem(itemId);
    setLoadingItems((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const grandTotal = totalAmount + SHIPPING_COST;

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="flex h-full w-full flex-col bg-white/95 backdrop-blur-xl dark:bg-black/95 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">
            My Cart ({totalQuantity})
          </SheetTitle>
        </SheetHeader>

        {!cart || cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <ShoppingCart className="h-12 w-12 text-neutral-400 sm:h-16 sm:w-16" />
            <p className="mt-4 text-center text-xl font-bold sm:mt-6 sm:text-2xl">
              Your cart is empty.
            </p>
            <Button onClick={closeCart} className="mt-4 sm:mt-6" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-between overflow-hidden">
            {/* Cart Items */}
            <ul className="flex-1 overflow-auto py-4 px-1">
              {cart.items
                .sort((a, b) => a.product.name.localeCompare(b.product.name))
                .map((item) => {
                  const isLoading = loadingItems.has(item.id);

                  return (
                    <li
                      key={item.id}
                      className="flex w-full flex-col border-b border-neutral-200 py-4 dark:border-neutral-700"
                    >
                      {/* Mobile: Stack layout, Desktop: Row layout */}
                      <div className="flex gap-3 sm:gap-4">
                        {/* Product Image */}
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 sm:h-16 sm:w-16">
                          {item.product.images?.[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-neutral-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Info + Controls */}
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          {/* Product Name and Price */}
                          <div className="flex-1">
                            <Link
                              href={`/products/${item.product.slug}`}
                              onClick={closeCart}
                              className="line-clamp-2 text-sm font-medium hover:underline"
                            >
                              {item.product.name}
                            </Link>
                            <p className="mt-0.5 text-sm text-neutral-500">
                              {formatPrice(
                                item.product.price,
                                item.product.currency
                              )}
                            </p>
                          </div>

                          {/* Quantity Controls and Subtotal - Mobile: Below info */}
                          <div className="flex items-center justify-between gap-2">
                            {/* Quantity Controls */}
                            <div className="flex h-8 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1 || isLoading}
                                className="flex h-full min-w-[32px] items-center justify-center rounded-l-full px-2 transition-all hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
                              >
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                              <p className="w-8 text-center text-sm">
                                {isLoading ? <LoadingDots /> : item.quantity}
                              </p>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={
                                  item.quantity >= item.product.stockQuantity ||
                                  isLoading
                                }
                                className="flex h-full min-w-[32px] items-center justify-center rounded-r-full px-2 transition-all hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
                              >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            </div>

                            {/* Subtotal */}
                            <p className="text-sm font-semibold">
                              {formatPrice(
                                item.product.price * item.quantity,
                                item.product.currency
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="mt-2 flex justify-start pl-[92px] sm:pl-[80px]">
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1 text-xs text-red-600 hover:underline disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
            </ul>

            {/* Cart Summary */}
            <div className="border-t border-neutral-200 px-1 pt-4 dark:border-neutral-700">
              <div className="mb-2 flex items-center justify-between text-sm">
                <p className="text-neutral-500">Subtotal</p>
                <p>{formatPrice(totalAmount)}</p>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <p className="text-neutral-500">Shipping</p>
                <p>{formatPrice(SHIPPING_COST)}</p>
              </div>
              <div className="mb-3 flex items-center justify-between border-t pt-3 text-base font-bold dark:border-neutral-700">
                <p>Total</p>
                <p>{formatPrice(grandTotal)}</p>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/checkout" onClick={closeCart}>
                  Proceed to Checkout
                </Link>
              </Button>

              <button
                onClick={closeCart}
                className="mt-2 w-full pb-2 text-center text-sm text-neutral-500 hover:text-black dark:hover:text-white"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
