"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Search } from "./search";

interface MenuItem {
  title: string;
  path: string;
}

export function MobileMenu({ menu }: { menu: MenuItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={toggleMenu}
        aria-label="Open mobile menu"
        className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white md:hidden"
      >
        <Menu className="h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden">
          <div className="fixed bottom-0 left-0 right-0 top-0 flex h-full w-full flex-col bg-white pb-6 dark:bg-black">
            <div className="flex items-center justify-between p-4">
              <span className="text-lg font-medium">Menu</span>
              <button onClick={closeMenu} aria-label="Close mobile menu">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 w-full px-4">
              <Search />
            </div>

            {menu.length > 0 && (
              <ul className="flex flex-col">
                {menu.map((item) => (
                  <li
                    key={item.title}
                    className="border-b border-neutral-200 dark:border-neutral-700"
                  >
                    <Link
                      href={item.path}
                      prefetch={true}
                      onClick={closeMenu}
                      className="block p-4 text-xl text-black transition-colors hover:text-neutral-500 dark:text-white"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
