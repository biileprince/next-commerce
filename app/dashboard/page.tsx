import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOrders } from "@/lib/actions/order";
import { getAddresses } from "@/lib/actions/address";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Dashboard",
  description: "Your account dashboard",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const [ordersResult, addressesResult] = await Promise.all([
    getOrders(),
    getAddresses(),
  ]);

  const orders = ordersResult.success ? ordersResult.data || [] : [];
  const addresses = addressesResult.success ? addressesResult.data || [] : [];

  // Calculate stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (o) => o.orderStatus === "delivered"
  ).length;
  const pendingOrders = orders.filter(
    (o) =>
      o.orderStatus === "pending" ||
      o.orderStatus === "confirmed" ||
      o.orderStatus === "processing"
  ).length;
  const totalSpent = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const recentOrders = orders.slice(0, 5);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-neutral-500">
          Welcome back, {session.user.name || session.user.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
          <p className="text-sm text-neutral-500">Total Orders</p>
          <p className="mt-2 text-3xl font-bold">{totalOrders}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
          <p className="text-sm text-neutral-500">Completed</p>
          <p className="mt-2 text-3xl font-bold">{completedOrders}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
          <p className="text-sm text-neutral-500">Pending</p>
          <p className="mt-2 text-3xl font-bold">{pendingOrders}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
          <p className="text-sm text-neutral-500">Total Spent</p>
          <p className="mt-2 text-3xl font-bold">
            {formatPrice(totalSpent, "NGN")}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link
              href="/orders"
              className="text-sm text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
            >
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-black">
              <p className="text-neutral-500">No orders yet</p>
              <Link
                href="/products"
                className="mt-4 inline-block rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-black dark:hover:border-neutral-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">
                        Order #{order.orderNumber}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="mt-1 text-sm">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(order.totalAmount, order.currency)}
                      </p>
                      <span
                        className={`mt-2 inline-block rounded px-2 py-1 text-xs font-medium ${
                          statusColors[
                            order.orderStatus as keyof typeof statusColors
                          ]
                        }`}
                      >
                        {order.orderStatus.charAt(0).toUpperCase() +
                          order.orderStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Saved Addresses */}
        <div className="lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Saved Addresses</h2>
            <Link
              href="/dashboard/addresses"
              className="text-sm text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
            >
              Manage →
            </Link>
          </div>

          {addresses.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-black">
              <p className="text-sm text-neutral-500">No saved addresses</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.slice(0, 3).map((address) => (
                <div
                  key={address.id}
                  className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-black"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">{address.fullName}</p>
                    {address.isDefault && (
                      <span className="text-xs rounded bg-neutral-100 px-2 py-1 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {address.city}, {address.state}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/products"
          className="rounded-lg border border-neutral-200 bg-white p-6 text-center transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-black dark:hover:border-neutral-700"
        >
          <span className="text-3xl">🛍️</span>
          <p className="mt-2 font-medium">Browse Products</p>
        </Link>
        <Link
          href="/orders"
          className="rounded-lg border border-neutral-200 bg-white p-6 text-center transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-black dark:hover:border-neutral-700"
        >
          <span className="text-3xl">📦</span>
          <p className="mt-2 font-medium">View Orders</p>
        </Link>
        <Link
          href="/dashboard/addresses"
          className="rounded-lg border border-neutral-200 bg-white p-6 text-center transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-black dark:hover:border-neutral-700"
        >
          <span className="text-3xl">📍</span>
          <p className="mt-2 font-medium">Manage Addresses</p>
        </Link>
      </div>
    </div>
  );
}
