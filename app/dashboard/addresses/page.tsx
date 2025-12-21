import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAddresses } from "@/lib/actions/address";
import Link from "next/link";
import { AddressCard } from "@/components/addresses/address-card";

export const metadata = {
  title: "Manage Addresses",
  description: "Manage your delivery addresses",
};

export default async function AddressesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const result = await getAddresses();
  const addresses = result.success ? result.data || [] : [];

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center text-sm hover:underline"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Delivery Addresses
          </h1>
          <p className="mt-2 text-neutral-500">
            Manage your saved delivery addresses
          </p>
        </div>
        <Link
          href="/dashboard/addresses/new"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Add New Address
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-black">
          <span className="text-6xl">📍</span>
          <h2 className="mt-4 text-xl font-semibold">No saved addresses</h2>
          <p className="mt-2 text-neutral-500">
            Add a delivery address to make checkout faster
          </p>
          <Link
            href="/dashboard/addresses/new"
            className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Add Your First Address
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}
    </div>
  );
}
