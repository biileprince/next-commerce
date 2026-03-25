"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { convertProduct } from "@/types";
import { Prisma } from "@prisma/client";

// Get all active products
export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        badges: {
          include: {
            badge: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: products.map(convertProduct) };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

// Admin: Get all products with filters, search, sort, and pagination
export async function getAdminProducts({
  page = 1,
  limit = 10,
  search = "",
  categoryId = "",
  stockStatus = "all",
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  sortBy?: "createdAt" | "name" | "price" | "stockQuantity";
  sortOrder?: "asc" | "desc";
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userWithRole = session.user as typeof session.user & {
      role?: string;
    };

    if (userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      AND: [
        // Search by name or description
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        // Filter by category
        categoryId ? { categoryId } : {},
        // Filter by stock status
        stockStatus === "in_stock"
          ? { stockQuantity: { gt: 10 } }
          : stockStatus === "low_stock"
            ? { stockQuantity: { gte: 1, lte: 10 } }
            : stockStatus === "out_of_stock"
              ? { stockQuantity: 0 }
              : {},
      ],
    };

    // Get total count
    const total = await prisma.product.count({ where });

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: products.map(convertProduct),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

// Admin: Get single product by ID (for editing)
export async function getAdminProduct(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userWithRole = session.user as typeof session.user & {
      role?: string;
    };

    if (userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Extract badge IDs for the form
    const badgeIds = product.badges.map((b) => b.badgeId);

    return {
      success: true,
      data: {
        ...convertProduct(product),
        badgeIds,
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

// Get product by slug
export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: convertProduct(product) };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

// Get products by category
export async function getProductsByCategory(
  categoryId: string,
  limit?: number,
) {
  try {
    const products = await prisma.product.findMany({
      where: { categoryId, isActive: true },
      include: {
        category: true,
        badges: {
          include: {
            badge: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return { success: true, data: products.map(convertProduct) };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

// Admin: Create product
export async function createProduct(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userWithRole = session.user as typeof session.user & {
      role?: string;
    };

    if (userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stockQuantity = parseInt(formData.get("stockQuantity") as string);
    const categoryId = formData.get("categoryId") as string;
    const images = formData.getAll("images") as string[];

    if (!name || !slug || !price || stockQuantity === undefined) {
      return { success: false, error: "Missing required fields" };
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return { success: false, error: "Product with this slug already exists" };
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price,
        stockQuantity,
        categoryId: categoryId || null,
        images: images.filter(Boolean),
      },
    });

    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/admin/products");
    return { success: true, data: convertProduct(product) };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

// Admin: Update product
export async function updateProduct(id: string, formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userWithRole = session.user as typeof session.user & {
      role?: string;
    };

    if (userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stockQuantity = parseInt(formData.get("stockQuantity") as string);
    const categoryId = formData.get("categoryId") as string;
    const images = formData.getAll("images") as string[];

    if (!name || !slug || !price || stockQuantity === undefined) {
      return { success: false, error: "Missing required fields" };
    }

    // Check if slug is taken by another product
    const existingProduct = await prisma.product.findFirst({
      where: { slug, NOT: { id } },
    });

    if (existingProduct) {
      return { success: false, error: "Product with this slug already exists" };
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        price,
        stockQuantity,
        categoryId: categoryId || null,
        images: images.filter(Boolean),
      },
    });

    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/admin/products");
    return { success: true, data: convertProduct(product) };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// Admin: Delete product (soft delete by marking inactive)
export async function deleteProduct(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userWithRole = session.user as typeof session.user & {
      role?: string;
    };

    if (userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

// Admin: Toggle product active status
export async function toggleProductStatus(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userWithRole = session.user as typeof session.user & {
      role?: string;
    };

    if (userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error toggling product status:", error);
    return { success: false, error: "Failed to toggle product status" };
  }
}
