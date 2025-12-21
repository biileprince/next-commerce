import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOrders } from "@/lib/actions/order";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "My Orders",
  description: "View your order history",
};

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in?redirect=/orders");
  }

  const result = await getOrders();

  if (!result.success) {
    return (
      <div className="mx-auto max-w-screen-2xl px-4 py-8">
        <p className="text-red-600">Failed to load orders</p>
      </div>
    );
  }

  const orders = result.data || [];

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="mt-2 text-neutral-500">View and track your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-6xl">📦</div>
            <h2 className="mb-2 text-2xl font-semibold">No orders yet</h2>
            <p className="mb-6 text-neutral-500">
              Start shopping to see your orders here
            </p>
            <Link
              href="/products"
              className="rounded-md bg-black px-6 py-3 font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-black"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-500">
                    Order #{order.orderNumber}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(order.totalAmount, order.currency)}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded px-2 py-1 text-xs font-medium ${
                      order.orderStatus === "delivered"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : order.orderStatus === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {order.orderStatus.charAt(0).toUpperCase() +
                      order.orderStatus.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {order.paymentStatus === "paid"
                    ? "✓ Paid"
                    : "Payment Pending"}
                </span>
                <span className="font-medium text-black dark:text-white">
                  View Details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
