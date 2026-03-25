import Link from "next/link";
import { Suspense } from "react";
import { LogoSquare } from "@/components/logo";
import { MENU_ITEMS, SITE_NAME } from "@/lib/constants";
import { Search, SearchSkeleton } from "./search";
import { MobileMenu } from "./mobile-menu";
import { CartButton } from "@/components/cart/cart-button";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function Navbar() {
  const menu = MENU_ITEMS.map((item) => ({
    title: item.title,
    path: item.path,
  }));

  // Get session for user menu
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    // Continue without session
  }

  // Fetch categories for mobile menu
  let categories: { id: string; name: string; slug: string }[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });
  } catch {
    // Continue without categories
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800 dark:bg-neutral-950/95 dark:supports-[backdrop-filter]:bg-neutral-950/80">
      <div className="mx-auto max-w-screen-2xl">
        <div className="relative flex items-center justify-between gap-2 px-4 py-3 lg:gap-4 lg:px-6">
          {/* Left Side - Hamburger (Mobile) + Logo + Menu (Desktop) */}
          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
            {/* Mobile Hamburger - Always visible on mobile */}
            <div className="block flex-none md:hidden">
              <Suspense fallback={null}>
                <MobileMenu menu={menu} categories={categories} />
              </Suspense>
            </div>

            {/* Logo */}
            <Link
              href="/"
              prefetch={true}
              className="flex items-center flex-shrink-0"
            >
              <LogoSquare />
              <div className="ml-2 hidden text-sm font-semibold uppercase tracking-wider sm:block lg:block">
                {SITE_NAME}
              </div>
            </Link>

            {/* Desktop Menu */}
            {menu.length > 0 && (
              <ul className="hidden gap-4 text-sm lg:flex lg:items-center xl:gap-6">
                {menu.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.path}
                      prefetch={true}
                      className="whitespace-nowrap font-medium text-neutral-600 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-white"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Center - Search (Desktop only) */}
          <div className="hidden justify-center lg:flex lg:flex-1 lg:max-w-md xl:max-w-lg">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>

          {/* Right Side - Theme Toggle + User/Cart (Always visible) */}
          <div className="flex items-center justify-end gap-2">
            <ThemeToggle />
            {session?.user ? (
              <UserMenu userName={session.user.name || session.user.email} />
            ) : (
              <Link
                href="/sign-in"
                className="hidden h-9 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium transition-colors hover:bg-neutral-50 sm:flex dark:border-neutral-800 dark:bg-black dark:hover:bg-neutral-900"
              >
                Sign In
              </Link>
            )}
            <Suspense fallback={<CartButtonSkeleton />}>
              <CartButton />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  );
}

function CartButtonSkeleton() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <div className="h-4 w-4 animate-pulse rounded bg-neutral-200" />
    </div>
  );
}
