import { requireAdmin } from "@/lib/middleware/admin";
import { getBadge } from "@/lib/actions/badges";
import { notFound } from "next/navigation";
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

interface EditBadgePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBadgePage({ params }: EditBadgePageProps) {
  await requireAdmin();

  const { id } = await params;
  const result = await getBadge(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const badge = result.data;

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
        <h1 className="text-2xl font-bold sm:text-3xl">Edit Badge</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Update badge appearance and label
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Details</CardTitle>
          <CardDescription>Modify the badge configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <BadgeForm badge={badge} />
        </CardContent>
      </Card>
    </div>
  );
}
