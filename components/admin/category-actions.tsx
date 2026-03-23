"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteCategory, toggleCategoryStatus } from "@/lib/actions/category";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface CategoryActionsProps {
  categoryId: string;
  categoryName: string;
  isActive: boolean;
  productCount: number;
}

export function CategoryActions({
  categoryId,
  categoryName,
  isActive,
  productCount,
}: CategoryActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleDelete() {
    if (productCount > 0) {
      toast.error(
        `Cannot delete category with ${productCount} product(s). Remove or reassign products first.`,
      );
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        toast.success("Category deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete category");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleToggleStatus() {
    setIsToggling(true);
    try {
      const result = await toggleCategoryStatus(categoryId);
      if (result.success) {
        toast.success(
          `Category ${result.data?.isActive ? "activated" : "deactivated"}`,
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update category status");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsToggling(false);
    }
  }

  if (showDeleteConfirm) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "..." : "Delete"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteConfirm(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/categories/${categoryId}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleStatus} disabled={isToggling}>
          {isActive ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Deactivate
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setShowDeleteConfirm(true)}
          className="text-destructive focus:text-destructive"
          disabled={productCount > 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
          {productCount > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({productCount} products)
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
