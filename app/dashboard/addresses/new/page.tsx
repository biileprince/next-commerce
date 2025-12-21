import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { AddressForm } from "@/components/checkout/address-form";

export const metadata = {
  title: "Add New Address",
  description: "Add a new delivery address",
};

export default async function NewAddressPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard/addresses"
          className="mb-4 inline-flex items-center text-sm hover:underline"
        >
          ← Back to Addresses
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Address</h1>
        <p className="mt-2 text-neutral-500">
          Add a new delivery address to your account
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black">
        <AddressForm redirectTo="/dashboard/addresses" />
      </div>
    </div>
  );
}
