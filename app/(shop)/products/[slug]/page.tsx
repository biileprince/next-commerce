import { getProductBySlug } from "@/lib/actions/product";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/product/gallery";
import { AddToCart } from "@/components/product/add-to-cart";
import { RelatedProducts } from "@/components/product/related-products";
import { ProductDescription } from "@/components/product/product-description";
import { StockIndicator } from "@/components/product/stock-indicator";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProductRating } from "@/components/product/product-rating";
import { formatPrice } from "@/lib/utils";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    return {
      title: "Product Not Found",
    };
  }

  const product = result.data;

  return {
    title: product.name,
    description: product.description || `Buy ${product.name} online`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images.length > 0 ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;

  // Build breadcrumb
  const breadcrumbItems = [
    {
      label: product.category?.name || "Products",
      href: product.category?.slug
        ? `/search?category=${product.category.slug}`
        : "/products",
    },
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col gap-8 md:flex-row md:gap-12 lg:gap-16">
        {/* Product Images - Left Side */}
        <div className="w-full md:w-1/2">
          <Gallery images={product.images} productName={product.name} />
        </div>

        {/* Product Info - Right Side */}
        <div className="w-full md:w-1/2">
          <div className="space-y-6">
            {/* Category Badge */}
            {product.category && (
              <div className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {product.category.name}
              </div>
            )}

            {/* Title and Rating */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating && product.rating > 0 ? (
                <ProductRating
                  rating={product.rating}
                  reviewCount={product.reviewCount || 0}
                  size="md"
                  showCount={true}
                />
              ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  No reviews yet
                </p>
              )}
            </div>

            {/* Price and Stock */}
            <div className="space-y-3 border-y border-neutral-200 py-6 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold">
                  {formatPrice(product.price, product.currency)}
                </p>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <p className="text-xl font-normal text-neutral-500 line-through dark:text-neutral-400">
                        {formatPrice(product.originalPrice, product.currency)}
                      </p>
                      <span className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white">
                        -
                        {Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100,
                        )}
                        %
                      </span>
                    </>
                  )}
              </div>
              <StockIndicator stockQuantity={product.stockQuantity} />
            </div>

            {/* Short Description (first 200 chars) */}
            {product.description && (
              <div className="text-neutral-600 dark:text-neutral-400">
                <p className="leading-relaxed">
                  {product.description.length > 200
                    ? product.description.slice(0, 200) + "..."
                    : product.description}
                </p>
              </div>
            )}

            {/* Add to Cart */}
            <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
              <Suspense fallback={<Skeleton className="h-24 w-full" />}>
                <AddToCart product={product} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Full Description Section */}
      <div className="mt-12">
        <ProductDescription
          description={product.description ?? undefined}
          specifications={{
            // Placeholder specifications - can be extended per category
            SKU: product.id.slice(0, 8).toUpperCase(),
            Currency: product.currency,
            "Stock Status":
              product.stockQuantity > 0 ? "In Stock" : "Out of Stock",
          }}
        />
      </div>

      {/* Related Products Section */}
      <Suspense
        fallback={
          <div className="mt-12 border-t border-neutral-200 pt-12 dark:border-neutral-800">
            <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
        }
      >
        <RelatedProducts
          categoryId={product.categoryId ?? null}
          currentProductId={product.id}
        />
      </Suspense>
    </div>
  );
}
