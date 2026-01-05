import { requireAdmin } from "@/lib/middleware/admin";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Separator } from "@/components/ui/separator";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <SidebarProvider>
      <AdminSidebar
        userName={session.user.name || undefined}
        userEmail={session.user.email || undefined}
      />
      <SidebarInset className="overflow-x-hidden">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sm:h-16">
          <div className="flex w-full items-center gap-2 px-3 sm:px-4">
            <SidebarTrigger className="-ml-1 md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-base font-semibold truncate sm:text-lg">
              Admin Panel
            </h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-x-hidden p-3 pt-4 sm:p-4 sm:pt-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
