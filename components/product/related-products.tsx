import { getProductsByCategory } from "@/lib/actions/product";
import Link from "next/link";
import { GridTileImage } from "@/components/grid/tile";
import { ProductLabel } from "@/components/grid/product-label";

export async function RelatedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId: string | null;
  currentProductId: string;
}) {
  if (!categoryId) return null;

  const result = await getProductsByCategory(categoryId, 8);

  if (!result.success || !result.data) return null;

  // Filter out current product and limit to 4 items
  const relatedProducts = result.data
    .filter((p) => p.id !== currentProductId)
    .slice(0, 4);

  if (relatedProducts.length === 0) return null;

  return (
    <div className="border-t border-neutral-200 pt-12 dark:border-neutral-800">
      <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group"
          >
            <GridTileImage
              alt={product.name}
              label={{
                title: product.name,
                amount: product.price,
                currencyCode: product.currency,
                originalPrice: product.originalPrice,
                rating: product.rating,
                reviewCount: product.reviewCount,
              }}
              src={product.images[0] || "/placeholder-product.png"}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
