"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, UserCheck, AlertTriangle, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUserStatus } from "@/lib/actions/admin-users";
import { toast } from "sonner";

interface UserStatusToggleProps {
  userId: string;
  userName: string;
  currentStatus: string;
}

export function UserStatusToggle({
  userId,
  userName,
  currentStatus,
}: UserStatusToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [targetStatus, setTargetStatus] = useState<"active" | "suspended" | "banned">("active");
  const [reason, setReason] = useState("");

  const handleStatusChange = (status: "active" | "suspended" | "banned") => {
    if (status === "active") {
      // Activate immediately without reason
      startTransition(async () => {
        const result = await updateUserStatus(userId, status);
        if (result.success) {
          toast.success(`${userName} has been activated`);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update user status");
        }
      });
    } else {
      // Show dialog for suspend/ban with reason
      setTargetStatus(status);
      setReason("");
      setShowDialog(true);
    }
  };

  const confirmStatusChange = () => {
    startTransition(async () => {
      const result = await updateUserStatus(userId, targetStatus, reason);
      if (result.success) {
        toast.success(
          `${userName} has been ${targetStatus === "suspended" ? "suspended" : "banned"}`
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update user status");
      }
      setShowDialog(false);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {currentStatus === "active" ? (
              <>
                <UserCheck className="mr-2 size-4 text-green-500" />
                Active
              </>
            ) : currentStatus === "suspended" ? (
              <>
                <AlertTriangle className="mr-2 size-4 text-yellow-500" />
                Suspended
              </>
            ) : (
              <>
                <Ban className="mr-2 size-4 text-red-500" />
                Banned
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleStatusChange("active")}
            disabled={currentStatus === "active"}
          >
            <UserCheck className="mr-2 size-4 text-green-500" />
            Activate User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleStatusChange("suspended")}
            disabled={currentStatus === "suspended"}
            className="text-yellow-600 focus:text-yellow-600"
          >
            <AlertTriangle className="mr-2 size-4" />
            Suspend User
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange("banned")}
            disabled={currentStatus === "banned"}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="mr-2 size-4" />
            Ban User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {targetStatus === "suspended" ? "Suspend" : "Ban"} User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {targetStatus === "suspended" ? "suspend" : "ban"}{" "}
              <span className="font-semibold">{userName}</span>?
              {targetStatus === "banned" && (
                <span className="block mt-2 text-destructive">
                  Banned users will not be able to access their account or make purchases.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Enter reason for ${targetStatus === "suspended" ? "suspension" : "ban"}...`}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className={
                targetStatus === "banned"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-yellow-600 text-white hover:bg-yellow-700"
              }
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {targetStatus === "suspended" ? "Suspend" : "Ban"} User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
