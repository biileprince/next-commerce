"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toggleCouponStatus, deleteCoupon } from "@/lib/actions/coupons";
import { toast } from "sonner";

interface CouponActionsProps {
  coupon: {
    id: string;
    code: string;
    isActive: boolean;
    _count?: { orders: number };
  };
}

export function CouponActions({ coupon }: CouponActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    toast.success("Coupon code copied to clipboard");
  };

  const handleToggleStatus = () => {
    startTransition(async () => {
      const result = await toggleCouponStatus(coupon.id);
      if (result.success) {
        toast.success(
          `Coupon ${coupon.isActive ? "deactivated" : "activated"}`,
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update coupon");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCoupon(coupon.id);
      if (result.success) {
        toast.success("Coupon deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete coupon");
      }
      setShowDeleteDialog(false);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyCode}>
            <Copy className="mr-2 size-4" />
            Copy Code
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/coupons/${coupon.id}/edit`)}
          >
            <Pencil className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {coupon.isActive ? (
              <>
                <ToggleLeft className="mr-2 size-4" />
                Deactivate
              </>
            ) : (
              <>
                <ToggleRight className="mr-2 size-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={coupon._count && coupon._count.orders > 0}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the coupon &quot;{coupon.code}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
