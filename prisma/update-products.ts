import "dotenv/config";
import prisma from "../lib/prisma";

async function updateProducts() {
  console.log("🔄 Updating products with sample ratings and discounts...");

  // Update first product with discount and rating
  await prisma.product.updateMany({
    where: { slug: "wireless-bluetooth-headphones" },
    data: {
      originalPrice: 600,
      price: 450,
      rating: 4.5,
      reviewCount: 127,
      isTop: true,
    },
  });

  // Update second product with rating
  await prisma.product.updateMany({
    where: { slug: "smart-fitness-watch" },
    data: {
      rating: 4.8,
      reviewCount: 234,
      isTop: true,
    },
  });

  // Update third product with discount
  await prisma.product.updateMany({
    where: { slug: "portable-power-bank-20000mah" },
    data: {
      originalPrice: 180,
      price: 120,
      rating: 4.2,
      reviewCount: 89,
    },
  });

  // Update fourth product as new
  await prisma.product.updateMany({
    where: { slug: "laptop-backpack-water-resistant" },
    data: {
      isNew: true,
      rating: 4.0,
      reviewCount: 45,
    },
  });

  // Update fifth product with big discount
  await prisma.product.updateMany({
    where: { slug: "wireless-gaming-mouse" },
    data: {
      originalPrice: 25000,
      price: 18000,
      rating: 4.7,
      reviewCount: 156,
    },
  });

  console.log("✅ Products updated successfully!");

  await prisma.$disconnect();
}

updateProducts().catch((error) => {
  console.error("Error updating products:", error);
  process.exit(1);
});
