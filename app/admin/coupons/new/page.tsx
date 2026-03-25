import { requireAdmin } from "@/lib/middleware/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CouponForm } from "@/components/admin/coupon-form";

export default async function NewCouponPage() {
  await requireAdmin();

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <Link
          href="/admin/coupons"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Coupons
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl">Create Coupon</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Add a new discount code for customers
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
          <CardDescription>
            Configure the coupon code and discount rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CouponForm />
        </CardContent>
      </Card>
    </div>
  );
}
