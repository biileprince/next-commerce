"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";
import { createUrl } from "@/lib/utils";

export function FilterList() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSort = searchParams.get("sort");

  function handleSort(sortSlug: string) {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("sort", sortSlug);
    const url = createUrl(pathname, newParams);
    router.push(url);
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-500">Sort by:</span>
        <div className="flex gap-2 flex-wrap">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.slug}
              onClick={() => handleSort(option.slug)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                currentSort === option.slug ||
                (!currentSort && option.slug === "relevance")
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-black hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
