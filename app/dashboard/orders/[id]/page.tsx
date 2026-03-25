import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOrder } from "@/lib/actions/order";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderActions } from "@/components/dashboard/order-actions";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}

const statusConfig: Record<
  string,
  { label: string; className: string; dotColor: string }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    dotColor: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  shipped: {
    label: "Shipped",
    className:
      "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    dotColor: "bg-purple-500",
  },
  delivered: {
    label: "Delivered",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    dotColor: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    dotColor: "bg-red-500",
  },
};

const orderTimeline = [
  { status: "pending", label: "Order Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "processing", label: "Processing" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const { payment } = await searchParams;
  const result = await getOrder(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;
  const status = statusConfig[order.orderStatus] || statusConfig.pending;
  const isCancelled = order.orderStatus === "cancelled";

  // Calculate current step for timeline
  const currentStepIndex = isCancelled
    ? -1
    : orderTimeline.findIndex((step) => step.status === order.orderStatus);

  return (
    <div className="space-y-6">
      {/* Payment Success Banner */}
      {payment === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="h-4 w-4 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Payment Successful
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Your order has been confirmed and is being processed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/orders"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-black dark:hover:text-white"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-1 text-neutral-500">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-NG", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${status.className}`}
          >
            <span className={`h-2 w-2 rounded-full ${status.dotColor}`} />
            {status.label}
          </span>
          <span
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              order.paymentStatus === "paid"
                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            }`}
          >
            {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
          </span>
        </div>
      </div>

      {/* Order Timeline */}
      {!isCancelled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-neutral-200 dark:bg-neutral-800" />
              <div className="space-y-6">
                {orderTimeline.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div
                      key={step.status}
                      className="relative flex items-center gap-4"
                    >
                      <div
                        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                          isCompleted
                            ? "border-green-500 bg-green-500"
                            : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            isCompleted
                              ? "text-black dark:text-white"
                              : "text-neutral-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-neutral-500">
                            Current status
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
              <CardDescription>
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <svg
                            className="h-6 w-6 text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="mt-0.5 text-sm text-neutral-500">
                        {formatPrice(Number(item.productPrice), order.currency)} x{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(Number(item.subtotal), order.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span>{formatPrice(Number(order.subtotal), order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span>{formatPrice(Number(order.shippingCost), order.currency)}</span>
              </div>
              {order.discountAmount && Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Discount</span>
                  <span className="text-green-600">
                    -{formatPrice(Number(order.discountAmount), order.currency)}
                  </span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-3 dark:border-neutral-800">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.totalAmount), order.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {order.address ? (
                <div className="text-sm">
                  <p className="font-medium">{order.address.fullName}</p>
                  <p className="mt-1 text-neutral-500">
                    {order.address.addressLine1}
                  </p>
                  {order.address.addressLine2 && (
                    <p className="text-neutral-500">
                      {order.address.addressLine2}
                    </p>
                  )}
                  <p className="text-neutral-500">
                    {order.address.city}, {order.address.region}
                  </p>
                  <p className="mt-2 text-neutral-500">
                    {order.address.phoneNumber}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No address available</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <OrderActions
            orderId={order.id}
            orderStatus={order.orderStatus}
            paymentStatus={order.paymentStatus}
          />
        </div>
      </div>
    </div>
  );
}
