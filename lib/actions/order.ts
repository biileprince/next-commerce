"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
      0
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
    } catch (paymentError: any) {
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
    } catch (paymentError: any) {
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
