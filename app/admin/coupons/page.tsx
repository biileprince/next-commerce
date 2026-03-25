import { requireAdmin } from "@/lib/middleware/admin";
import { getCoupons } from "@/lib/actions/coupons";
import Link from "next/link";
import { Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { CouponActions } from "@/components/admin/coupon-actions";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function AdminCouponsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const status = (params.status || "all") as
    | "all"
    | "active"
    | "inactive"
    | "expired";

  const result = await getCoupons(page, 10, search, status);
  const coupons = result.success ? result.data : [];
  const pagination = result.success ? result.pagination : null;

  const now = new Date();

  const getCouponStatus = (coupon: {
    isActive: boolean;
    expiresAt: Date | null;
  }) => {
    if (!coupon.isActive) {
      return { label: "Inactive", variant: "secondary" as const };
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return { label: "Expired", variant: "destructive" as const };
    }
    return { label: "Active", variant: "success" as const };
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Coupons</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage discount codes and promotions
          </p>
        </div>
        <Link href="/admin/coupons/new">
          <Button>
            <Plus className="mr-2 size-4" />
            Create Coupon
          </Button>
        </Link>
      </div>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="size-5" />
            All Coupons
          </CardTitle>
          <CardDescription>
            {pagination?.total || 0} coupon(s) total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coupons && coupons.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => {
                    const statusInfo = getCouponStatus(coupon);
                    return (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div>
                            <span className="font-mono font-semibold">
                              {coupon.code}
                            </span>
                            {coupon.description && (
                              <p className="text-xs text-muted-foreground">
                                {coupon.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">
                              {coupon.discountType === "percentage"
                                ? `${Number(coupon.discountValue)}%`
                                : `GH\u20B5${Number(coupon.discountValue).toFixed(2)}`}
                            </span>
                            {coupon.freeShipping && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Free Shipping
                              </Badge>
                            )}
                          </div>
                          {coupon.minimumOrder && (
                            <p className="text-xs text-muted-foreground">
                              Min: GH\u20B5
                              {Number(coupon.minimumOrder).toFixed(2)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span>
                            {coupon.usageCount}
                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                          </span>
                        </TableCell>
                        <TableCell>
                          {coupon.expiresAt ? (
                            <span
                              className={
                                coupon.expiresAt < now ? "text-destructive" : ""
                              }
                            >
                              {new Date(coupon.expiresAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <CouponActions coupon={coupon} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Ticket className="mx-auto size-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No coupons yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first coupon to offer discounts to customers.
              </p>
              <Link href="/admin/coupons/new">
                <Button className="mt-4">
                  <Plus className="mr-2 size-4" />
                  Create Coupon
                </Button>
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Link
                href={`/admin/coupons?page=${page - 1}&search=${search}&status=${status}`}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              >
                <Button variant="outline" size="sm" disabled={page <= 1}>
                  Previous
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              <Link
                href={`/admin/coupons?page=${page + 1}&search=${search}&status=${status}`}
                className={
                  page >= pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
