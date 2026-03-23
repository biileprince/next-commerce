import { requireAdmin } from "@/lib/middleware/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";

export default async function NewCategoryPage() {
  await requireAdmin();

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <Link
          href="/admin/categories"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl">New Category</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Create a new product category
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
