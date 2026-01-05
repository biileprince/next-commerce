"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrdersPaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function OrdersPagination({ pagination }: OrdersPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { page, totalPages } = pagination;

  const navigateToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/orders?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {(page - 1) * pagination.limit + 1} to{" "}
        {Math.min(page * pagination.limit, pagination.total)} of{" "}
        {pagination.total} orders
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="size-4" />
          <span className="ml-2">Previous</span>
        </Button>

        <div className="hidden sm:flex gap-1">
          {startPage > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToPage(1)}
              >
                1
              </Button>
              {startPage > 2 && (
                <span className="flex items-center px-2">...</span>
              )}
            </>
          )}

          {pages.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => navigateToPage(p)}
            >
              {p}
            </Button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="flex items-center px-2">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToPage(page + 1)}
          disabled={page === totalPages}
        >
          <span className="mr-2">Next</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
