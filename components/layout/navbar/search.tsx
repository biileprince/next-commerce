"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { createUrl } from "@/lib/utils";

export function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const newParams = new URLSearchParams(searchParams.toString());

      if (searchValue) {
        newParams.set("q", searchValue);
      } else {
        newParams.delete("q");
      }

      router.push(createUrl("/search", newParams));
    },
    [router, searchParams, searchValue]
  );

  const clearSearch = () => {
    setSearchValue("");
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("q");
    router.push(createUrl("/search", newParams));
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full lg:w-80 xl:w-full">
      <Input
        type="text"
        name="search"
        placeholder="Search for products..."
        autoComplete="off"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="w-full rounded-lg border bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-transparent dark:text-white dark:placeholder:text-neutral-400"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center gap-1">
        {searchValue && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button type="submit">
          <SearchIcon className="h-4 w-4 text-neutral-500" />
        </button>
      </div>
    </form>
  );
}

export function SearchSkeleton() {
  return (
    <form className="relative w-full lg:w-80 xl:w-full">
      <Input placeholder="Search for products..." className="w-full" disabled />
    </form>
  );
}
