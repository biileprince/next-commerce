import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Package, CreditCard, User } from "lucide-react";
import { requireAdmin } from "@/lib/middleware/admin";
import { getAdminOrder } from "@/lib/actions/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderStatusUpdate } from "@/components/admin/order-status-update";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const result = await getAdminOrder(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
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
            className="h-7 text-sm"
          >
            {order.orderStatus}
          </Badge>
          <Badge
            variant={
              order.paymentStatus === "paid"
                ? "success"
                : order.paymentStatus === "failed"
                ? "destructive"
                : "warning"
            }
            className="h-7 text-sm"
          >
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5" />
                Order Items
              </CardTitle>
              <CardDescription>
                {order.items.length} item(s) in this order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {item.product.images?.[0] && (
                    <div className="relative size-16 shrink-0 overflow-hidden rounded border">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span>×</span>
                      <span>GHS {Number(item.productPrice).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right font-medium">
                    GHS {(Number(item.productPrice) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>GHS {Number(order.subtotal).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>GHS {Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p className="mt-1">{order.user?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="mt-1">{order.user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Phone
                </p>
                <p className="mt-1">{order.user?.phoneNumber || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Updates */}
          <OrderStatusUpdate order={order} />

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.address ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{order.address.fullName}</p>
                  <p>{order.address.phoneNumber}</p>
                  <p className="text-muted-foreground">
                    {order.address.addressLine1}
                  </p>
                  {order.address.addressLine2 && (
                    <p className="text-muted-foreground">
                      {order.address.addressLine2}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    {order.address.city}, {order.address.region}
                  </p>
                  {order.address.landmark && (
                    <p className="text-muted-foreground">
                      Landmark: {order.address.landmark}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No address information
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Payment Method
                </p>
                <p className="mt-1 text-sm capitalize">
                  {order.paymentMethod || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Payment Status
                </p>
                <Badge
                  variant={
                    order.paymentStatus === "paid"
                      ? "success"
                      : order.paymentStatus === "failed"
                      ? "destructive"
                      : "warning"
                  }
                  className="mt-1"
                >
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.paystackReference && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Reference
                  </p>
                  <p className="mt-1 text-xs font-mono">
                    {order.paystackReference}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
