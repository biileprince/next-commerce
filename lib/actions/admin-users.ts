"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper to check admin access
async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userWithRole = session?.user as
    | (typeof session.user & { role?: string })
    | undefined;

  if (!session?.user || userWithRole?.role !== "admin") {
    return { authorized: false, error: "Unauthorized" };
  }

  return { authorized: true, userId: session.user.id };
}

// Get all users with pagination and search
export async function getAdminUsers({
  page = 1,
  limit = 10,
  search = "",
  role = "all",
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: "all" | "customer" | "admin";
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
} = {}) {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role !== "all") {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          emailVerified: true,
          phoneNumberVerified: true,
          role: true,
          image: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

// Get single user by ID with details
export async function getAdminUser(id: string) {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        emailVerified: true,
        phoneNumberVerified: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          orderBy: { isDefault: "desc" },
        },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            items: true,
          },
        },
        _count: {
          select: { orders: true, addresses: true },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Calculate user stats
    const stats = await prisma.order.aggregate({
      where: {
        userId: id,
        paymentStatus: "paid",
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    return {
      success: true,
      data: {
        ...user,
        stats: {
          totalSpent: stats._sum.totalAmount?.toNumber() || 0,
          paidOrders: stats._count,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

// Update user role
export async function updateUserRole(
  userId: string,
  role: "customer" | "admin",
) {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    // Prevent changing own role
    if (userId === authCheck.userId) {
      return { success: false, error: "Cannot change your own role" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

// Get user stats summary for admin dashboard
export async function getUsersStats() {
  try {
    const authCheck = await requireAdmin();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, newUsers, adminCount, customerCount] = await Promise.all(
      [
        prisma.user.count(),
        prisma.user.count({
          where: { createdAt: { gte: thirtyDaysAgo } },
        }),
        prisma.user.count({ where: { role: "admin" } }),
        prisma.user.count({ where: { role: "customer" } }),
      ],
    );

    return {
      success: true,
      data: {
        totalUsers,
        newUsersLast30Days: newUsers,
        adminCount,
        customerCount,
      },
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { success: false, error: "Failed to fetch user stats" };
  }
}
