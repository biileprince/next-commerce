import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadMultipleImages } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    const userWithRole = session?.user as typeof session.user & {
      role?: string;
    };

    if (!session?.user || userWithRole.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { images } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: "No images provided" },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary
    const result = await uploadMultipleImages(images, "products");

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to upload images" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      urls: result.urls,
      publicIds: result.publicIds,
    });
  } catch (error) {
    console.error("Error in upload API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
