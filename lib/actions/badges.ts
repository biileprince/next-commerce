"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to check admin access
async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { authorized: false as const, error: "Unauthorized" };
  }

  const userWithRole = session.user as typeof session.user & { role?: string };

  if (userWithRole.role !== "admin") {
    return { authorized: false as const, error: "Unauthorized" };
  }

  return { authorized: true as const, userId: session.user.id };
}

// Get all badges
export async function getBadges() {
  try {
    const badges = await prisma.productBadge.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return { success: true, data: badges };
  } catch (error) {
    console.error("Error fetching badges:", error);
    return { success: false, error: "Failed to fetch badges" };
  }
}

// Get active badges (for product form)
export async function getActiveBadges() {
  try {
    const badges = await prisma.productBadge.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return { success: true, data: badges };
  } catch (error) {
    console.error("Error fetching active badges:", error);
    return { success: false, error: "Failed to fetch badges" };
  }
}

// Get a single badge
export async function getBadge(id: string) {
  try {
    const badge = await prisma.productBadge.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!badge) {
      return { success: false, error: "Badge not found" };
    }

    return { success: true, data: badge };
  } catch (error) {
    console.error("Error fetching badge:", error);
    return { success: false, error: "Failed to fetch badge" };
  }
}

// Create a badge
export async function createBadge(formData: FormData) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const name = formData.get("name") as string;
    const label = formData.get("label") as string;
    const color = (formData.get("color") as string) || "#000000";
    const textColor = (formData.get("textColor") as string) || "#FFFFFF";

    if (!name || !label) {
      return { success: false, error: "Name and label are required" };
    }

    // Check if badge with same name exists
    const existing = await prisma.productBadge.findUnique({
      where: { name: name.toLowerCase().replace(/\s+/g, "-") },
    });

    if (existing) {
      return { success: false, error: "A badge with this name already exists" };
    }

    const badge = await prisma.productBadge.create({
      data: {
        name: name.toLowerCase().replace(/\s+/g, "-"),
        label,
        color,
        textColor,
      },
    });

    revalidatePath("/admin/badges");
    revalidatePath("/admin/products");
    return { success: true, data: badge };
  } catch (error) {
    console.error("Error creating badge:", error);
    return { success: false, error: "Failed to create badge" };
  }
}

// Update a badge
export async function updateBadge(id: string, formData: FormData) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const label = formData.get("label") as string;
    const color = formData.get("color") as string;
    const textColor = formData.get("textColor") as string;

    if (!label) {
      return { success: false, error: "Label is required" };
    }

    const badge = await prisma.productBadge.update({
      where: { id },
      data: {
        label,
        color,
        textColor,
      },
    });

    revalidatePath("/admin/badges");
    revalidatePath("/admin/products");
    return { success: true, data: badge };
  } catch (error) {
    console.error("Error updating badge:", error);
    return { success: false, error: "Failed to update badge" };
  }
}

// Toggle badge active status
export async function toggleBadgeStatus(id: string) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const badge = await prisma.productBadge.findUnique({ where: { id } });
    if (!badge) {
      return { success: false, error: "Badge not found" };
    }

    await prisma.productBadge.update({
      where: { id },
      data: { isActive: !badge.isActive },
    });

    revalidatePath("/admin/badges");
    return { success: true };
  } catch (error) {
    console.error("Error toggling badge status:", error);
    return { success: false, error: "Failed to toggle badge status" };
  }
}

// Delete a badge
export async function deleteBadge(id: string) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    // Delete all assignments first
    await prisma.productBadgeAssignment.deleteMany({
      where: { badgeId: id },
    });

    await prisma.productBadge.delete({
      where: { id },
    });

    revalidatePath("/admin/badges");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting badge:", error);
    return { success: false, error: "Failed to delete badge" };
  }
}

// Assign badges to a product
export async function assignBadgesToProduct(
  productId: string,
  badgeIds: string[],
) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    // Remove all existing badges
    await prisma.productBadgeAssignment.deleteMany({
      where: { productId },
    });

    // Add new badges
    if (badgeIds.length > 0) {
      await prisma.productBadgeAssignment.createMany({
        data: badgeIds.map((badgeId) => ({
          productId,
          badgeId,
        })),
      });
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Error assigning badges:", error);
    return { success: false, error: "Failed to assign badges" };
  }
}

// Get badges for a product
export async function getProductBadges(productId: string) {
  try {
    const assignments = await prisma.productBadgeAssignment.findMany({
      where: { productId },
      include: {
        badge: true,
      },
    });

    return {
      success: true,
      data: assignments.map((a) => a.badge),
    };
  } catch (error) {
    console.error("Error fetching product badges:", error);
    return { success: false, error: "Failed to fetch product badges" };
  }
}

// Seed default badges
export async function seedDefaultBadges() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  const defaultBadges = [
    {
      name: "bestseller",
      label: "Best Seller",
      color: "#F59E0B",
      textColor: "#FFFFFF",
    },
    {
      name: "new-arrival",
      label: "New Arrival",
      color: "#10B981",
      textColor: "#FFFFFF",
    },
    { name: "sale", label: "Sale", color: "#EF4444", textColor: "#FFFFFF" },
    {
      name: "featured",
      label: "Featured",
      color: "#8B5CF6",
      textColor: "#FFFFFF",
    },
    {
      name: "limited-edition",
      label: "Limited Edition",
      color: "#EC4899",
      textColor: "#FFFFFF",
    },
    {
      name: "trending",
      label: "Trending",
      color: "#3B82F6",
      textColor: "#FFFFFF",
    },
  ];

  try {
    for (const badge of defaultBadges) {
      await prisma.productBadge.upsert({
        where: { name: badge.name },
        update: {},
        create: badge,
      });
    }

    revalidatePath("/admin/badges");
    return { success: true };
  } catch (error) {
    console.error("Error seeding badges:", error);
    return { success: false, error: "Failed to seed badges" };
  }
}
