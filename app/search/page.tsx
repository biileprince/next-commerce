import { getProducts } from "@/lib/actions/product";
import { Suspense } from "react";
import { Grid } from "@/components/grid";
import { ProductGridItems } from "@/components/product/product-grid-items";
import { FilterList } from "@/components/product/filter-list";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Search",
  description: "Search for products",
};

function SearchSkeleton() {
  return (
    <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full rounded-lg" />
      ))}
    </Grid>
  );
}

async function SearchResults({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string };
}) {
  const result = await getProducts();

  if (!result.success || !result.data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-neutral-500">Failed to load products</p>
      </div>
    );
  }

  let products = result.data;

  // Filter by search query
  if (searchParams.q) {
    const query = searchParams.q.toLowerCase();
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );
  }

  // Sort products
  if (searchParams.sort) {
    switch (searchParams.sort) {
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold mb-2">No products found</h2>
          <p className="text-neutral-500">
            {searchParams.q
              ? `Try searching for something else`
              : "No products available"}
          </p>
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-8">
        {params.q ? (
          <>
            <h1 className="text-3xl font-bold tracking-tight">
              Search results for &quot;{params.q}&quot;
            </h1>
            <p className="mt-2 text-neutral-500">
              Showing products matching your search
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
            <p className="mt-2 text-neutral-500">
              Browse our entire collection
            </p>
          </>
        )}
      </div>

      <FilterList />

      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults searchParams={params} />
      </Suspense>
    </div>
  );
}
