import { getProducts } from "@/lib/actions/product";
import { Suspense } from "react";
import { Grid } from "@/components/grid";
import { ProductGridItems } from "@/components/product/product-grid-items";
import { FilterList } from "@/components/product/filter-list";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "All Products",
  description: "Browse our collection of quality products",
};

function ProductsSkeleton() {
  return (
    <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full rounded-lg" />
      ))}
    </Grid>
  );
}

async function ProductsContent() {
  const result = await getProducts();

  if (!result.success || !result.data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load products</p>
        </div>
      </div>
    );
  }

  const products = result.data;

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold mb-2">No products yet</h2>
          <p className="text-neutral-500">Check back soon for new items!</p>
        </div>
      </div>
    );
  }

  return (
    <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <ProductGridItems products={products} />
    </Grid>
  );
}

export default async function ProductsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
        <p className="mt-2 text-neutral-500">
          Browse our collection of quality products
        </p>
      </div>

      <FilterList />

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
