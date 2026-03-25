"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

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

// Generate a random coupon code
function generateCouponCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get coupons with pagination
export async function getCoupons(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status: "all" | "active" | "inactive" | "expired" = "all",
) {
  try {
    const skip = (page - 1) * limit;
    const now = new Date();

    // Build where clause
    const where: {
      code?: { contains: string; mode: "insensitive" };
      isActive?: boolean;
      OR?: { expiresAt: { lt: Date } | null }[];
      AND?: { OR: { expiresAt: { gte: Date } | null }[] }[];
    } = {};

    if (search) {
      where.code = { contains: search, mode: "insensitive" };
    }

    if (status === "active") {
      where.isActive = true;
      where.AND = [{ OR: [{ expiresAt: { gte: now } }, { expiresAt: null }] }];
    } else if (status === "inactive") {
      where.isActive = false;
    } else if (status === "expired") {
      where.OR = [{ expiresAt: { lt: now } }];
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    return {
      success: true,
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return { success: false, error: "Failed to fetch coupons" };
  }
}

// Get a single coupon
export async function getCoupon(id: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            discountAmount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!coupon) {
      return { success: false, error: "Coupon not found" };
    }

    return { success: true, data: coupon };
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return { success: false, error: "Failed to fetch coupon" };
  }
}

// Create a coupon
export async function createCoupon(formData: FormData) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    let code = (formData.get("code") as string)?.toUpperCase().trim();
    const autoGenerate = formData.get("autoGenerate") === "true";
    const description = formData.get("description") as string;
    const discountType = formData.get("discountType") as "percentage" | "fixed";
    const discountValue = parseFloat(formData.get("discountValue") as string);
    const minimumOrder = formData.get("minimumOrder")
      ? parseFloat(formData.get("minimumOrder") as string)
      : null;
    const maximumDiscount = formData.get("maximumDiscount")
      ? parseFloat(formData.get("maximumDiscount") as string)
      : null;
    const usageLimit = formData.get("usageLimit")
      ? parseInt(formData.get("usageLimit") as string)
      : null;
    const perUserLimit = formData.get("perUserLimit")
      ? parseInt(formData.get("perUserLimit") as string)
      : 1;
    const freeShipping = formData.get("freeShipping") === "true";
    const startsAt = formData.get("startsAt")
      ? new Date(formData.get("startsAt") as string)
      : new Date();
    const expiresAt = formData.get("expiresAt")
      ? new Date(formData.get("expiresAt") as string)
      : null;

    // Auto-generate code if requested
    if (autoGenerate || !code) {
      code = generateCouponCode();
      // Check if code exists and regenerate if needed
      let exists = await prisma.coupon.findUnique({ where: { code } });
      while (exists) {
        code = generateCouponCode();
        exists = await prisma.coupon.findUnique({ where: { code } });
      }
    }

    // Validate
    if (!code) {
      return { success: false, error: "Coupon code is required" };
    }

    if (!discountType || !["percentage", "fixed"].includes(discountType)) {
      return { success: false, error: "Invalid discount type" };
    }

    if (isNaN(discountValue) || discountValue <= 0) {
      return { success: false, error: "Discount value must be greater than 0" };
    }

    if (discountType === "percentage" && discountValue > 100) {
      return {
        success: false,
        error: "Percentage discount cannot exceed 100%",
      };
    }

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return {
        success: false,
        error: "A coupon with this code already exists",
      };
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description,
        discountType,
        discountValue: new Decimal(discountValue),
        minimumOrder: minimumOrder ? new Decimal(minimumOrder) : null,
        maximumDiscount: maximumDiscount ? new Decimal(maximumDiscount) : null,
        usageLimit,
        perUserLimit,
        freeShipping,
        startsAt,
        expiresAt,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, data: coupon };
  } catch (error) {
    console.error("Error creating coupon:", error);
    return { success: false, error: "Failed to create coupon" };
  }
}

// Update a coupon
export async function updateCoupon(id: string, formData: FormData) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const description = formData.get("description") as string;
    const discountType = formData.get("discountType") as "percentage" | "fixed";
    const discountValue = parseFloat(formData.get("discountValue") as string);
    const minimumOrder = formData.get("minimumOrder")
      ? parseFloat(formData.get("minimumOrder") as string)
      : null;
    const maximumDiscount = formData.get("maximumDiscount")
      ? parseFloat(formData.get("maximumDiscount") as string)
      : null;
    const usageLimit = formData.get("usageLimit")
      ? parseInt(formData.get("usageLimit") as string)
      : null;
    const perUserLimit = formData.get("perUserLimit")
      ? parseInt(formData.get("perUserLimit") as string)
      : 1;
    const freeShipping = formData.get("freeShipping") === "true";
    const startsAt = formData.get("startsAt")
      ? new Date(formData.get("startsAt") as string)
      : new Date();
    const expiresAt = formData.get("expiresAt")
      ? new Date(formData.get("expiresAt") as string)
      : null;

    // Validate
    if (!discountType || !["percentage", "fixed"].includes(discountType)) {
      return { success: false, error: "Invalid discount type" };
    }

    if (isNaN(discountValue) || discountValue <= 0) {
      return { success: false, error: "Discount value must be greater than 0" };
    }

    if (discountType === "percentage" && discountValue > 100) {
      return {
        success: false,
        error: "Percentage discount cannot exceed 100%",
      };
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        description,
        discountType,
        discountValue: new Decimal(discountValue),
        minimumOrder: minimumOrder ? new Decimal(minimumOrder) : null,
        maximumDiscount: maximumDiscount ? new Decimal(maximumDiscount) : null,
        usageLimit,
        perUserLimit,
        freeShipping,
        startsAt,
        expiresAt,
      },
    });

    revalidatePath("/admin/coupons");
    revalidatePath(`/admin/coupons/${id}/edit`);
    return { success: true, data: coupon };
  } catch (error) {
    console.error("Error updating coupon:", error);
    return { success: false, error: "Failed to update coupon" };
  }
}

// Delete a coupon
export async function deleteCoupon(id: string) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    // Check if coupon has been used
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });

    if (!coupon) {
      return { success: false, error: "Coupon not found" };
    }

    if (coupon._count.orders > 0) {
      return {
        success: false,
        error:
          "Cannot delete a coupon that has been used. Deactivate it instead.",
      };
    }

    await prisma.coupon.delete({
      where: { id },
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return { success: false, error: "Failed to delete coupon" };
  }
}

// Toggle coupon status
export async function toggleCouponStatus(id: string) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return { success: false, error: "Coupon not found" };
    }

    await prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    return { success: false, error: "Failed to toggle coupon status" };
  }
}

// Validate a coupon code
export async function validateCoupon(
  code: string,
  orderTotal: number,
  userId?: string,
) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return { success: false, error: "Invalid coupon code" };
    }

    const now = new Date();

    // Check if coupon is active
    if (!coupon.isActive) {
      return { success: false, error: "This coupon is no longer active" };
    }

    // Check start date
    if (coupon.startsAt && coupon.startsAt > now) {
      return { success: false, error: "This coupon is not yet valid" };
    }

    // Check expiry date
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return { success: false, error: "This coupon has expired" };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return {
        success: false,
        error: "This coupon has reached its usage limit",
      };
    }

    // Check minimum order amount
    if (coupon.minimumOrder && orderTotal < coupon.minimumOrder.toNumber()) {
      return {
        success: false,
        error: `Minimum order amount is GHS ${coupon.minimumOrder.toFixed(2)}`,
      };
    }

    // Check per user limit if user is logged in
    if (userId && coupon.perUserLimit) {
      const userUsageCount = await prisma.order.count({
        where: {
          userId,
          couponId: coupon.id,
          paymentStatus: { in: ["paid", "pending"] },
        },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        return {
          success: false,
          error:
            "You have already used this coupon the maximum number of times",
        };
      }
    }

    // Calculate discount
    let discountAmount: number;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderTotal * coupon.discountValue.toNumber()) / 100;
      // Apply maximum discount cap for percentage coupons
      if (coupon.maximumDiscount) {
        discountAmount = Math.min(
          discountAmount,
          coupon.maximumDiscount.toNumber(),
        );
      }
    } else {
      discountAmount = coupon.discountValue.toNumber();
      // Fixed discount cannot exceed order total
      discountAmount = Math.min(discountAmount, orderTotal);
    }

    return {
      success: true,
      data: {
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toNumber(),
        discountAmount: Math.round(discountAmount * 100) / 100,
        freeShipping: coupon.freeShipping,
        description: coupon.description,
      },
    };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return { success: false, error: "Failed to validate coupon" };
  }
}

// Increment coupon usage (called after successful order)
export async function incrementCouponUsage(couponId: string) {
  try {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { usageCount: { increment: 1 } },
    });
    return { success: true };
  } catch (error) {
    console.error("Error incrementing coupon usage:", error);
    return { success: false, error: "Failed to increment coupon usage" };
  }
}
