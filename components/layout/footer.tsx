import Link from "next/link";
import { FOOTER_LINKS, SITE_NAME } from "@/lib/constants";
import { LogoSquare } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white text-sm text-neutral-500 dark:border-neutral-700 dark:bg-black dark:text-neutral-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:gap-12 md:px-4 min-[1320px]:px-0">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <LogoSquare size="sm" />
            <span className="uppercase font-bold">{SITE_NAME}</span>
          </Link>
          <p className="max-w-xs text-sm">
            Your trusted African e-commerce platform. Shop quality products with
            secure payments.
          </p>
        </div>
        <nav className="flex flex-1 flex-wrap gap-8">
          <div>
            <h3 className="mb-3 font-medium text-black dark:text-white">
              Shop
            </h3>
            <ul className="flex flex-col gap-2">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="underline-offset-4 hover:text-black hover:underline dark:hover:text-neutral-300"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-medium text-black dark:text-white">
              Support
            </h3>
            <ul className="flex flex-col gap-2">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="underline-offset-4 hover:text-black hover:underline dark:hover:text-neutral-300"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-medium text-black dark:text-white">
              Company
            </h3>
            <ul className="flex flex-col gap-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="underline-offset-4 hover:text-black hover:underline dark:hover:text-neutral-300"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
      <div className="border-t border-neutral-200 py-6 text-center dark:border-neutral-700">
        <p>
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
