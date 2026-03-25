import { requireAdmin } from "@/lib/middleware/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BadgeForm } from "@/components/admin/badge-form";

export default async function NewBadgePage() {
  await requireAdmin();

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <Link
          href="/admin/badges"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Badges
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl">Create Badge</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Add a new badge to highlight products
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Details</CardTitle>
          <CardDescription>
            Configure the badge appearance and label
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BadgeForm />
        </CardContent>
      </Card>
    </div>
  );
}
