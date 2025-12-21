"use client";

import { Address } from "@/types";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/address";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddressCard({ address }: { address: Address }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteAddress(address.id);
      if (result.success) {
        toast.success("Address deleted");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete address");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSetDefault() {
    setIsSettingDefault(true);
    try {
      const result = await setDefaultAddress(address.id);
      if (result.success) {
        toast.success("Default address updated");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to set default address");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSettingDefault(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="font-semibold">{address.fullName}</p>
          {address.isDefault && (
            <span className="mt-1 inline-block rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              Default
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>
          {address.city}, {address.region}
        </p>
        {address.district && <p>District: {address.district}</p>}
        {address.landmark && <p>Landmark: {address.landmark}</p>}
        <p className="pt-2">{address.phoneNumber}</p>
      </div>

      <div className="flex gap-2">
        {!address.isDefault && (
          <button
            onClick={handleSetDefault}
            disabled={isSettingDefault}
            className="flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            {isSettingDefault ? "Setting..." : "Set Default"}
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
