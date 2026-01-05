"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteProduct, toggleProductStatus } from "@/lib/actions/product";
import { toast } from "sonner";

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteProduct(product.id);
    setLoading(false);

    if (result.success) {
      toast.success("Product deleted successfully");
      setDeleteOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete product");
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    const result = await toggleProductStatus(product.id);
    setLoading(false);

    if (result.success) {
      toast.success(
        `Product ${product.isActive ? "deactivated" : "activated"} successfully`
      );
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update product status");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/products/${product.id}/edit`}>
              <Edit className="size-4" />
              <span className="ml-2">Edit</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/products/${product.slug}`} target="_blank">
              <Eye className="size-4" />
              <span className="ml-2">View</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus} disabled={loading}>
            {product.isActive ? (
              <>
                <EyeOff className="size-4" />
                <span className="ml-2">Deactivate</span>
              </>
            ) : (
              <>
                <Eye className="size-4" />
                <span className="ml-2">Activate</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" />
            <span className="ml-2">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{product.name}"? This action will
              mark the product as inactive and it will no longer appear in the
              store.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
