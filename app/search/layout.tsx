import { Footer } from "@/components/layout/footer";
import { Collections } from "@/components/layout/search/collections";
import { FilterList } from "@/components/product/filter-list";
import { FilterDropdown } from "@/components/layout/search/filter-dropdown";
import { SORT_OPTIONS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

async function getCollectionsForMobile() {
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

export default async function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collections = await getCollectionsForMobile();

  return (
    <>
      {/* Mobile Filters */}
      <div className="sticky top-16 z-10 bg-white px-4 py-3 dark:bg-black md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <FilterDropdown list={collections} title="Collections" />
          <FilterDropdown list={SORT_OPTIONS} title="Sort by" />
        </div>
      </div>

      {/* Desktop Three-Column Layout */}
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 pb-4 text-black md:flex-row dark:text-white">
        <div className="order-first w-full flex-none md:max-w-[200px] hidden md:block">
          <Collections />
        </div>
        <div className="order-last min-h-screen w-full md:order-none">
          {children}
        </div>
        <div className="order-none flex-none md:order-last md:w-[200px] hidden md:block">
          <FilterList list={SORT_OPTIONS} title="Sort by" />
        </div>
      </div>
      <Footer />
    </>
  );
}
