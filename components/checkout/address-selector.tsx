"use client";

import { Address } from "@/types";
import { useState } from "react";
import { AddressForm } from "./address-form";
import { Plus } from "lucide-react";

export function AddressSelector({
  addresses,
  selectedId,
  onSelect,
}: {
  addresses: Address[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
        <h2 className="mb-4 text-xl font-semibold">Add Delivery Address</h2>
        <AddressForm onSuccess={() => setShowForm(false)} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Delivery Address</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="py-8 text-center">
          <p className="mb-4 text-neutral-500">No addresses saved</p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={`flex cursor-pointer gap-3 rounded-md border p-4 transition-colors ${
                selectedId === address.id
                  ? "border-black bg-neutral-50 dark:border-white dark:bg-neutral-900"
                  : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              }`}
            >
              <input
                type="radio"
                name="address"
                value={address.id}
                checked={selectedId === address.id}
                onChange={() => onSelect(address.id)}
                className="mt-1 h-4 w-4"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{address.fullName}</span>
                  {address.isDefault && (
                    <span className="rounded bg-neutral-200 px-2 py-0.5 text-xs dark:bg-neutral-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {address.city}, {address.region}
                  {address.district && ` (${address.district})`}
                </p>
                {address.landmark && (
                  <p className="text-sm text-neutral-500">
                    Landmark: {address.landmark}
                  </p>
                )}
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {address.phoneNumber}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
