import { Suspense } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { requireAdmin } from "@/lib/middleware/admin";
import { getAdminOrders } from "@/lib/actions/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrdersFilter } from "@/components/admin/orders-filter";
import { OrdersPagination } from "@/components/admin/orders-pagination";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

async function OrdersContent({
  page,
  search,
  status,
  paymentStatus,
  startDate,
  endDate,
  sortBy,
  sortOrder,
}: {
  page: number;
  search: string;
  status: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: string;
}) {
  const result = await getAdminOrders({
    page,
    search,
    status,
    paymentStatus,
    startDate,
    endDate,
    sortBy: (sortBy as "createdAt" | "totalAmount") || "createdAt",
    sortOrder: (sortOrder as "asc" | "desc") || "desc",
  });

  if (!result.success) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{result.error}</p>
      </div>
    );
  }

  const { data: orders, pagination } = result;

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Package className="mx-auto size-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
        <p className="text-sm text-muted-foreground">
          {search || status !== "all" || paymentStatus !== "all"
            ? "Try adjusting your filters"
            : "No orders have been placed yet"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {order.user?.name || "N/A"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.user?.email || order.user?.phoneNumber}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>
                  GHS {Number(order.totalAmount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.orderStatus === "delivered"
                        ? "success"
                        : order.orderStatus === "cancelled"
                          ? "destructive"
                          : order.orderStatus === "shipped"
                            ? "info"
                            : "secondary"
                    }
                  >
                    {order.orderStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.paymentStatus === "paid"
                        ? "success"
                        : order.paymentStatus === "failed"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/orders/${order.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <OrdersPagination pagination={pagination!} />
    </>
  );
}

export default async function OrdersPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const status = params.status || "all";
  const paymentStatus = params.paymentStatus || "all";
  const startDate = params.startDate || "";
  const endDate = params.endDate || "";
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
      </div>

      <OrdersFilter />

      <Suspense
        fallback={
          <div className="rounded-md border p-8 text-center">
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          </div>
        }
      >
        <OrdersContent
          page={page}
          search={search}
          status={status}
          paymentStatus={paymentStatus}
          startDate={startDate}
          endDate={endDate}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Suspense>
    </div>
  );
}
