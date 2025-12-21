import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  console.log("🌱 Starting database seed...");

  // Check if products already exist
  const existingProducts = await prisma.product.count();

  if (existingProducts > 0) {
    console.log(
      `ℹ️  Database already has ${existingProducts} products. Skipping product creation.`
    );
  } else {
    // Create sample products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "Wireless Bluetooth Headphones",
          slug: "wireless-bluetooth-headphones",
          description:
            "Premium wireless headphones with noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.",
          price: 45000,
          currency: "NGN",
          stockQuantity: 50,
          images: ["/products/headphones-1.jpg"],
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "Smart Fitness Watch",
          slug: "smart-fitness-watch",
          description:
            "Track your health and fitness goals with this advanced smartwatch. Features heart rate monitoring, GPS, sleep tracking, and 100+ workout modes.",
          price: 35000,
          currency: "NGN",
          stockQuantity: 30,
          images: ["/products/watch-1.jpg"],
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "Portable Power Bank 20000mAh",
          slug: "portable-power-bank-20000mah",
          description:
            "High-capacity power bank with fast charging technology. Charge multiple devices simultaneously with dual USB ports and USB-C.",
          price: 12000,
          currency: "NGN",
          stockQuantity: 100,
          images: ["/products/powerbank-1.jpg"],
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "Laptop Backpack - Water Resistant",
          slug: "laptop-backpack-water-resistant",
          description:
            "Durable, water-resistant backpack with padded laptop compartment (fits up to 17 inches), multiple pockets, and ergonomic design.",
          price: 15000,
          currency: "NGN",
          stockQuantity: 75,
          images: ["/products/backpack-1.jpg"],
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "Wireless Gaming Mouse",
          slug: "wireless-gaming-mouse",
          description:
            "Professional gaming mouse with 16000 DPI, RGB lighting, programmable buttons, and ultra-responsive wireless connection.",
          price: 18000,
          currency: "NGN",
          stockQuantity: 40,
          images: ["/products/mouse-1.jpg"],
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "USB-C Hub 7-in-1",
          slug: "usb-c-hub-7-in-1",
          description:
            "Expand your laptop connectivity with HDMI, USB 3.0, SD card reader, and more. Perfect for MacBook and Windows laptops.",
          price: 8500,
          currency: "NGN",
          stockQuantity: 60,
          images: ["/products/hub-1.jpg"],
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "Mechanical Keyboard RGB",
          slug: "mechanical-keyboard-rgb",
          description:
            "Professional mechanical keyboard with customizable RGB backlighting, tactile switches, and anti-ghosting technology.",
          price: 25000,
          currency: "NGN",
          stockQuantity: 35,
          images: ["/products/keyboard-1.jpg"],
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "HD Webcam 1080p",
          slug: "hd-webcam-1080p",
          description:
            "Crystal-clear video calls with 1080p resolution, auto-focus, built-in microphone, and wide-angle lens. Ideal for remote work.",
          price: 22000,
          currency: "NGN",
          stockQuantity: 45,
          images: ["/products/webcam-1.jpg"],
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "Phone Stand with Wireless Charging",
          slug: "phone-stand-wireless-charging",
          description:
            "Convenient 2-in-1 phone stand and wireless charger. Supports both portrait and landscape mode with fast charging.",
          price: 9500,
          currency: "NGN",
          stockQuantity: 80,
          images: ["/products/stand-1.jpg"],
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "Bluetooth Speaker - Waterproof",
          slug: "bluetooth-speaker-waterproof",
          description:
            "Portable waterproof speaker with 360° sound, 12-hour battery life, and rugged design. Perfect for outdoor adventures.",
          price: 16500,
          currency: "NGN",
          stockQuantity: 55,
          images: ["/products/speaker-1.jpg"],
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "External SSD 1TB",
          slug: "external-ssd-1tb",
          description:
            "Ultra-fast external SSD with 1TB storage, USB 3.2 Gen 2 interface, and compact aluminum design. Transfer speeds up to 1050MB/s.",
          price: 42000,
          currency: "NGN",
          stockQuantity: 25,
          images: ["/products/ssd-1.jpg"],
          isActive: true,
        },
      }),
      prisma.product.create({
        data: {
          name: "Desk Lamp LED with USB Port",
          slug: "desk-lamp-led-usb-port",
          description:
            "Adjustable LED desk lamp with touch control, 5 brightness levels, 3 color modes, and built-in USB charging port.",
          price: 11000,
          currency: "NGN",
          stockQuantity: 70,
          images: ["/products/lamp-1.jpg"],
          isActive: true,
        },
      }),
    ]);

    console.log(`✅ Created ${products.length} products`);
  }

  // Create a test user (optional)
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      emailVerified: true,
    },
  });

  console.log(`✅ Created test user: ${testUser.email}`);

  // Create a test address for the user
  const testAddress = await prisma.address.create({
    data: {
      userId: testUser.id,
      fullName: "Test User",
      phoneNumber: "+2348012345678",
      addressLine1: "123 Test Street",
      city: "Lagos",
      state: "Lagos",
      lga: "Ikeja",
      landmark: "Near Test Landmark",
      isDefault: true,
    },
  });

  console.log(`✅ Created test address for ${testUser.email}`);

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
