"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createUrl } from "@/lib/utils";
import { Suspense } from "react";

export type ListItem = SortFilterItem | PathFilterItem;
export type SortFilterItem = { title: string; slug: string | null };
export type PathFilterItem = { title: string; path: string };

function PathFilterItem({ item }: { item: PathFilterItem }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = pathname === item.path;
  const newParams = new URLSearchParams(searchParams.toString());
  const DynamicTag = active ? "p" : Link;

  newParams.delete("q");

  return (
    <li className="mt-2 flex text-neutral-900 dark:text-white" key={item.title}>
      <DynamicTag
        href={createUrl(item.path, newParams)}
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
  const active = searchParams.get("sort") === item.slug;
  const q = searchParams.get("q");
  const href = createUrl(
    pathname,
    new URLSearchParams({
      ...(q && { q }),
      ...(item.slug && item.slug.length && { sort: item.slug }),
    })
  );
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

function FilterItemList({ list }: { list: ListItem[] }) {
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
  list: ListItem[];
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
