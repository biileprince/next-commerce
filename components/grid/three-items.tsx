import Link from "next/link";
import { GridTileImage } from "@/components/grid/tile";
import { getProducts } from "@/lib/actions/product";
import { Product } from "@/types";
import { unstable_noStore as noStore } from "next/cache";

function ThreeItemGridItem({
  item,
  size,
  priority,
}: {
  item: Product;
  size: "full" | "half";
  priority?: boolean;
}) {
  return (
    <div
      className={
        size === "full"
          ? "md:col-span-4 md:row-span-2"
          : "md:col-span-2 md:row-span-1"
      }
    >
      <Link
        className="relative block aspect-square h-full w-full"
        href={`/products/${item.slug}`}
        prefetch={true}
      >
        <GridTileImage
          src={item.images?.[0]}
          fill
          sizes={
            size === "full"
              ? "(min-width: 768px) 66vw, 100vw"
              : "(min-width: 768px) 33vw, 100vw"
          }
          priority={priority}
          imageFit={size === "full" ? "contain-tight" : "contain"}
          imageContainerClass={
            size === "full" ? "h-[70%] aspect-auto md:h-[70%]" : undefined
          }
          alt={item.name}
          label={{
            position: size === "full" ? "center" : "bottom",
            title: item.name,
            amount: item.price,
            currencyCode: item.currency,
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  noStore();

  const result = await getProducts();

  if (!result.success || !result.data?.length) {
    return null;
  }

  const products = result.data;

  // Need at least 3 products
  if (!products[0] || !products[1] || !products[2]) return null;

  // Rotate hero products every 5 minutes and evaluate on each request.
  const rotationWindow = Math.floor(Date.now() / (5 * 60 * 1000));
  const totalProducts = products.length;

  const firstIndex = rotationWindow % totalProducts;
  let secondIndex = (rotationWindow * 7 + 3) % totalProducts;
  let thirdIndex = (rotationWindow * 13 + 11) % totalProducts;

  if (secondIndex === firstIndex) {
    secondIndex = (secondIndex + 1) % totalProducts;
  }

  while (thirdIndex === firstIndex || thirdIndex === secondIndex) {
    thirdIndex = (thirdIndex + 1) % totalProducts;
  }

  const dynamicProducts = [
    products[firstIndex],
    products[secondIndex],
    products[thirdIndex],
  ];

  const [firstProduct, secondProduct, thirdProduct] = dynamicProducts;

  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 md:min-h-110 lg:min-h-125">
      <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" item={thirdProduct} />
    </section>
  );
}
