"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/lib/actions/admin-users";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff } from "lucide-react";

interface UserRoleToggleProps {
  userId: string;
  userName: string;
  currentRole: string;
}

export function UserRoleToggle({
  userId,
  userName,
  currentRole,
}: UserRoleToggleProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
        <p className="text-sm">
          {isAdmin ? "Remove admin access from" : "Grant admin access to"}{" "}
          <strong>{userName}</strong>?
        </p>
        <Button
          variant={isAdmin ? "outline" : "default"}
          size="sm"
          onClick={handleRoleChange}
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Confirm"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isUpdating}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={isAdmin ? "outline" : "default"}
      onClick={() => setShowConfirm(true)}
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
    </Button>
  );
}
