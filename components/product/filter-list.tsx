"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export type ListItem = SortFilterItem | PathFilterItem;
export type SortFilterItem = { title: string; slug: string | null };
export type PathFilterItem = { title: string; path: string };

function PathFilterItem({ item }: { item: PathFilterItem }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract category from the item path
  const itemUrl = new URL(item.path, "http://localhost");
  const itemCategory = itemUrl.searchParams.get("category");
  const currentCategory = searchParams.get("category");

  // Check if active based on category match
  const active = itemCategory === currentCategory ||
    (item.path === "/products" && !currentCategory);

  // Build new URL preserving sort param
  const newParams = new URLSearchParams();
  const currentSort = searchParams.get("sort");
  if (itemCategory) {
    newParams.set("category", itemCategory);
  }
  if (currentSort) {
    newParams.set("sort", currentSort);
  }

  const href = `/products${newParams.toString() ? `?${newParams.toString()}` : ""}`;
  const DynamicTag = active ? "p" : Link;

  return (
    <li className="mt-2 flex text-neutral-900 dark:text-white" key={item.title}>
      <DynamicTag
        href={href}
        className={`w-full text-sm font-medium underline-offset-4 transition-colors hover:text-blue-600 hover:underline dark:hover:text-blue-400 ${
          active
            ? "font-semibold text-blue-600 underline dark:text-blue-400"
            : ""
        }`}
      >
        {item.title}
      </DynamicTag>
    </li>
  );
}

function SortFilterItem({ item }: { item: SortFilterItem }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort");
  const active = currentSort === item.slug || (!currentSort && item.slug === null);

  // Build new URL preserving category param
  const newParams = new URLSearchParams();
  const currentCategory = searchParams.get("category");
  if (currentCategory) {
    newParams.set("category", currentCategory);
  }
  if (item.slug) {
    newParams.set("sort", item.slug);
  }

  const href = `${pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`;
  const DynamicTag = active ? "p" : Link;

  return (
    <li
      className="mt-2 flex text-sm text-neutral-900 dark:text-white"
      key={item.title}
    >
      <DynamicTag
        prefetch={!active ? false : undefined}
        href={href}
        className={`w-full font-medium transition-colors hover:text-blue-600 hover:underline hover:underline-offset-4 dark:hover:text-blue-400 ${
          active
            ? "font-semibold text-blue-600 underline underline-offset-4 dark:text-blue-400"
            : ""
        }`}
      >
        {item.title}
      </DynamicTag>
    </li>
  );
}

function FilterItem({ item }: { item: ListItem }) {
  return "path" in item ? (
    <PathFilterItem item={item} />
  ) : (
    <SortFilterItem item={item} />
  );
}

function FilterItemList({ list }: { list: readonly ListItem[] }) {
  return (
    <>
      {list.map((item: ListItem, i) => (
        <FilterItem key={i} item={item} />
      ))}
    </>
  );
}

export function FilterList({
  list,
  title,
}: {
  list: readonly ListItem[];
  title?: string;
}) {
  return (
    <nav>
      {title ? (
        <h3 className="hidden mb-3 text-sm font-semibold text-black md:block dark:text-white">
          {title}
        </h3>
      ) : null}
      <ul className="hidden md:block">
        <Suspense fallback={null}>
          <FilterItemList list={list} />
        </Suspense>
      </ul>
    </nav>
  );
}
