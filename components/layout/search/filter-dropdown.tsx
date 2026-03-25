"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

type ListItem = {
  title: string;
  path: string;
  slug?: string | null;
};

export function FilterDropdown({
  list,
  title,
}: {
  list: readonly ListItem[];
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getCurrentFilter = () => {
    if (title === "Collections") {
      const category = searchParams.get("category");
      if (!category) return "All";
      const item = list.find((item) =>
        item.path.includes(`category=${category}`)
      );
      return item?.title || "All";
    } else if (title === "Sort by") {
      const sort = searchParams.get("sort");
      if (!sort) return "Relevance";
      const item = list.find((item) => item.slug === sort);
      return item?.title || "Relevance";
    }
    return "Select";
  };

  const buildHref = (item: ListItem) => {
    const newParams = new URLSearchParams();

    if (title === "Collections") {
      // Extract category from item path
      const itemUrl = new URL(item.path, "http://localhost");
      const itemCategory = itemUrl.searchParams.get("category");

      // Preserve sort param
      const currentSort = searchParams.get("sort");
      if (itemCategory) {
        newParams.set("category", itemCategory);
      }
      if (currentSort) {
        newParams.set("sort", currentSort);
      }
    } else if (title === "Sort by") {
      // Preserve category param
      const currentCategory = searchParams.get("category");
      if (currentCategory) {
        newParams.set("category", currentCategory);
      }
      if (item.slug) {
        newParams.set("sort", item.slug);
      }
    }

    return `${pathname}${newParams.toString() ? `?${newParams.toString()}` : ""}`;
  };

  const isItemActive = (item: ListItem) => {
    if (title === "Collections") {
      const itemUrl = new URL(item.path, "http://localhost");
      const itemCategory = itemUrl.searchParams.get("category");
      const currentCategory = searchParams.get("category");
      return itemCategory === currentCategory || (item.path === "/products" && !currentCategory);
    } else if (title === "Sort by") {
      const currentSort = searchParams.get("sort");
      return (item.slug === null && !currentSort) || currentSort === item.slug;
    }
    return false;
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-900"
      >
        <span className="truncate">
          {title}: <span className="font-semibold">{getCurrentFilter()}</span>
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
            {list.map((item) => {
              const isActive = isItemActive(item);

              return (
                <Link
                  key={item.title}
                  href={buildHref(item)}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 ${
                    isActive
                      ? "font-semibold text-blue-600 dark:text-blue-400"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
