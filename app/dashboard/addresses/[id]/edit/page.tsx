import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAddress } from "@/lib/actions/address";
import Link from "next/link";
import { EditAddressForm } from "@/components/addresses/edit-address-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EditAddressPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Edit Address",
  description: "Edit your delivery address",
};

export default async function EditAddressPage({
  params,
}: EditAddressPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const result = await getAddress(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const address = result.data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Link
          href="/dashboard/addresses"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-black dark:hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Addresses
        </Link>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Edit Address
        </h1>
        <p className="mt-1 text-neutral-500">
          Update your delivery address information
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Address Details</CardTitle>
          <CardDescription>Make changes to your address below</CardDescription>
        </CardHeader>
        <CardContent>
          <EditAddressForm address={address} />
        </CardContent>
      </Card>
    </div>
  );
}
