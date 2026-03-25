import { requireAdmin } from "@/lib/middleware/admin";
import { getAdminUsers, getUsersStats } from "@/lib/actions/admin-users";
import Link from "next/link";
import Image from "next/image";
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
import { UsersFilter } from "@/components/admin/users-filter";
import { UserActions } from "@/components/admin/user-actions";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: "all" | "customer" | "admin";
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const role = params.role || "all";
  const sortBy =
    (params.sortBy as "createdAt" | "name" | "email") || "createdAt";
  const sortOrder = (params.sortOrder as "asc" | "desc") || "desc";

  const [usersResult, statsResult] = await Promise.all([
    getAdminUsers({ page, limit: 10, search, role, sortBy, sortOrder }),
    getUsersStats(),
  ]);

  if (!usersResult.success || !usersResult.data) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Users</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Manage user accounts
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load users</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: users, pagination } = usersResult;
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Users</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Manage user accounts and roles
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>New (30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.newUsersLast30Days}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Customers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.customerCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Admins</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.adminCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <UsersFilter
        currentSearch={search}
        currentRole={role}
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
      />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all registered users</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-neutral-500">
                {search || role !== "all"
                  ? "No users match your filters"
                  : "No users yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Contact
                    </TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-center">Role</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Joined
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium dark:bg-neutral-800">
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                                unoptimized
                              />
                            ) : (
                              user.name?.[0]?.toUpperCase() ||
                              user.email?.[0]?.toUpperCase() ||
                              "U"
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="font-medium hover:underline"
                            >
                              {user.name}
                            </Link>
                            <p className="text-sm text-neutral-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {user.emailVerified ? (
                              <Badge variant="success" className="text-xs">
                                Email verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Email unverified
                              </Badge>
                            )}
                          </div>
                          {user.phoneNumber && (
                            <p className="text-sm text-neutral-500">
                              {user.phoneNumber}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {user._count?.orders || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {user.role === "admin" ? (
                          <Badge variant="default">Admin</Badge>
                        ) : (
                          <Badge variant="outline">Customer</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm text-neutral-500 sm:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <UserActions
                          userId={user.id}
                          userName={user.name}
                          currentRole={user.role}
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
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} users
              </p>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <Link
                    href={`/admin/users?page=${pagination.page - 1}&search=${search}&role=${role}`}
                  >
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                  </Link>
                )}
                {pagination.page < pagination.totalPages && (
                  <Link
                    href={`/admin/users?page=${pagination.page + 1}&search=${search}&role=${role}`}
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
