import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
      <Link
        href="/"
        className="transition-colors hover:text-black dark:hover:text-white"
      >
        Home
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-black dark:hover:text-white"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-black dark:text-white">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
