import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOrder } from "@/lib/actions/order";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { RetryPaymentButton } from "@/components/orders/retry-payment-button";
import { PaymentCallback } from "@/components/orders/payment-callback";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `Order ${id}`,
    description: "View order details",
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const result = await getOrder(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;

  const statusColors = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    shipped:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    delivered:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <Suspense>
        <PaymentCallback />
      </Suspense>

      <div className="mb-8">
        <Link
          href="/orders"
          className="mb-4 inline-flex items-center text-sm hover:underline"
        >
          ← Back to Orders
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          Order #{order.orderNumber}
        </h1>
        <p className="mt-2 text-neutral-500">
          Placed on{" "}
          {new Date(order.createdAt).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
            <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
                    <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                      <span className="text-3xl">📦</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-neutral-500">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {formatPrice(item.productPrice, order.currency)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(item.subtotal, order.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
            <h2 className="mb-4 text-xl font-semibold">Delivery Address</h2>
            <div className="text-sm">
              <p className="font-medium">{order.address.fullName}</p>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                {order.address.addressLine1}
              </p>
              {order.address.addressLine2 && (
                <p className="text-neutral-600 dark:text-neutral-400">
                  {order.address.addressLine2}
                </p>
              )}
              <p className="text-neutral-600 dark:text-neutral-400">
                {order.address.city}, {order.address.state}
              </p>
              {order.address.landmark && (
                <p className="text-neutral-500">
                  Landmark: {order.address.landmark}
                </p>
              )}
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                {order.address.phoneNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Subtotal
                </span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Shipping
                </span>
                <span>{formatPrice(order.shippingCost, order.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold dark:border-neutral-800">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount, order.currency)}</span>
              </div>
            </div>

            <div className="space-y-3 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-800">
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">
                  Order Status:
                </span>
                <span
                  className={`ml-2 inline-block rounded px-2 py-1 text-xs font-medium ${
                    statusColors[order.orderStatus as keyof typeof statusColors]
                  }`}
                >
                  {order.orderStatus.charAt(0).toUpperCase() +
                    order.orderStatus.slice(1)}
                </span>
              </div>

              <div>
                <span className="text-neutral-600 dark:text-neutral-400">
                  Payment Status:
                </span>
                <span
                  className={`ml-2 inline-block rounded px-2 py-1 text-xs font-medium ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {order.paymentStatus.charAt(0).toUpperCase() +
                    order.paymentStatus.slice(1)}
                </span>
              </div>

              {order.trackingNumber && (
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Tracking:
                  </span>
                  <p className="mt-1 font-mono text-xs">
                    {order.trackingNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Retry Payment Button */}
            {order.paymentStatus === "pending" &&
              order.orderStatus !== "cancelled" && (
                <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <RetryPaymentButton orderId={order.id} />
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
