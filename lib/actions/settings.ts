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

// Default settings
const DEFAULT_SETTINGS: Record<
  string,
  { value: string; type: string; description: string; isPublic: boolean }
> = {
  store_name: {
    value: "NextCommerse",
    type: "string",
    description: "Store name displayed across the site",
    isPublic: true,
  },
  store_description: {
    value: "Your African E-Commerce Platform",
    type: "string",
    description: "Store tagline/description",
    isPublic: true,
  },
  store_email: {
    value: "contact@store.com",
    type: "string",
    description: "Contact email address",
    isPublic: true,
  },
  store_phone: {
    value: "+233 XX XXX XXXX",
    type: "string",
    description: "Contact phone number",
    isPublic: true,
  },
  store_address: {
    value: "Accra, Ghana",
    type: "string",
    description: "Physical store address",
    isPublic: true,
  },
  default_currency: {
    value: "GHS",
    type: "string",
    description: "Default currency code (GHS for Ghana Cedis)",
    isPublic: true,
  },
  currency_symbol: {
    value: "GH₵",
    type: "string",
    description: "Currency symbol to display",
    isPublic: true,
  },
  shipping_fee: {
    value: "20",
    type: "number",
    description: "Default shipping fee in GHS",
    isPublic: true,
  },
  free_shipping_threshold: {
    value: "500",
    type: "number",
    description: "Order amount for free shipping (0 to disable)",
    isPublic: true,
  },
  low_stock_threshold: {
    value: "5",
    type: "number",
    description: "Alert when product stock falls below this",
    isPublic: false,
  },
  order_prefix: {
    value: "ORD",
    type: "string",
    description: "Prefix for order numbers",
    isPublic: false,
  },
  enable_reviews: {
    value: "true",
    type: "boolean",
    description: "Allow customers to leave product reviews",
    isPublic: true,
  },
  auto_approve_reviews: {
    value: "false",
    type: "boolean",
    description: "Automatically approve new reviews",
    isPublic: false,
  },
  enable_wishlist: {
    value: "true",
    type: "boolean",
    description: "Allow customers to save items to wishlist",
    isPublic: true,
  },
  enable_coupons: {
    value: "true",
    type: "boolean",
    description: "Enable coupon/promo code functionality",
    isPublic: true,
  },
};

// Get all settings
export async function getSettings() {
  try {
    const settings = await prisma.storeSetting.findMany();

    // Merge with defaults
    const settingsMap: Record<
      string,
      { value: string; type: string; description: string; isPublic: boolean }
    > = {};

    // Add defaults first
    for (const [key, defaultSetting] of Object.entries(DEFAULT_SETTINGS)) {
      settingsMap[key] = defaultSetting;
    }

    // Override with database values
    for (const setting of settings) {
      settingsMap[setting.key] = {
        value: setting.value,
        type: setting.type,
        description: setting.description || "",
        isPublic: setting.isPublic,
      };
    }

    return { success: true, data: settingsMap };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { success: false, error: "Failed to fetch settings" };
  }
}

// Get public settings (for frontend)
export async function getPublicSettings() {
  try {
    const settings = await prisma.storeSetting.findMany({
      where: { isPublic: true },
    });

    const settingsMap: Record<string, string> = {};

    // Add public defaults first
    for (const [key, defaultSetting] of Object.entries(DEFAULT_SETTINGS)) {
      if (defaultSetting.isPublic) {
        settingsMap[key] = defaultSetting.value;
      }
    }

    // Override with database values
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return { success: true, data: settingsMap };
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return { success: false, error: "Failed to fetch settings" };
  }
}

// Get a single setting value
export async function getSetting(key: string) {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key },
    });

    if (setting) {
      return { success: true, value: setting.value };
    }

    // Return default if exists
    if (DEFAULT_SETTINGS[key]) {
      return { success: true, value: DEFAULT_SETTINGS[key].value };
    }

    return { success: false, error: "Setting not found" };
  } catch (error) {
    console.error("Error fetching setting:", error);
    return { success: false, error: "Failed to fetch setting" };
  }
}

// Update a setting (admin only)
export async function updateSetting(key: string, value: string) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    const defaultSetting = DEFAULT_SETTINGS[key];

    await prisma.storeSetting.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        type: defaultSetting?.type || "string",
        description: defaultSetting?.description || "",
        isPublic: defaultSetting?.isPublic ?? false,
      },
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating setting:", error);
    return { success: false, error: "Failed to update setting" };
  }
}

// Update multiple settings at once (admin only)
export async function updateSettings(settings: Record<string, string>) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    await prisma.$transaction(
      Object.entries(settings).map(([key, value]) => {
        const defaultSetting = DEFAULT_SETTINGS[key];
        return prisma.storeSetting.upsert({
          where: { key },
          update: { value },
          create: {
            key,
            value,
            type: defaultSetting?.type || "string",
            description: defaultSetting?.description || "",
            isPublic: defaultSetting?.isPublic ?? false,
          },
        });
      }),
    );

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

// Initialize default settings in database
export async function initializeSettings() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.authorized) {
    return { success: false, error: adminCheck.error };
  }

  try {
    await prisma.$transaction(
      Object.entries(DEFAULT_SETTINGS).map(([key, setting]) =>
        prisma.storeSetting.upsert({
          where: { key },
          update: {},
          create: {
            key,
            value: setting.value,
            type: setting.type,
            description: setting.description,
            isPublic: setting.isPublic,
          },
        }),
      ),
    );

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error initializing settings:", error);
    return { success: false, error: "Failed to initialize settings" };
  }
}
