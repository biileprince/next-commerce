import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOrders } from "@/lib/actions/order";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrdersList } from "@/components/dashboard/orders-list";

export const metadata = {
  title: "My Orders",
  description: "View and manage your orders",
};

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in?redirect=/dashboard/orders");
  }

  const params = await searchParams;
  const result = await getOrders();
  const allOrders = result.success ? result.data || [] : [];

  // Convert Decimal fields to numbers for OrdersList component
  const ordersWithNumbers = allOrders.map((order) => ({
    ...order,
    totalAmount: Number(order.totalAmount),
  }));

  // Filter orders based on search params
  let filteredOrders = ordersWithNumbers;

  if (params.status && params.status !== "all") {
    filteredOrders = filteredOrders.filter(
      (order) => order.orderStatus === params.status,
    );
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.items.some((item) =>
          item.productName.toLowerCase().includes(searchLower),
        ),
    );
  }

  // Calculate status counts
  const statusCounts = {
    all: ordersWithNumbers.length,
    pending: ordersWithNumbers.filter(
      (o) =>
        o.orderStatus === "pending" ||
        o.orderStatus === "confirmed" ||
        o.orderStatus === "processing",
    ).length,
    shipped: ordersWithNumbers.filter((o) => o.orderStatus === "shipped").length,
    delivered: ordersWithNumbers.filter((o) => o.orderStatus === "delivered").length,
    cancelled: ordersWithNumbers.filter((o) => o.orderStatus === "cancelled").length,
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Orders
        </h1>
        <p className="mt-1 text-neutral-500">View and track all your orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            {allOrders.length} total order{allOrders.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersList
            orders={filteredOrders}
            statusCounts={statusCounts}
            currentStatus={params.status || "all"}
            currentSearch={params.search || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
