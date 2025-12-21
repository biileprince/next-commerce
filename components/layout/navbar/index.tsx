import Link from "next/link";
import { Suspense } from "react";
import { LogoSquare } from "@/components/logo";
import { MENU_ITEMS, SITE_NAME } from "@/lib/constants";
import { Search, SearchSkeleton } from "./search";
import { MobileMenu } from "./mobile-menu";
import { CartButton } from "@/components/cart/cart-button";
import { UserMenu } from "./user-menu";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
              {SITE_NAME}
            </div>
          </Link>
          {menu.length > 0 && (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {menu.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="hidden justify-center md:flex md:w-1/3">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>
        <div className="flex justify-end gap-2 md:w-1/3">
          {session?.user ? (
            <UserMenu userName={session.user.name || session.user.email} />
          ) : (
            <Link
              href="/sign-in"
              className="flex h-11 items-center justify-center rounded-md border border-neutral-200 px-4 text-sm font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              Sign In
            </Link>
          )}
          <Suspense fallback={<CartButtonSkeleton />}>
            <CartButton />
          </Suspense>
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
