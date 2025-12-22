"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function UserMenu({ userName }: { userName?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  async function handleSignOut() {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out");
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 bg-white text-black transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-black dark:text-white dark:hover:bg-neutral-900"
        aria-label="User menu"
      >
        <User className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-black">
          {userName && (
            <div className="border-b border-neutral-200 px-4 py-2 text-sm dark:border-neutral-700">
              <p className="font-medium truncate">{userName}</p>
            </div>
          )}
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/orders"
            className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
            onClick={() => setIsOpen(false)}
          >
            My Orders
          </Link>
          <Link
            href="/dashboard/addresses"
            className="block px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
            onClick={() => setIsOpen(false)}
          >
            Addresses
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-neutral-100 dark:text-red-400 dark:hover:bg-neutral-900"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
