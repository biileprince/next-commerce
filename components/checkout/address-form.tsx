"use client";

import { useState } from "react";
import { createAddress } from "@/lib/actions/address";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AddressForm({
  onSuccess,
  redirectTo,
}: {
  onSuccess?: () => void;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      addressLine1: formData.get("addressLine1") as string,
      addressLine2: (formData.get("addressLine2") as string) || undefined,
      city: formData.get("city") as string,
      region: formData.get("region") as string,
      district: (formData.get("district") as string) || undefined,
      landmark: (formData.get("landmark") as string) || undefined,
      isDefault: formData.get("isDefault") === "on",
    };

    try {
      const result = await createAddress(data);
      if (result.success) {
        toast.success("Address added successfully");
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
          onSuccess?.();
        }
      } else {
        toast.error(result.error || "Failed to add address");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
          />
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="mb-2 block text-sm font-medium"
          >
            Phone Number *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            required
            placeholder="+233..."
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="addressLine1"
          className="mb-2 block text-sm font-medium"
        >
          Address Line 1 *
        </label>
        <input
          type="text"
          id="addressLine1"
          name="addressLine1"
          required
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
        />
      </div>

      <div>
        <label
          htmlFor="addressLine2"
          className="mb-2 block text-sm font-medium"
        >
          Address Line 2
        </label>
        <input
          type="text"
          id="addressLine2"
          name="addressLine2"
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="mb-2 block text-sm font-medium">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
          />
        </div>

        <div>
          <label htmlFor="region" className="mb-2 block text-sm font-medium">
            Region *
          </label>
          <select
            id="region"
            name="region"
            required
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
          >
            <option value="">Select Region</option>
            <option value="Greater Accra">Greater Accra</option>
            <option value="Ashanti">Ashanti</option>
            <option value="Western">Western</option>
            <option value="Eastern">Eastern</option>
            <option value="Central">Central</option>
            <option value="Volta">Volta</option>
            <option value="Northern">Northern</option>
            <option value="Upper East">Upper East</option>
            <option value="Upper West">Upper West</option>
            <option value="Bono">Bono</option>
            <option value="Bono East">Bono East</option>
            <option value="Ahafo">Ahafo</option>
            <option value="Savannah">Savannah</option>
            <option value="North East">North East</option>
            <option value="Oti">Oti</option>
            <option value="Western North">Western North</option>
          </select>
        </div>

        <div>
          <label htmlFor="district" className="mb-2 block text-sm font-medium">
            District
          </label>
          <input
            type="text"
            id="district"
            name="district"
            placeholder="E.g., Accra Metropolitan"
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="landmark" className="mb-2 block text-sm font-medium">
          Landmark
        </label>
        <input
          type="text"
          id="landmark"
          name="landmark"
          placeholder="E.g., Near Kantamanto Market"
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          className="h-4 w-4 rounded"
        />
        <label htmlFor="isDefault" className="text-sm">
          Set as default address
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {isSubmitting ? "Saving..." : "Save Address"}
        </button>
        {onSuccess && (
          <button
            type="button"
            onClick={onSuccess}
            className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
