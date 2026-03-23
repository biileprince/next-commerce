"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAddress } from "@/lib/actions/address";
import { toast } from "sonner";
import { Address } from "@/types";

const ghanaRegions = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
  "Volta",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Western North",
  "Oti",
  "North East",
  "Savannah",
];

interface EditAddressFormProps {
  address: Address;
}

export function EditAddressForm({ address }: EditAddressFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: address.fullName,
    phoneNumber: address.phoneNumber,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || "",
    city: address.city,
    region: address.region,
    district: address.district || "",
    landmark: address.landmark || "",
    isDefault: address.isDefault,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateAddress(address.id, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || undefined,
        city: formData.city,
        region: formData.region,
        district: formData.district || undefined,
        landmark: formData.landmark || undefined,
        isDefault: formData.isDefault,
      });

      if (result.success) {
        toast.success("Address updated successfully");
        router.push("/dashboard/addresses");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update address");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
            placeholder="Enter recipient's full name"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="phoneNumber"
            className="mb-2 block text-sm font-medium"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
            placeholder="e.g., 0241234567"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="addressLine1"
            className="mb-2 block text-sm font-medium"
          >
            Address Line 1
          </label>
          <input
            type="text"
            id="addressLine1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
            placeholder="Street address, building name"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="addressLine2"
            className="mb-2 block text-sm font-medium"
          >
            Address Line 2 <span className="text-neutral-400">(Optional)</span>
          </label>
          <input
            type="text"
            id="addressLine2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
            placeholder="Apartment, suite, unit (optional)"
          />
        </div>

        <div>
          <label htmlFor="city" className="mb-2 block text-sm font-medium">
            City / Town
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
            placeholder="Enter city or town"
          />
        </div>

        <div>
          <label htmlFor="region" className="mb-2 block text-sm font-medium">
            Region
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
          >
            <option value="">Select region</option>
            {ghanaRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="district" className="mb-2 block text-sm font-medium">
            District <span className="text-neutral-400">(Optional)</span>
          </label>
          <input
            type="text"
            id="district"
            name="district"
            value={formData.district}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
            placeholder="Enter district"
          />
        </div>

        <div>
          <label htmlFor="landmark" className="mb-2 block text-sm font-medium">
            Landmark <span className="text-neutral-400">(Optional)</span>
          </label>
          <input
            type="text"
            id="landmark"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-white"
            placeholder="Near a known location"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black dark:border-neutral-700 dark:bg-neutral-900"
        />
        <label htmlFor="isDefault" className="text-sm">
          Set as default address
        </label>
      </div>

      <div className="flex gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-lg border border-neutral-200 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
