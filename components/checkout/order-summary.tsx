import { CartItem } from "@/types";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

export function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
  onCheckout,
  isProcessing,
}: {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  onCheckout: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
      <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

      {/* Items */}
      <div className="mb-4 space-y-3 border-b border-neutral-200 pb-4 dark:border-neutral-800">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
              {item.product.images[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                  <span className="text-2xl">📦</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.product.name}</p>
              <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
            </div>
            <div className="text-sm font-medium">
              {formatPrice(
                item.product.price * item.quantity,
                item.product.currency
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600 dark:text-neutral-400">
            Subtotal
          </span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600 dark:text-neutral-400">
            Shipping
          </span>
          <span className="font-medium">{formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold dark:border-neutral-800">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={isProcessing}
        className="mt-6 w-full rounded-md bg-black px-6 py-3 font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        {isProcessing ? "Processing..." : "Proceed to Payment"}
      </button>
    </div>
  );
}
