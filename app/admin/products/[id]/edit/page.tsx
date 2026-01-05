import { requireAdmin } from "@/lib/middleware/admin";
import { getAdminProduct } from "@/lib/actions/product";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductForm } from "@/components/admin/product-form";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;

  // Fetch product
  const result = await getAdminProduct(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;

  // Fetch categories for the form
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Edit Product</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Update product information
          </p>
        </div>
      </div>

      {/* Product Form */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Modify the product information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} product={product} />
        </CardContent>
      </Card>
    </div>
  );
}
