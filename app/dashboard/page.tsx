import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOrders } from "@/lib/actions/order";
import { getAddresses } from "@/lib/actions/address";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    (o) => o.orderStatus === "delivered",
  ).length;
  const pendingOrders = orders.filter(
    (o) =>
      o.orderStatus === "pending" ||
      o.orderStatus === "confirmed" ||
      o.orderStatus === "processing",
  ).length;
  const shippedOrders = orders.filter(
    (o) => o.orderStatus === "shipped",
  ).length;
  const totalSpent = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const recentOrders = orders.slice(0, 5);

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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Welcome back, {session.user.name?.split(" ")[0] || "there"}
        </h1>
        <p className="mt-1 text-neutral-500">
          Here is what is happening with your account
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{totalOrders}</span>
              <span className="text-sm text-neutral-500">orders</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {pendingOrders + shippedOrders}
              </span>
              <span className="text-sm text-neutral-500">active</span>
            </div>
            {(pendingOrders > 0 || shippedOrders > 0) && (
              <div className="mt-2 flex gap-3 text-xs">
                {pendingOrders > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {pendingOrders} processing
                  </span>
                )}
                {shippedOrders > 0 && (
                  <span className="text-purple-600 dark:text-purple-400">
                    {shippedOrders} shipped
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Delivered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{completedOrders}</span>
              <span className="text-sm text-neutral-500">completed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatPrice(totalSpent, "NGN")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription>Your latest order activity</CardDescription>
              </div>
              <Link
                href="/dashboard/orders"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
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
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                  </div>
                  <p className="text-neutral-500">No orders yet</p>
                  <Link
                    href="/products"
                    className="mt-4 inline-block rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => {
                    const status =
                      statusConfig[order.orderStatus] || statusConfig.pending;
                    return (
                      <Link
                        key={order.id}
                        href={`/dashboard/orders/${order.id}`}
                        className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">#{order.orderNumber}</p>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dotColor}`}
                              />
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-neutral-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-NG",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}{" "}
                            - {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatPrice(Number(order.totalAmount), order.currency)}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {order.paymentStatus === "paid"
                              ? "Paid"
                              : "Payment pending"}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Saved Addresses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Addresses</CardTitle>
                <CardDescription>Your saved locations</CardDescription>
              </div>
              <Link
                href="/dashboard/addresses"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
              >
                Manage
              </Link>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-neutral-500">No saved addresses</p>
                  <Link
                    href="/dashboard/addresses/new"
                    className="mt-3 inline-block text-sm font-medium text-black underline-offset-4 hover:underline dark:text-white"
                  >
                    Add an address
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.slice(0, 2).map((address) => (
                    <div
                      key={address.id}
                      className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          {address.fullName}
                        </p>
                        {address.isDefault && (
                          <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {address.city}, {address.region}
                      </p>
                    </div>
                  ))}
                  {addresses.length > 2 && (
                    <p className="text-center text-xs text-neutral-500">
                      +{addresses.length - 2} more address
                      {addresses.length - 2 !== 1 ? "es" : ""}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/products"
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <svg
                    className="h-5 w-5 text-neutral-600 dark:text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Browse Products</p>
                  <p className="text-xs text-neutral-500">Continue shopping</p>
                </div>
              </Link>

              <Link
                href="/dashboard/orders"
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <svg
                    className="h-5 w-5 text-neutral-600 dark:text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Track Orders</p>
                  <p className="text-xs text-neutral-500">
                    View delivery status
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <svg
                    className="h-5 w-5 text-neutral-600 dark:text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Account Settings</p>
                  <p className="text-xs text-neutral-500">
                    Update your profile
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
