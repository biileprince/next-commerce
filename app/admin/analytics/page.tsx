import { requireAdmin } from "@/lib/middleware/admin";
import { getDashboardAnalytics } from "@/lib/actions/analytics";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
} from "lucide-react";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const result = await getDashboardAnalytics();
  const data = result.success ? result.data : null;

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  const statusConfig: Record<
    string,
    {
      label: string;
      variant:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success"
        | "warning";
    }
  > = {
    pending: { label: "Pending", variant: "warning" },
    confirmed: { label: "Confirmed", variant: "default" },
    processing: { label: "Processing", variant: "default" },
    shipped: { label: "Shipped", variant: "secondary" },
    delivered: { label: "Delivered", variant: "success" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Analytics</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Overview of your store performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(data.revenue.total, "GHS")}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {data.revenue.growth >= 0 ? (
                <TrendingUp className="mr-1 size-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 size-3 text-red-500" />
              )}
              <span
                className={
                  data.revenue.growth >= 0 ? "text-green-500" : "text-red-500"
                }
              >
                {data.revenue.growth >= 0 ? "+" : ""}
                {data.revenue.growth.toFixed(1)}%
              </span>
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.orders.total}</div>
            <p className="text-xs text-muted-foreground">
              {data.orders.month} this month, {data.orders.today} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Value
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(data.orders.avgValue, "GHS")}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all paid orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.customers.total}</div>
            <p className="text-xs text-muted-foreground">
              +{data.customers.newMonth} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue - Last 7 Days</CardTitle>
          <CardDescription>Daily revenue and order count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {data.chart.last7Days.map((day) => (
              <div key={day.date} className="text-center">
                <div className="text-xs text-muted-foreground">
                  {day.dayName}
                </div>
                <div
                  className="mx-auto mt-2 w-full rounded bg-primary/20"
                  style={{
                    height: `${Math.max(20, (day.revenue / Math.max(...data.chart.last7Days.map((d) => d.revenue || 1))) * 100)}px`,
                  }}
                >
                  <div
                    className="w-full rounded bg-primary transition-all"
                    style={{
                      height: `${(day.revenue / Math.max(...data.chart.last7Days.map((d) => d.revenue || 1))) * 100}%`,
                    }}
                  />
                </div>
                <div className="mt-1 text-xs font-medium">
                  {formatPrice(day.revenue, "GHS")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {day.orders} orders
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" />
              Top Selling Products
            </CardTitle>
            <CardDescription>By quantity sold</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topProducts.map((product, index) => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium">
                            {product.productName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(product.revenue, "GHS")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No sales data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products needing restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            product.stockQuantity === 0
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {product.stockQuantity} left
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-sm text-primary hover:underline"
                        >
                          Update
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                All products are well stocked
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders placed in your store</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.map((order) => {
                  const status =
                    statusConfig[order.orderStatus] || statusConfig.pending;
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium hover:underline"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.paymentStatus === "paid"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(order.totalAmount, "GHS")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Order Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
          <CardDescription>Current status of all orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(data.orders.byStatus).map(([status, count]) => {
              const config = statusConfig[status] || statusConfig.pending;
              return (
                <div key={status} className="flex items-center gap-2">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
