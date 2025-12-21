import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { CartProvider } from "@/components/cart/cart-context";
import { getCart } from "@/lib/actions/cart";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { baseUrl } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white`}
      >
        <CartProvider initialCart={initialCart}>
          <Navbar />
          <main>{children}</main>
          <Toaster closeButton />
        </CartProvider>
      </body>
    </html>
  );
}
