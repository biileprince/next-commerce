"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardMobileNavProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Addresses", href: "/dashboard/addresses" },
  { label: "Profile", href: "/dashboard/profile" },
];

export function DashboardMobileNav({ user }: DashboardMobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const currentPage =
    navItems.find((item) => isActive(item.href))?.label || "Dashboard";

  return (
    <div className="sticky top-0 z-40 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          NextCommerce
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium dark:border-neutral-800"
        >
          {currentPage}
          <svg
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180",
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-2 dark:border-neutral-800 dark:bg-black">
          <div className="mb-3 flex items-center gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium dark:bg-neutral-800">
              {user.name?.[0]?.toUpperCase() ||
                user.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user.name || "Customer"}
              </p>
              <p className="truncate text-xs text-neutral-500">{user.email}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 border-t border-neutral-200 dark:border-neutral-800" />
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              Shop
            </Link>
            <Link
              href="/api/auth/signout"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              Sign Out
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
