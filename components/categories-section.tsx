import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Grid } from "@/components/grid";
import { ProductGridItems } from "@/components/product/product-grid-items";
import { convertProduct } from "@/types";

async function getCategoriesWithProducts() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      products: {
        where: { isActive: true },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          badges: {
            include: {
              badge: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories.filter((cat) => cat.products.length > 0);
}

export async function CategoriesSection() {
  const categories = await getCategoriesWithProducts();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Shop by Category
        </h2>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          Browse our collections
        </p>
      </div>

      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{category.name}</h3>
                {category.description && (
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {category.description}
                  </p>
                )}
              </div>
              <Link
                href={`/products?category=${category.slug}`}
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                View all
              </Link>
            </div>

            <Grid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              <ProductGridItems products={category.products.map(convertProduct)} />
            </Grid>
          </div>
        ))}
      </div>
    </section>
  );
}
