"use client";

import { useState } from "react";
import { retryPayment } from "@/lib/actions/order";
import { toast } from "sonner";

export function RetryPaymentButton({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleRetry() {
    setIsLoading(true);
    try {
      const result = await retryPayment(orderId);

      if (result.success && result.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else {
        toast.error(result.error || "Failed to initialize payment");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleRetry}
      disabled={isLoading}
      className="w-full rounded-lg bg-black px-4 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
    >
      {isLoading ? "Processing..." : "Complete Payment"}
    </button>
  );
}
