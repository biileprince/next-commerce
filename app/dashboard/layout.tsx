import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Mobile Navigation */}
      <DashboardMobileNav user={session.user} />

      <div className="mx-auto flex max-w-screen-2xl">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-black lg:block">
          <DashboardSidebar user={session.user} />
        </aside>

        {/* Main Content */}
        <main className="min-h-screen flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
