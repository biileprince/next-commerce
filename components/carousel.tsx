import Link from "next/link";
import { GridTileImage } from "@/components/grid/tile";
import { getProducts } from "@/lib/actions/product";

export async function Carousel() {
  const result = await getProducts();

  if (!result.success || !result.data?.length) return null;

  const products = result.data;

  // Duplicate products to create infinite scroll effect
  const carouselProducts = [...products, ...products, ...products];

  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex animate-carousel gap-4">
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.slug}${i}`}
            className="relative aspect-3/4 h-[42vh] max-h-136 w-1/2 max-w-72 flex-none md:w-1/5"
          >
            <Link
              href={`/products/${product.slug}`}
              className="relative h-full w-full"
            >
              <GridTileImage
                alt={product.name}
                label={{
                  title: product.name,
                  amount: product.price,
                  currencyCode: product.currency,
                }}
                src={product.images?.[0]}
                fill
                imageFit="contain"
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 28vw, 50vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
