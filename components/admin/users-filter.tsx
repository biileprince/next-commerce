"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface UsersFilterProps {
  currentSearch: string;
  currentRole: string;
  currentSortBy: string;
  currentSortOrder: string;
}

const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "customer", label: "Customers" },
  { value: "admin", label: "Admins" },
];

export function UsersFilter({ currentSearch, currentRole }: UsersFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);

  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("page");

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ search });
  }

  function clearFilters() {
    setSearch("");
    startTransition(() => {
      router.push("/admin/users");
    });
  }

  const hasFilters = currentSearch || currentRole !== "all";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </form>

      {/* Role Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {roleOptions.map((option) => (
          <Button
            key={option.value}
            variant={currentRole === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ role: option.value })}
            disabled={isPending}
          >
            {option.label}
          </Button>
        ))}

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
