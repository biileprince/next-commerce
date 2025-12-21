"use client";

import { Menu, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MenuItem {
  title: string;
  path: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function MobileMenu({
  menu,
  categories,
}: {
  menu: MenuItem[];
  categories?: Category[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);
  const toggleCategories = () => setIsCategoriesOpen(!isCategoriesOpen);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsCategoriesOpen(false);
  }, [pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open mobile menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-black transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex h-full w-[280px] flex-col bg-white/95 backdrop-blur-xl dark:bg-black/95 sm:w-[320px]"
      >
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
        </SheetHeader>

        {/* Menu Items - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          <ul className="flex flex-col">
            {/* Categories Accordion */}
            {categories && categories.length > 0 && (
              <li>
                <button
                  onClick={toggleCategories}
                  className="flex w-full items-center justify-between border-b border-neutral-200 px-4 py-4 text-base font-medium text-black transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900"
                >
                  <span>Categories</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isCategoriesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isCategoriesOpen && (
                  <ul className="bg-neutral-50 dark:bg-neutral-900/50">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/search?category=${category.slug}`}
                          prefetch={true}
                          onClick={closeMenu}
                          className="block border-b border-neutral-200 py-3 pl-8 pr-4 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}

            {/* Regular Menu Items */}
            {menu.length > 0 &&
              menu.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    onClick={closeMenu}
                    className="block border-b border-neutral-200 px-4 py-4 text-base font-medium text-black transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
