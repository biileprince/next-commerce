export const SITE_NAME = "NextCommerse";
export const SITE_DESCRIPTION = "Your African E-Commerce Platform";

export const DEFAULT_CURRENCY = "GHS";
export const SHIPPING_COST = 20; // Fixed shipping for MVP (GHS 20)

export const MENU_ITEMS = [
  { title: "All Products", path: "/products" },
  { title: "Categories", path: "/search" },
  { title: "About", path: "/about" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { title: "All Products", path: "/products" },
    { title: "Categories", path: "/search" },
    { title: "New Arrivals", path: "/search?sort=newest" },
  ],
  support: [
    { title: "Contact Us", path: "/contact" },
    { title: "FAQs", path: "/faqs" },
    { title: "Shipping Info", path: "/shipping" },
  ],
  company: [
    { title: "About Us", path: "/about" },
    { title: "Privacy Policy", path: "/privacy" },
    { title: "Terms of Service", path: "/terms" },
  ],
} as const;

export const SORT_OPTIONS = [
  { title: "Relevance", slug: null },
  { title: "Trending", slug: "trending" },
  { title: "Latest arrivals", slug: "newest" },
  { title: "Price: Low to high", slug: "price-asc" },
  { title: "Price: High to low", slug: "price-desc" },
] as const;
