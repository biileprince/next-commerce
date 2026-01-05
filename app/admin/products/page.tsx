import { requireAdmin } from "@/lib/middleware/admin";
import { getAdminProducts } from "@/lib/actions/product";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ProductsFilter } from "@/components/admin/products-filter";
import { ProductActions } from "@/components/admin/product-actions";
import { ProductsPagination } from "@/components/admin/products-pagination";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
    stockStatus?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const categoryId = params.categoryId || "";
  const stockStatus = (params.stockStatus as any) || "all";
  const sortBy = (params.sortBy as any) || "createdAt";
  const sortOrder = (params.sortOrder as any) || "desc";

  // Fetch categories for filter
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // Fetch products
  const result = await getAdminProducts({
    page,
    limit: 10,
    search,
    categoryId,
    stockStatus,
    sortBy,
    sortOrder,
  });

  if (!result.success || !result.data) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Products</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage your product inventory
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load products</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: products, pagination } = result;

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (quantity <= 10) {
      return <Badge variant="warning">Low Stock</Badge>;
    }
    return <Badge variant="success">In Stock</Badge>;
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage your product inventory
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            <span className="ml-2">Add Product</span>
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
          <CardDescription>
            Find products by name, category, or stock status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsFilter
            categories={categories}
            currentFilters={{
              search,
              categoryId,
              stockStatus,
              sortBy,
              sortOrder,
            }}
          />
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({pagination?.total || 0})</CardTitle>
          <CardDescription>
            Page {pagination?.page || 1} of {pagination?.totalPages || 1}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                No products found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filter criteria
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/products/new">
                  <Plus className="size-4" />
                  <span className="ml-2">Add Your First Product</span>
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="size-10 rounded object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded bg-muted flex items-center justify-center">
                            <Package className="size-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.category?.name || (
                        <span className="text-muted-foreground">
                          Uncategorized
                        </span>
                      )}
                    </TableCell>
                    <TableCell>GHS {product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{product.stockQuantity}</span>
                        {getStockBadge(product.stockQuantity)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ProductActions product={product} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <ProductsPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}
    </div>
  );
}

function Package(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 16h6v6h-6z" />
      <path d="M21 10V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l2-1.14" />
      <path d="M7.5 4.27l9 5.15" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}
