import { requireAdmin } from "@/lib/middleware/admin";
import { getCategories } from "@/lib/actions/category";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CategoriesFilter } from "@/components/admin/categories-filter";
import { CategoryActions } from "@/components/admin/category-actions";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: "all" | "active" | "inactive";
  }>;
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const status = params.status || "all";

  const result = await getCategories({
    page,
    limit: 10,
    search,
    status,
  });

  if (!result.success || !result.data) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Categories</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage product categories
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load categories</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: categories, pagination } = result;

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Categories</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage product categories ({pagination?.total || 0} total)
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <CategoriesFilter
        currentSearch={search}
        currentStatus={status}
      />

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            A list of all product categories in your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <svg
                  className="h-6 w-6 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                  />
                </svg>
              </div>
              <p className="text-neutral-500">
                {search || status !== "all"
                  ? "No categories match your filters"
                  : "No categories yet"}
              </p>
              {!search && status === "all" && (
                <Link href="/admin/categories/new">
                  <Button className="mt-4">Create Your First Category</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Slug</TableHead>
                    <TableHead className="text-center">Products</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {category.image ? (
                            <Image
                              src={category.image}
                              alt={category.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-lg object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                              <svg
                                className="h-5 w-5 text-neutral-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.description && (
                              <p className="max-w-xs truncate text-sm text-neutral-500">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden font-mono text-sm text-neutral-500 sm:table-cell">
                        {category.slug}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {category._count?.products || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {category.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm text-neutral-500 sm:table-cell">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <CategoryActions
                          categoryId={category.id}
                          categoryName={category.name}
                          isActive={category.isActive}
                          productCount={category._count?.products || 0}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-neutral-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} categories
              </p>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <Link
                    href={`/admin/categories?page=${pagination.page - 1}&search=${search}&status=${status}`}
                  >
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                  </Link>
                )}
                {pagination.page < pagination.totalPages && (
                  <Link
                    href={`/admin/categories?page=${pagination.page + 1}&search=${search}&status=${status}`}
                  >
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
