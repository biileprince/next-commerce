"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductsFilterProps {
  categories: { id: string; name: string }[];
  currentFilters: {
    search: string;
    categoryId: string;
    stockStatus: string;
    sortBy: string;
    sortOrder: string;
  };
}

export function ProductsFilter({
  categories,
  currentFilters,
}: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentFilters.search);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to first page on filter change
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search);
  };

  const clearFilters = () => {
    router.push("/admin/products");
  };

  const hasFilters =
    currentFilters.search ||
    currentFilters.categoryId ||
    currentFilters.stockStatus !== "all";

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <Select
            value={currentFilters.categoryId || "all"}
            onValueChange={(value) => updateFilters("categoryId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stock Status Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Stock Status</label>
          <Select
            value={currentFilters.stockStatus}
            onValueChange={(value) => updateFilters("stockStatus", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-sm font-medium mb-2 block">Sort By</label>
          <Select
            value={currentFilters.sortBy}
            onValueChange={(value) => updateFilters("sortBy", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stockQuantity">Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="text-sm font-medium mb-2 block">Order</label>
          <Select
            value={currentFilters.sortOrder}
            onValueChange={(value) => updateFilters("sortOrder", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full sm:w-auto"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
