import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to upload image from base64
export async function uploadImage(
  base64Image: string,
  folder: string = "products"
) {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `nextcommerse/${folder}`,
      resource_type: "auto",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return {
      success: false,
      error: "Failed to upload image",
    };
  }
}

// Helper function to delete image
export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return { success: false, error: "Failed to delete image" };
  }
}

// Helper function to upload multiple images
export async function uploadMultipleImages(
  base64Images: string[],
  folder: string = "products"
) {
  try {
    const uploadPromises = base64Images.map((image) =>
      uploadImage(image, folder)
    );
    const results = await Promise.all(uploadPromises);

    const successfulUploads = results.filter((r) => r.success);
    const failedUploads = results.filter((r) => !r.success);

    return {
      success: failedUploads.length === 0,
      urls: successfulUploads.map((r) => r.url!),
      publicIds: successfulUploads.map((r) => r.publicId!),
      failedCount: failedUploads.length,
    };
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    return {
      success: false,
      error: "Failed to upload images",
      urls: [],
      publicIds: [],
      failedCount: base64Images.length,
    };
  }
}
