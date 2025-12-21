import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { CartProvider } from "@/components/cart/cart-context";
import { getCart } from "@/lib/actions/cart";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { baseUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Inter({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  robots: {
    follow: true,
    index: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch cart - will be null if not authenticated
  let initialCart = null;
  try {
    const cartResult = await getCart();
    if (cartResult.success && cartResult.data) {
      initialCart = cartResult.data;
    }
  } catch {
    // Cart fetch failed, continue without cart
  }

  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} ${geistMono.variable} h-full font-sans antialiased bg-white text-black selection:bg-blue-200 dark:bg-neutral-950 dark:text-white dark:selection:bg-blue-800`}
      >
        <CartProvider initialCart={initialCart}>
          <Navbar />
          <main className="min-h-[calc(100vh-73px)]">{children}</main>
          <Toaster closeButton position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}
