import { Prisma } from "@prisma/client";

// Convert Prisma Decimal to number for client-side usage
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  stockQuantity: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  // Optional fields for enhancements
  originalPrice?: number | null;
  discountPercentage?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  isTop?: boolean;
  isNew?: boolean;
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
};

export type Cart = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
};

export type Address = {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  region: string;
  district: string | null;
  landmark: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  paystackReference: string | null;
  paystackAuthCode: string | null;
  orderStatus: string;
  trackingNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
};

// Helper function to convert Prisma models to client types
export function convertProduct(
  product: Prisma.ProductGetPayload<{ include?: { category: true } }>
): Product {
  return {
    ...product,
    price: product.price.toNumber(),
    originalPrice: product.originalPrice?.toNumber() ?? null,
    rating: product.rating?.toNumber() ?? null,
    reviewCount: product.reviewCount ?? 0,
    isTop: product.isTop ?? false,
    isNew: product.isNew ?? false,
    categoryId: product.categoryId ?? null,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
  };
}

export function convertCartItem(
  item: Prisma.CartItemGetPayload<{ include: { product: true } }>
): CartItem {
  return {
    ...item,
    product: convertProduct(item.product),
  };
}

export function convertCart(
  cart: Prisma.CartGetPayload<{
    include: { items: { include: { product: true } } };
  }>
): Cart {
  return {
    ...cart,
    items: cart.items.map(convertCartItem),
  };
}
