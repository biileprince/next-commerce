import { getProductBySlug } from "@/lib/actions/product";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/product/gallery";
import { AddToCart } from "@/components/product/add-to-cart";
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

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row md:gap-12 lg:gap-16">
        {/* Product Images - Left Side */}
        <div className="w-full md:w-1/2">
          <Gallery images={product.images} productName={product.name} />
        </div>

        {/* Product Info - Right Side */}
        <div className="w-full md:w-1/2">
          <div className="space-y-6">
            {/* Title and Price */}
            <div className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                {product.name}
              </h1>
              <div className="mt-4">
                <p className="text-2xl font-semibold">
                  {formatPrice(product.price, product.currency)}
                </p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {product.description}
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
    </div>
  );
}
