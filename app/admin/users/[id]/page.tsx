import { requireAdmin } from "@/lib/middleware/admin";
import { getAdminUser } from "@/lib/actions/admin-users";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRoleToggle } from "@/components/admin/user-role-toggle";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({
  params,
}: UserDetailPageProps) {
  await requireAdmin();

  const { id } = await params;
  const result = await getAdminUser(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const user = result.data;

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/users"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>
          <h1 className="text-2xl font-bold sm:text-3xl">{user.name}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {user.email}
          </p>
        </div>
        <UserRoleToggle
          userId={user.id}
          userName={user.name}
          currentRole={user.role}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user._count?.orders || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatPrice(user.stats?.totalSpent || 0, "NGN")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saved Addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user._count?.addresses || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Member Since</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {new Date(user.createdAt).toLocaleDateString("en-NG", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-2xl font-bold dark:bg-neutral-800">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    user.name?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <Badge
                    variant={user.role === "admin" ? "default" : "outline"}
                  >
                    {user.role === "admin" ? "Admin" : "Customer"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{user.email}</p>
                    {user.emailVerified ? (
                      <Badge variant="success" className="text-xs">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>

                {user.phoneNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{user.phoneNumber}</p>
                      {user.phoneNumberVerified ? (
                        <Badge variant="success" className="text-xs">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>
                {user.addresses?.length || 0} address(es)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{address.fullName}</p>
                        {address.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        {address.addressLine1}, {address.city}, {address.region}
                      </p>
                      <p className="text-muted-foreground">
                        {address.phoneNumber}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No saved addresses
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Last 10 orders placed by this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.orders && user.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.orders.map((order) => {
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
                              {order.items?.length || 0} item(s)
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.paymentStatus === "paid"
                                  ? "success"
                                  : "secondary"
                              }
                            >
                              {order.paymentStatus === "paid"
                                ? "Paid"
                                : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(Number(order.totalAmount), order.currency)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No orders yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
