import Link from "next/link";
import { GridTileImage } from "@/components/grid/tile";
import { Product } from "@/types";
import { ProductBadge } from "@/components/product/product-badge";

export function ProductGridItems({ products }: { products: Product[] }) {
  return (
    <>
      {products.map((product) => {
        const hasDiscount =
          product.originalPrice && product.originalPrice > product.price;
        const discountPercentage = hasDiscount
          ? Math.round(
              ((product.originalPrice! - product.price) /
                product.originalPrice!) *
                100
            )
          : 0;

        return (
          <div
            key={product.id}
            className="relative aspect-square h-full w-full group"
          >
            <Link
              className="relative block aspect-square h-full w-full"
              href={`/products/${product.slug}`}
              prefetch={true}
            >
              {/* Badges */}
              {product.stockQuantity === 0 ? (
                <ProductBadge type="sold-out" />
              ) : product.isTop ? (
                <ProductBadge type="top" />
              ) : hasDiscount ? (
                <ProductBadge type="discount" value={discountPercentage} />
              ) : product.isNew ? (
                <ProductBadge type="new" />
              ) : null}

              <GridTileImage
                alt={product.name}
                label={{
                  position: "bottom",
                  title: product.name,
                  amount: product.price,
                  currencyCode: product.currency,
                  originalPrice: product.originalPrice,
                  rating: product.rating,
                  reviewCount: product.reviewCount,
                }}
                src={product.images?.[0]}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </Link>
          </div>
        );
      })}
    </>
  );
}
