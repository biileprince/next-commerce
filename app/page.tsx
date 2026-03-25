import { Suspense } from "react";
import { ThreeItemGrid } from "@/components/grid/three-items";
import { Carousel } from "@/components/carousel";
import { CategoriesSection } from "@/components/categories-section";
import { Footer } from "@/components/layout/footer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  description:
    "High-performance African e-commerce store built with Next.js 16, featuring secure payments with Paystack.",
  openGraph: {
    type: "website",
  },
};

function GridSkeleton() {
  return (
    <section className="mx-auto grid max-w-screen-2xl gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2">
      <div className="md:col-span-4 md:row-span-2">
        <Skeleton className="aspect-square h-full w-full rounded-lg" />
      </div>
      <div className="md:col-span-2 md:row-span-1">
        <Skeleton className="aspect-square h-full w-full rounded-lg" />
      </div>
      <div className="md:col-span-2 md:row-span-1">
        <Skeleton className="aspect-square h-full w-full rounded-lg" />
      </div>
    </section>
  );
}

function CarouselSkeleton() {
  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <div className="flex gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-square h-[30vh] max-h-[275px] w-2/3 max-w-[475px] flex-none rounded-lg md:w-1/3"
          />
        ))}
      </div>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-8">
      <Skeleton className="mb-8 h-10 w-48" />
      <div className="space-y-12">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<GridSkeleton />}>
        <ThreeItemGrid />
      </Suspense>
      <Suspense fallback={<CarouselSkeleton />}>
        <Carousel />
      </Suspense>
      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesSection />
      </Suspense>
      <Footer />
    </>
  );
}
