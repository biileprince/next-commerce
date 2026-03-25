"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

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

// Get dashboard analytics
export async function getDashboardAnalytics() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Revenue metrics
    const [
      todayRevenue,
      weekRevenue,
      monthRevenue,
      lastMonthRevenue,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: "paid", paidAt: { gte: today } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { paymentStatus: "paid", paidAt: { gte: thisWeekStart } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { paymentStatus: "paid", paidAt: { gte: thisMonthStart } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: "paid",
          paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { paymentStatus: "paid" },
        _sum: { totalAmount: true },
        _count: true,
      }),
    ]);

    // Order status counts
    const orderStatusCounts = await prisma.order.groupBy({
      by: ["orderStatus"],
      _count: true,
    });

    // Top products (by quantity sold)
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    // Low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: { lte: 5 },
      },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
        lowStockThreshold: true,
      },
      orderBy: { stockQuantity: "asc" },
      take: 10,
    });

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Customer metrics
    const [totalCustomers, newCustomersToday, newCustomersMonth] =
      await Promise.all([
        prisma.user.count({ where: { role: "customer" } }),
        prisma.user.count({
          where: { role: "customer", createdAt: { gte: today } },
        }),
        prisma.user.count({
          where: { role: "customer", createdAt: { gte: thisMonthStart } },
        }),
      ]);

    // Daily revenue for last 7 days (for chart)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRevenue = await prisma.order.aggregate({
        where: {
          paymentStatus: "paid",
          paidAt: { gte: date, lt: nextDate },
        },
        _sum: { totalAmount: true },
        _count: true,
      });

      last7Days.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: Number(dayRevenue._sum.totalAmount || 0),
        orders: dayRevenue._count,
      });
    }

    // Calculate average order value
    const avgOrderValue =
      totalRevenue._count > 0
        ? Number(totalRevenue._sum.totalAmount || 0) / totalRevenue._count
        : 0;

    // Month over month growth
    const currentMonthAmount = Number(monthRevenue._sum.totalAmount || 0);
    const lastMonthAmount = Number(lastMonthRevenue._sum.totalAmount || 0);
    const revenueGrowth =
      lastMonthAmount > 0
        ? ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100
        : 0;

    return {
      success: true,
      data: {
        revenue: {
          today: Number(todayRevenue._sum.totalAmount || 0),
          week: Number(weekRevenue._sum.totalAmount || 0),
          month: currentMonthAmount,
          lastMonth: lastMonthAmount,
          total: Number(totalRevenue._sum.totalAmount || 0),
          growth: revenueGrowth,
        },
        orders: {
          today: todayRevenue._count,
          week: weekRevenue._count,
          month: monthRevenue._count,
          total: totalRevenue._count,
          avgValue: avgOrderValue,
          byStatus: orderStatusCounts.reduce(
            (acc, item) => {
              acc[item.orderStatus] = item._count;
              return acc;
            },
            {} as Record<string, number>,
          ),
        },
        customers: {
          total: totalCustomers,
          newToday: newCustomersToday,
          newMonth: newCustomersMonth,
        },
        topProducts: topProducts.map((p) => ({
          productId: p.productId,
          productName: p.productName,
          quantity: p._sum.quantity || 0,
          revenue: Number(p._sum.subtotal || 0),
        })),
        lowStockProducts,
        recentOrders: recentOrders.map((o) => ({
          ...o,
          totalAmount: Number(o.totalAmount),
        })),
        chart: {
          last7Days,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return { success: false, error: "Failed to fetch analytics" };
  }
}
