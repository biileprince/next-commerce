"use client";

import { useState } from "react";
import { Cart, Address } from "@/types";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_COST } from "@/lib/constants";
import { AddressSelector } from "./address-selector";
import { OrderSummary } from "./order-summary";
import { createOrder } from "@/lib/actions/order";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CheckoutForm({
  cart,
  addresses,
}: {
  cart: Cart;
  addresses: Address[];
}) {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ""
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const total = subtotal + SHIPPING_COST;

  async function handleCheckout() {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createOrder(selectedAddressId);

      if (result.success && result.data) {
        // Redirect to Paystack payment page
        if (result.data.paymentUrl) {
          window.location.href = result.data.paymentUrl;
        } else {
          router.push(`/orders/${result.data.orderId}`);
        }
      } else {
        toast.error(result.error || "Failed to create order");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left Column - Address & Payment */}
      <div className="lg:col-span-2 space-y-6">
        <AddressSelector
          addresses={addresses}
          selectedId={selectedAddressId}
          onSelect={setSelectedAddressId}
        />

        {/* Payment Method */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
          <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <input
                type="radio"
                id="paystack"
                name="payment"
                checked
                readOnly
                className="h-4 w-4"
              />
              <label htmlFor="paystack" className="flex-1">
                <div className="font-medium">Paystack</div>
                <div className="text-sm text-neutral-500">
                  Card, Bank Transfer, Mobile Money, USSD
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Order Summary */}
      <div className="lg:col-span-1">
        <OrderSummary
          items={cart.items}
          subtotal={subtotal}
          shipping={SHIPPING_COST}
          total={total}
          onCheckout={handleCheckout}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}
