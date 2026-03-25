import { requireAdmin } from "@/lib/middleware/admin";
import { getBadges, seedDefaultBadges } from "@/lib/actions/badges";
import Link from "next/link";
import { Plus, Tag } from "lucide-react";
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
import { BadgeActions } from "@/components/admin/badge-actions";
import { SeedBadgesButton } from "@/components/admin/seed-badges-button";

export default async function AdminBadgesPage() {
  await requireAdmin();

  const result = await getBadges();
  const badges = result.success ? result.data : [];

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Product Badges</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage badges to highlight products
          </p>
        </div>
        <div className="flex gap-2">
          {badges && badges.length === 0 && <SeedBadgesButton />}
          <Link href="/admin/badges/new">
            <Button>
              <Plus className="mr-2 size-4" />
              Add Badge
            </Button>
          </Link>
        </div>
      </div>

      {/* Badges List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="size-5" />
            All Badges
          </CardTitle>
          <CardDescription>
            {badges?.length || 0} badge(s) configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {badges && badges.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {badges.map((badge) => (
                    <TableRow key={badge.id}>
                      <TableCell>
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{
                            backgroundColor: badge.color,
                            color: badge.textColor,
                          }}
                        >
                          {badge.label}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {badge.name}
                      </TableCell>
                      <TableCell>{badge.label}</TableCell>
                      <TableCell>{badge._count?.products || 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant={badge.isActive ? "success" : "secondary"}
                        >
                          {badge.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <BadgeActions badge={badge} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Tag className="mx-auto size-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No badges yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create badges to highlight your products with labels like
                &quot;Best Seller&quot;, &quot;New Arrival&quot;, or
                &quot;Sale&quot;.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <SeedBadgesButton />
                <Link href="/admin/badges/new">
                  <Button>
                    <Plus className="mr-2 size-4" />
                    Create Badge
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
