"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrdersFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const paymentStatus = searchParams.get("paymentStatus") || "all";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("page");
    router.push(`/admin/orders?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/admin/orders");
  };

  const hasActiveFilters =
    search || status !== "all" || paymentStatus !== "all" || startDate || endDate;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-9"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="size-4" />
            <span className="ml-2">Clear</span>
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {/* Order Status */}
        <Select
          value={status}
          onValueChange={(value) => updateFilters({ status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Payment Status */}
        <Select
          value={paymentStatus}
          onValueChange={(value) => updateFilters({ paymentStatus: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        {/* Start Date */}
        <Input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => updateFilters({ startDate: e.target.value })}
        />

        {/* End Date */}
        <Input
          type="date"
          placeholder="End Date"
          value={endDate}
          onChange={(e) => updateFilters({ endDate: e.target.value })}
        />

        {/* Sort By */}
        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(value) => {
            const [newSortBy, newSortOrder] = value.split("-");
            updateFilters({ sortBy: newSortBy, sortOrder: newSortOrder });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="totalAmount-desc">Highest Amount</SelectItem>
            <SelectItem value="totalAmount-asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
