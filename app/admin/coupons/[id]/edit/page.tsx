import { requireAdmin } from "@/lib/middleware/admin";
import { getCoupon } from "@/lib/actions/coupons";
import { notFound } from "next/navigation";
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

interface EditCouponPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  await requireAdmin();

  const { id } = await params;
  const result = await getCoupon(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const coupon = result.data;

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
        <h1 className="text-2xl font-bold sm:text-3xl">Edit Coupon</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Update coupon code:{" "}
          <span className="font-mono font-semibold">{coupon.code}</span>
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
          <CardDescription>Modify the coupon configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <CouponForm coupon={coupon} />
        </CardContent>
      </Card>
    </div>
  );
}
