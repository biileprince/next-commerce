"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { initializePayment } from "@/lib/paystack/client";

// Create order from cart
export async function createOrder(addressId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify address belongs to user
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== session.user.id) {
      return { success: false, error: "Invalid address" };
    }

    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    // Verify stock availability
    for (const item of cart.items) {
      if (item.product.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${item.product.name}`,
        };
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );
    const shippingCost = 2000; // Fixed shipping cost for MVP (NGN 2000)
    const totalAmount = subtotal + shippingCost;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const paystackReference = `ref-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          addressId,
          subtotal,
          shippingCost,
          totalAmount,
          paymentMethod: "pending", // Will be updated during payment
          paystackReference,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productPrice: item.product.price,
              quantity: item.quantity,
              subtotal: Number(item.product.price) * item.quantity,
            })),
          },
        },
        include: {
          items: true,
          address: true,
        },
      });

      // Update product stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // Initialize Paystack payment
    try {
      const paymentData = await initializePayment({
        email:
          session.user.email ||
          `${session.user.phoneNumber || "user"}@temp.com`,
        amount: Math.round(totalAmount * 100), // Convert to kobo
        reference: paystackReference,
        callback_url: `${process.env.BETTER_AUTH_URL}/orders/${order.id}?payment=success`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId: session.user.id,
        },
        channels: ["card", "bank", "ussd", "mobile_money"],
      });

      revalidatePath("/cart");
      revalidatePath("/orders");

      return {
        success: true,
        data: {
          orderId: order.id,
          paymentUrl: paymentData.authorization_url,
        },
      };
    } catch (paymentError) {
      // If payment initialization fails, we still have the order created
      console.error("Payment initialization failed:", paymentError);
      revalidatePath("/cart");
      revalidatePath("/orders");

      return {
        success: true,
        data: {
          orderId: order.id,
          paymentUrl: null,
          error:
            "Payment initialization failed. Please try again from your order page.",
        },
      };
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

// Get user's orders
export async function getOrders() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: orders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

// Get single order
export async function getOrder(orderId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order || order.userId !== session.user.id) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

// Cancel order (only if payment pending)
export async function cancelOrder(orderId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.userId !== session.user.id) {
      return { success: false, error: "Order not found" };
    }

    if (order.paymentStatus !== "pending") {
      return { success: false, error: "Cannot cancel paid order" };
    }

    if (order.orderStatus !== "pending") {
      return { success: false, error: "Cannot cancel processed order" };
    }

    // Cancel order and restore stock
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: "cancelled" },
      });

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, error: "Failed to cancel order" };
  }
}

// Retry payment for an existing order
export async function retryPayment(orderId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== session.user.id) {
      return { success: false, error: "Order not found" };
    }

    if (order.paymentStatus === "paid") {
      return { success: false, error: "Order already paid" };
    }

    if (order.orderStatus === "cancelled") {
      return { success: false, error: "Cannot pay for cancelled order" };
    }

    // Initialize Paystack payment
    try {
      const paymentData = await initializePayment({
        email:
          session.user.email ||
          `${session.user.phoneNumber || "user"}@temp.com`,
        amount: Math.round(Number(order.totalAmount) * 100), // Convert to kobo
        reference:
          order.paystackReference ||
          `ref-retry-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        callback_url: `${process.env.BETTER_AUTH_URL}/orders/${order.id}?payment=success`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId: session.user.id,
          isRetry: true,
        },
        channels: ["card", "bank", "ussd", "mobile_money"],
      });

      return {
        success: true,
        data: {
          paymentUrl: paymentData.authorization_url,
        },
      };
    } catch (paymentError) {
      console.error("Payment initialization failed:", paymentError);
      return {
        success: false,
        error: "Payment initialization failed. Please try again later.",
      };
    }
  } catch (error) {
    console.error("Error retrying payment:", error);
    return { success: false, error: "Failed to retry payment" };
  }
}

// Admin: Get all orders with filters, search, and pagination
export async function getAdminOrders({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
  paymentStatus = "all",
  startDate = "",
  endDate = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "totalAmount";
  sortOrder?: "asc" | "desc";
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userWithRole = session?.user as typeof session.user & {
      role?: string;
    };

    if (!session?.user || userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    // Build where clause
    const where: Prisma.OrderWhereInput = {
      AND: [
        // Search by order number
        search
          ? {
              orderNumber: { contains: search, mode: "insensitive" as const },
            }
          : {},
        // Filter by status
        status !== "all" ? { orderStatus: status } : {},
        // Filter by payment status
        paymentStatus !== "all" ? { paymentStatus } : {},
        // Filter by date range
        startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
              },
            }
          : {},
      ],
    };

    // Get total count
    const total = await prisma.order.count({ where });

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
        address: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

// Admin: Get single order by ID
export async function getAdminOrder(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userWithRole = session?.user as typeof session.user & {
      role?: string;
    };

    if (!session?.user || userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true,
              },
            },
          },
        },
        address: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

// Admin: Update order status
export async function updateOrderStatus(id: string, status: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userWithRole = session?.user as typeof session.user & {
      role?: string;
    };

    if (!session?.user || userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid status" };
    }

    // Prepare update data with timestamps
    const updateData: Record<string, unknown> = { orderStatus: status };

    // Auto-set timestamps based on status
    if (status === "shipped") {
      updateData.shippedAt = new Date();
    } else if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    await prisma.order.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

// Admin: Update payment status
export async function updatePaymentStatus(id: string, paymentStatus: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userWithRole = session?.user as typeof session.user & {
      role?: string;
    };

    if (!session?.user || userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const validStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return { success: false, error: "Invalid payment status" };
    }

    await prisma.order.update({
      where: { id },
      data: { paymentStatus },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}

// Admin: Update tracking number
export async function updateTrackingNumber(id: string, trackingNumber: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userWithRole = session?.user as typeof session.user & {
      role?: string;
    };

    if (!session?.user || userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.order.update({
      where: { id },
      data: { trackingNumber: trackingNumber || null },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating tracking number:", error);
    return { success: false, error: "Failed to update tracking number" };
  }
}

// Admin: Cancel order with stock restoration
export async function adminCancelOrder(id: string, reason?: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userWithRole = session?.user as typeof session.user & {
      role?: string;
    };

    if (!session?.user || userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.orderStatus === "cancelled") {
      return { success: false, error: "Order is already cancelled" };
    }

    if (order.orderStatus === "delivered") {
      return { success: false, error: "Cannot cancel a delivered order" };
    }

    // Cancel order and restore stock in transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          orderStatus: "cancelled",
        },
      });

      // Restore stock for each item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${id}`);
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, error: "Failed to cancel order" };
  }
}

// Admin: Process refund
export async function adminRefundOrder(id: string, reason?: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userWithRole = session?.user as typeof session.user & {
      role?: string;
    };

    if (!session?.user || userWithRole.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.paymentStatus !== "paid") {
      return { success: false, error: "Can only refund paid orders" };
    }

    if (order.paymentStatus === "refunded") {
      return { success: false, error: "Order is already refunded" };
    }

    // Process refund and restore stock
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          paymentStatus: "refunded",
          orderStatus: "cancelled",
        },
      });

      // Restore stock for each item
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${id}`);
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error refunding order:", error);
    return { success: false, error: "Failed to refund order" };
  }
}
