"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Get all addresses for user
export async function getAddresses() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, data: addresses };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return { success: false, error: "Failed to fetch addresses" };
  }
}

// Get single address by ID
export async function getAddress(addressId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== session.user.id) {
      return { success: false, error: "Address not found" };
    }

    return { success: true, data: address };
  } catch (error) {
    console.error("Error fetching address:", error);
    return { success: false, error: "Failed to fetch address" };
  }
}

// Get default address
export async function getDefaultAddress() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const address = await prisma.address.findFirst({
      where: {
        userId: session.user.id,
        isDefault: true,
      },
    });

    return { success: true, data: address };
  } catch (error) {
    console.error("Error fetching default address:", error);
    return { success: false, error: "Failed to fetch default address" };
  }
}

// Create address
export async function createAddress(data: {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  district?: string;
  landmark?: string;
  isDefault?: boolean;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    revalidatePath("/checkout");
    revalidatePath("/addresses");
    revalidatePath("/dashboard/addresses");
    return { success: true, data: address };
  } catch (error) {
    console.error("Error creating address:", error);
    return { success: false, error: "Failed to create address" };
  }
}

// Update address
export async function updateAddress(
  addressId: string,
  data: {
    fullName?: string;
    phoneNumber?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    region?: string;
    district?: string;
    landmark?: string;
    isDefault?: boolean;
  },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Address not found" };
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          NOT: { id: addressId },
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data,
    });

    revalidatePath("/checkout");
    revalidatePath("/addresses");
    revalidatePath("/dashboard/addresses");
    return { success: true, data: address };
  } catch (error) {
    console.error("Error updating address:", error);
    return { success: false, error: "Failed to update address" };
  }
}

// Delete address
export async function deleteAddress(addressId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Address not found" };
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    revalidatePath("/checkout");
    revalidatePath("/addresses");
    revalidatePath("/dashboard/addresses");
    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: "Failed to delete address" };
  }
}

// Set default address
export async function setDefaultAddress(addressId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Address not found" };
    }

    // Unset other defaults and set this one
    await prisma.$transaction([
      prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    revalidatePath("/checkout");
    revalidatePath("/addresses");
    revalidatePath("/dashboard/addresses");
    return { success: true };
  } catch (error) {
    console.error("Error setting default address:", error);
    return { success: false, error: "Failed to set default address" };
  }
}
