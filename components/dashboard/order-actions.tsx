"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder, retryPayment } from "@/lib/actions/order";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OrderActionsProps {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
}

export function OrderActions({
  orderId,
  orderStatus,
  paymentStatus,
}: OrderActionsProps) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const canCancel = paymentStatus === "pending" && orderStatus === "pending";
  const canRetryPayment =
    paymentStatus !== "paid" && orderStatus !== "cancelled";

  async function handleCancel() {
    setIsCancelling(true);
    try {
      const result = await cancelOrder(orderId);
      if (result.success) {
        toast.success("Order cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel order");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  }

  async function handleRetryPayment() {
    setIsRetrying(true);
    try {
      const result = await retryPayment(orderId);
      if (result.success && result.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl;
      } else {
        toast.error(result.error || "Failed to initialize payment");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsRetrying(false);
    }
  }

  if (!canCancel && !canRetryPayment) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
        <CardDescription>Manage your order</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {canRetryPayment && (
          <button
            onClick={handleRetryPayment}
            disabled={isRetrying}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {isRetrying ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Complete Payment
              </>
            )}
          </button>
        )}

        {canCancel && !showCancelConfirm && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel Order
          </button>
        )}

        {showCancelConfirm && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="mb-3 text-sm text-red-800 dark:text-red-200">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                No, Keep It
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
