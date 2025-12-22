import { requireAdmin } from "@/lib/middleware/admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all admin routes
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard" className="text-xl font-bold">
              NextCommerse Admin
            </Link>
            <nav className="flex gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/products">Products</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">Orders</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users">Users</Link>
              </Button>
            </nav>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">View Store</Link>
            </Button>
            <form
              action={async () => {
                "use server";
                redirect("/api/auth/signout");
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
