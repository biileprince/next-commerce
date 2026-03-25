import { getProducts } from "@/lib/actions/product";
import { Suspense } from "react";
import { Grid } from "@/components/grid";
import { ProductGridItems } from "@/components/product/product-grid-items";
import { Skeleton } from "@/components/ui/skeleton";
import { Collections } from "@/components/layout/search/collections";
import { FilterList } from "@/components/product/filter-list";
import { FilterDropdown } from "@/components/layout/search/filter-dropdown";
import { SORT_OPTIONS } from "@/lib/constants";
import { Footer } from "@/components/layout/footer";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "All Products",
  description: "Browse our collection of quality products",
};

function ProductsSkeleton() {
  return (
    <Grid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full rounded-lg" />
      ))}
    </Grid>
  );
}

async function getCollectionsForMobile() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return [
    { title: "All", path: "/products" },
    ...categories.map((cat) => ({
      title: cat.name,
      path: `/products?category=${cat.slug}`,
    })),
  ];
}

async function ProductsContent({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; category?: string }>;
}) {
  const params = await searchParams;
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

  let products = result.data;

  // Filter by category
  if (params.category) {
    products = products.filter(
      (product) => product.category?.slug === params.category,
    );
  }

  // Sort products
  if (params.sort) {
    switch (params.sort) {
      case "price-asc":
        products = [...products].sort(
          (a, b) => Number(a.price) - Number(b.price),
        );
        break;
      case "price-desc":
        products = [...products].sort(
          (a, b) => Number(b.price) - Number(a.price),
        );
        break;
      case "latest":
        products = [...products].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold mb-2">No products found</h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <Grid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      <ProductGridItems products={products} />
    </Grid>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; category?: string }>;
}) {
  const collections = await getCollectionsForMobile();

  return (
    <>
      {/* Mobile Filters */}
      <div className="sticky top-16 z-10 bg-white px-4 py-3 dark:bg-black md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <Suspense fallback={null}>
            <FilterDropdown list={collections} title="Collections" />
          </Suspense>
          <Suspense fallback={null}>
            <FilterDropdown list={SORT_OPTIONS} title="Sort by" />
          </Suspense>
        </div>
      </div>

      {/* Desktop Three-Column Layout */}
      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-8 px-4 pb-4 text-black md:grid-cols-[200px_1fr_200px] dark:text-white">
        {/* Left Sidebar - Collections (Hidden on mobile) */}
        <div className="hidden md:block">
          <Collections />
        </div>

        {/* Main Content */}
        <div className="order-last min-h-screen md:order-none">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">All Products</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Browse our collection of quality products
            </p>
          </div>

          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsContent searchParams={searchParams} />
          </Suspense>
        </div>

        {/* Right Sidebar - Sort (Hidden on mobile) */}
        <div className="hidden md:block">
          <Suspense fallback={null}>
            <FilterList list={SORT_OPTIONS} title="Sort by" />
          </Suspense>
        </div>
      </div>

      <Footer />
    </>
  );
}
