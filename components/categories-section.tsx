import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductGridItems } from "@/components/product/product-grid-items";
import { convertProduct } from "@/types";
import { ArrowRight } from "lucide-react";

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
    <section className="mx-auto max-w-screen-2xl px-4 py-12">
      {/* Section Header */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
          Shop by Category
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
          Explore our curated collections and find exactly what you're looking
          for
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-16">
        {categories.map((category, index) => (
          <div key={category.id} className="relative">
            {/* Category Header Card */}
            <div
              className={`mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r p-6 sm:flex-row sm:items-center sm:justify-between ${
                index % 2 === 0
                  ? "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
                  : "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Category Image/Icon */}
                {category.image ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white ${
                      index % 2 === 0 ? "bg-blue-500" : "bg-amber-500"
                    }`}
                  >
                    {category.name.charAt(0)}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold sm:text-2xl">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {category.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-neutral-500">
                    {category.products.length}{" "}
                    {category.products.length === 1 ? "product" : "products"}{" "}
                    available
                  </p>
                </div>
              </div>

              <Link
                href={`/products?category=${category.slug}`}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:gap-3 ${
                  index % 2 === 0
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <ProductGridItems
                products={category.products.map(convertProduct)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
