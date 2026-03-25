import Link from "next/link";
import { GridTileImage } from "@/components/grid/tile";
import { Product } from "@/types";
import {
  ProductBadge,
  ProductBadges,
} from "@/components/product/product-badge";

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
                100,
            )
          : 0;

        // Determine which badge to show (priority: sold-out > database badges > discount > isTop > isNew)
        const renderBadge = () => {
          if (product.stockQuantity === 0) {
            return <ProductBadge type="sold-out" />;
          }

          // Show database badges if available
          if (product.badges && product.badges.length > 0) {
            return (
              <ProductBadges
                badges={product.badges}
                stockQuantity={product.stockQuantity}
              />
            );
          }

          // Fallback to computed badges
          if (hasDiscount) {
            return <ProductBadge type="discount" value={discountPercentage} />;
          }
          if (product.isTop) {
            return <ProductBadge type="top" />;
          }
          if (product.isNew) {
            return <ProductBadge type="new" />;
          }

          return null;
        };

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
              {renderBadge()}

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
