"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCoupon, updateCoupon } from "@/lib/actions/coupons";
import { toast } from "sonner";
import { Decimal } from "@prisma/client/runtime/library";

interface CouponFormProps {
  coupon?: {
    id: string;
    code: string;
    description: string | null;
    discountType: string;
    discountValue: Decimal;
    minimumOrder: Decimal | null;
    maximumDiscount: Decimal | null;
    usageLimit: number | null;
    perUserLimit: number;
    freeShipping: boolean;
    startsAt: Date;
    expiresAt: Date | null;
  };
}

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!coupon;

  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    autoGenerate: false,
    description: coupon?.description || "",
    discountType: coupon?.discountType || "percentage",
    discountValue: coupon ? Number(coupon.discountValue).toString() : "",
    minimumOrder: coupon?.minimumOrder
      ? Number(coupon.minimumOrder).toString()
      : "",
    maximumDiscount: coupon?.maximumDiscount
      ? Number(coupon.maximumDiscount).toString()
      : "",
    usageLimit: coupon?.usageLimit?.toString() || "",
    perUserLimit: coupon?.perUserLimit?.toString() || "1",
    freeShipping: coupon?.freeShipping || false,
    startsAt: coupon?.startsAt
      ? new Date(coupon.startsAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    expiresAt: coupon?.expiresAt
      ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
      : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    form.append("code", formData.code);
    form.append("autoGenerate", formData.autoGenerate.toString());
    form.append("description", formData.description);
    form.append("discountType", formData.discountType);
    form.append("discountValue", formData.discountValue);
    form.append("minimumOrder", formData.minimumOrder);
    form.append("maximumDiscount", formData.maximumDiscount);
    form.append("usageLimit", formData.usageLimit);
    form.append("perUserLimit", formData.perUserLimit);
    form.append("freeShipping", formData.freeShipping.toString());
    form.append("startsAt", formData.startsAt);
    form.append("expiresAt", formData.expiresAt);

    startTransition(async () => {
      const result = isEdit
        ? await updateCoupon(coupon.id, form)
        : await createCoupon(form);

      if (result.success) {
        toast.success(`Coupon ${isEdit ? "updated" : "created"} successfully`);
        router.push("/admin/coupons");
        router.refresh();
      } else {
        toast.error(
          result.error || `Failed to ${isEdit ? "update" : "create"} coupon`,
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Code */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">
            Coupon Code {!isEdit && <span className="text-destructive">*</span>}
          </Label>
          <div className="flex gap-2">
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g., SAVE20"
              disabled={isEdit || formData.autoGenerate}
              className="font-mono"
            />
            {!isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    ...formData,
                    autoGenerate: !formData.autoGenerate,
                    code: "",
                  })
                }
              >
                <Sparkles className="mr-2 size-4" />
                {formData.autoGenerate ? "Manual" : "Auto"}
              </Button>
            )}
          </div>
          {formData.autoGenerate && (
            <p className="text-xs text-muted-foreground">
              A random code will be generated automatically
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g., Summer sale discount"
            rows={2}
          />
        </div>
      </div>

      {/* Discount */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="discountType">Discount Type</Label>
          <Select
            value={formData.discountType}
            onValueChange={(value) =>
              setFormData({ ...formData, discountType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount (GHS)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountValue">
            Discount Value <span className="text-destructive">*</span>
          </Label>
          <Input
            id="discountValue"
            type="number"
            step="0.01"
            min="0"
            max={formData.discountType === "percentage" ? "100" : undefined}
            value={formData.discountValue}
            onChange={(e) =>
              setFormData({ ...formData, discountValue: e.target.value })
            }
            placeholder={
              formData.discountType === "percentage" ? "e.g., 20" : "e.g., 50"
            }
            required
          />
        </div>
      </div>

      {/* Limits */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="minimumOrder">Minimum Order (GHS)</Label>
          <Input
            id="minimumOrder"
            type="number"
            step="0.01"
            min="0"
            value={formData.minimumOrder}
            onChange={(e) =>
              setFormData({ ...formData, minimumOrder: e.target.value })
            }
            placeholder="e.g., 100"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for no minimum
          </p>
        </div>

        {formData.discountType === "percentage" && (
          <div className="space-y-2">
            <Label htmlFor="maximumDiscount">Maximum Discount (GHS)</Label>
            <Input
              id="maximumDiscount"
              type="number"
              step="0.01"
              min="0"
              value={formData.maximumDiscount}
              onChange={(e) =>
                setFormData({ ...formData, maximumDiscount: e.target.value })
              }
              placeholder="e.g., 50"
            />
            <p className="text-xs text-muted-foreground">
              Cap for percentage discounts
            </p>
          </div>
        )}
      </div>

      {/* Usage */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Total Usage Limit</Label>
          <Input
            id="usageLimit"
            type="number"
            min="0"
            value={formData.usageLimit}
            onChange={(e) =>
              setFormData({ ...formData, usageLimit: e.target.value })
            }
            placeholder="e.g., 100"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for unlimited
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="perUserLimit">Per User Limit</Label>
          <Input
            id="perUserLimit"
            type="number"
            min="1"
            value={formData.perUserLimit}
            onChange={(e) =>
              setFormData({ ...formData, perUserLimit: e.target.value })
            }
            placeholder="1"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Start Date</Label>
          <Input
            id="startsAt"
            type="datetime-local"
            value={formData.startsAt}
            onChange={(e) =>
              setFormData({ ...formData, startsAt: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expiry Date</Label>
          <Input
            id="expiresAt"
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) =>
              setFormData({ ...formData, expiresAt: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for no expiry
          </p>
        </div>
      </div>

      {/* Free Shipping */}
      <div className="flex items-center space-x-2">
        <Switch
          id="freeShipping"
          checked={formData.freeShipping}
          onCheckedChange={(checked: boolean) =>
            setFormData({ ...formData, freeShipping: checked })
          }
        />
        <Label htmlFor="freeShipping">Include Free Shipping</Label>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEdit ? "Update Coupon" : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
}
