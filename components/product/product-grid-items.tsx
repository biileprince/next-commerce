import Link from "next/link";
import { GridTileImage } from "@/components/grid/tile";
import { Product } from "@/types";

export function ProductGridItems({ products }: { products: Product[] }) {
  return (
    <>
      {products.map((product) => (
        <div
          key={product.id}
          className="relative aspect-square h-full w-full group"
        >
          <Link
            className="relative block aspect-square h-full w-full"
            href={`/products/${product.slug}`}
            prefetch={true}
          >
            <GridTileImage
              alt={product.name}
              label={{
                position: "bottom",
                title: product.name,
                amount: product.price,
                currencyCode: product.currency,
              }}
              src={product.images?.[0]}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          </Link>
        </div>
      ))}
    </>
  );
}
