import { Suspense } from "react";
import { FilterList } from "@/components/product/filter-list";
import { prisma } from "@/lib/prisma";

async function getCollections() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return [
    { title: "All", path: "/search" },
    ...categories.map((cat) => ({
      title: cat.name,
      path: `/search?category=${cat.slug}`,
    })),
  ];
}

async function CollectionList() {
  const collections = await getCollections();
  return <FilterList list={collections} title="Collections" />;
}

const skeleton = "mb-3 h-4 w-5/6 animate-pulse rounded-sm";
const activeAndTitles = "bg-neutral-800 dark:bg-neutral-300";
const items = "bg-neutral-400 dark:bg-neutral-700";

export function Collections() {
  return (
    <Suspense
      fallback={
        <div className="col-span-2 hidden h-[400px] w-full flex-none py-4 lg:block">
          <div className={`${skeleton} ${activeAndTitles}`} />
          <div className={`${skeleton} ${activeAndTitles}`} />
          <div className={`${skeleton} ${items}`} />
          <div className={`${skeleton} ${items}`} />
          <div className={`${skeleton} ${items}`} />
          <div className={`${skeleton} ${items}`} />
          <div className={`${skeleton} ${items}`} />
          <div className={`${skeleton} ${items}`} />
          <div className={`${skeleton} ${items}`} />
          <div className={`${skeleton} ${items}`} />
        </div>
      }
    >
      <CollectionList />
    </Suspense>
  );
}
