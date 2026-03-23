"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateUserRole } from "@/lib/actions/admin-users";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Shield, ShieldOff } from "lucide-react";

interface UserActionsProps {
  userId: string;
  userName: string;
  currentRole: string;
}

export function UserActions({
  userId,
  userName,
  currentRole,
}: UserActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);

  const isAdmin = currentRole === "admin";
  const newRole = isAdmin ? "customer" : "admin";

  async function handleRoleChange() {
    setIsUpdating(true);
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        toast.success(
          `${userName} is now ${newRole === "admin" ? "an admin" : "a customer"}`,
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update role");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
      setShowRoleConfirm(false);
    }
  }

  if (showRoleConfirm) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant={isAdmin ? "outline" : "default"}
          size="sm"
          onClick={handleRoleChange}
          disabled={isUpdating}
        >
          {isUpdating ? "..." : "Confirm"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRoleConfirm(false)}
          disabled={isUpdating}
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
          <Link href={`/admin/users/${userId}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setShowRoleConfirm(true)}
          disabled={isUpdating}
        >
          {isAdmin ? (
            <>
              <ShieldOff className="mr-2 h-4 w-4" />
              Remove Admin
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Make Admin
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
