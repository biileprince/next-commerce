import { requireAdmin } from "@/lib/middleware/admin";
import { getCategory } from "@/lib/actions/category";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  await requireAdmin();

  const { id } = await params;
  const result = await getCategory(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const category = result.data;

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
        <h1 className="text-2xl font-bold sm:text-3xl">Edit Category</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Update category: {category.name}
        </p>
      </div>

      <CategoryForm initialData={category} />
    </div>
  );
}
