import "dotenv/config";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting database seed...");

  const categories = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "Phones, laptops, TVs, and electronic accessories",
    },
    {
      name: "Fashion",
      slug: "fashion",
      description: "Clothing, shoes, bags, and fashion accessories",
    },
    {
      name: "Home & Living",
      slug: "home",
      description: "Furniture, home decor, kitchen, and appliances",
    },
    {
      name: "Beauty & Health",
      slug: "beauty",
      description: "Skincare, makeup, fragrances, and health products",
    },
    {
      name: "Sports & Outdoors",
      slug: "sports",
      description: "Sporting equipment, fitness gear, and outdoor activities",
    },
    {
      name: "Toys & Games",
      slug: "toys",
      description: "Toys, games, and entertainment for kids",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        isActive: true,
      },
      create: {
        ...category,
        isActive: true,
      },
    });
  }
  console.log(`✅ Upserted ${categories.length} categories`);

  const categoryMap = new Map(
    (
      await prisma.category.findMany({
        select: { id: true, slug: true },
      })
    ).map((category) => [category.slug, category.id]),
  );

  const productsSeed = [
    {
      name: "Wireless Bluetooth Headphones",
      slug: "wireless-bluetooth-headphones",
      description:
        "Premium wireless headphones with noise cancellation and long battery life.",
      price: 450,
      currency: "GHS",
      stockQuantity: 50,
      categorySlug: "electronics",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Smart Fitness Watch",
      slug: "smart-fitness-watch",
      description:
        "Advanced smartwatch with heart rate tracking, GPS, and sleep insights.",
      price: 350,
      currency: "GHS",
      stockQuantity: 30,
      categorySlug: "electronics",
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Portable Power Bank 20000mAh",
      slug: "portable-power-bank-20000mah",
      description:
        "High-capacity power bank with fast charging and dual USB output.",
      price: 120,
      currency: "GHS",
      stockQuantity: 100,
      categorySlug: "electronics",
      images: [
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Laptop Backpack - Water Resistant",
      slug: "laptop-backpack-water-resistant",
      description:
        "Durable backpack with laptop compartment and multiple utility pockets.",
      price: 260,
      currency: "GHS",
      stockQuantity: 75,
      categorySlug: "fashion",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Wireless Gaming Mouse",
      slug: "wireless-gaming-mouse",
      description:
        "Ergonomic gaming mouse with high-precision sensor and RGB accents.",
      price: 180,
      currency: "GHS",
      stockQuantity: 40,
      categorySlug: "electronics",
      images: [
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1629429407756-01cd3d7cfb38?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "USB-C Hub 7-in-1",
      slug: "usb-c-hub-7-in-1",
      description:
        "Versatile USB-C hub with HDMI, USB 3.0 ports, and SD card support.",
      price: 135,
      currency: "GHS",
      stockQuantity: 60,
      categorySlug: "electronics",
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Mechanical Keyboard RGB",
      slug: "mechanical-keyboard-rgb",
      description:
        "Responsive mechanical keyboard with tactile switches and RGB backlight.",
      price: 240,
      currency: "GHS",
      stockQuantity: 35,
      categorySlug: "electronics",
      images: [
        "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "HD Webcam 1080p",
      slug: "hd-webcam-1080p",
      description:
        "Sharp 1080p webcam with autofocus and integrated noise-reduction mic.",
      price: 210,
      currency: "GHS",
      stockQuantity: 45,
      categorySlug: "electronics",
      images: [
        "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Bluetooth Speaker - Waterproof",
      slug: "bluetooth-speaker-waterproof",
      description:
        "Portable waterproof speaker delivering clear 360-degree sound.",
      price: 165,
      currency: "GHS",
      stockQuantity: 55,
      categorySlug: "electronics",
      images: [
        "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "External SSD 1TB",
      slug: "external-ssd-1tb",
      description:
        "Compact high-speed external SSD for creators and professionals.",
      price: 520,
      currency: "GHS",
      stockQuantity: 25,
      categorySlug: "electronics",
      images: [
        "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Desk Lamp LED with USB Port",
      slug: "desk-lamp-led-usb-port",
      description:
        "Adjustable LED desk lamp with multiple brightness levels and USB output.",
      price: 110,
      currency: "GHS",
      stockQuantity: 70,
      categorySlug: "home",
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Modern Coffee Table",
      slug: "modern-coffee-table",
      description: "Minimalist coffee table built for modern living rooms.",
      price: 790,
      currency: "GHS",
      stockQuantity: 18,
      categorySlug: "home",
      images: [
        "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Ceramic Dinnerware Set",
      slug: "ceramic-dinnerware-set",
      description:
        "Elegant ceramic dinnerware set for everyday and special occasions.",
      price: 330,
      currency: "GHS",
      stockQuantity: 32,
      categorySlug: "home",
      images: [
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Classic Denim Jacket",
      slug: "classic-denim-jacket",
      description:
        "Timeless denim jacket with comfortable fit and durable finish.",
      price: 280,
      currency: "GHS",
      stockQuantity: 45,
      categorySlug: "fashion",
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Leather Crossbody Bag",
      slug: "leather-crossbody-bag",
      description:
        "Premium crossbody bag designed for style and daily practicality.",
      price: 340,
      currency: "GHS",
      stockQuantity: 28,
      categorySlug: "fashion",
      images: [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Yoga Mat Pro",
      slug: "yoga-mat-pro",
      description:
        "Non-slip yoga mat with comfortable cushioning for studio and home use.",
      price: 145,
      currency: "GHS",
      stockQuantity: 65,
      categorySlug: "sports",
      images: [
        "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518611843775-014b5f29e4b2?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Resistance Bands Set",
      slug: "resistance-bands-set",
      description:
        "Multi-level resistance band set for strength and mobility training.",
      price: 99,
      currency: "GHS",
      stockQuantity: 90,
      categorySlug: "sports",
      images: [
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Adjustable Dumbbell Pair",
      slug: "adjustable-dumbbell-pair",
      description:
        "Compact adjustable dumbbells for full-body strength workouts at home.",
      price: 620,
      currency: "GHS",
      stockQuantity: 24,
      categorySlug: "sports",
      images: [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Camping Tent 4-Person",
      slug: "camping-tent-4-person",
      description:
        "Weather-resistant 4-person tent with quick setup for outdoor adventures.",
      price: 890,
      currency: "GHS",
      stockQuantity: 15,
      categorySlug: "sports",
      images: [
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Mountain Bike Helmet",
      slug: "mountain-bike-helmet",
      description:
        "Lightweight bike helmet with ventilation channels and secure fit dial.",
      price: 215,
      currency: "GHS",
      stockQuantity: 52,
      categorySlug: "sports",
      images: [
        "https://images.unsplash.com/photo-1576858574144-9ae1ebcf5ae5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Hydrating Face Serum",
      slug: "hydrating-face-serum",
      description:
        "Lightweight face serum with hyaluronic hydration for all skin types.",
      price: 130,
      currency: "GHS",
      stockQuantity: 84,
      categorySlug: "beauty",
      images: [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Vitamin C Glow Cleanser",
      slug: "vitamin-c-glow-cleanser",
      description:
        "Brightening facial cleanser formulated with vitamin C for daily use.",
      price: 112,
      currency: "GHS",
      stockQuantity: 76,
      categorySlug: "beauty",
      images: [
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Nourish Hair Repair Mask",
      slug: "nourish-hair-repair-mask",
      description:
        "Deep conditioning hair mask that restores shine and strengthens strands.",
      price: 148,
      currency: "GHS",
      stockQuantity: 62,
      categorySlug: "beauty",
      images: [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "SPF 50 Daily Sun Shield",
      slug: "spf-50-daily-sun-shield",
      description:
        "Lightweight broad-spectrum sunscreen with sweat-resistant protection.",
      price: 124,
      currency: "GHS",
      stockQuantity: 95,
      categorySlug: "beauty",
      images: [
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Shea Body Butter Cream",
      slug: "shea-body-butter-cream",
      description:
        "Rich body butter cream infused with shea to deeply moisturize dry skin.",
      price: 96,
      currency: "GHS",
      stockQuantity: 88,
      categorySlug: "beauty",
      images: [
        "https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Kids Building Blocks Set",
      slug: "kids-building-blocks-set",
      description:
        "Creative building blocks set that inspires STEM play for children.",
      price: 175,
      currency: "GHS",
      stockQuantity: 48,
      categorySlug: "toys",
      images: [
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Remote Control Racing Car",
      slug: "remote-control-racing-car",
      description:
        "High-speed remote control car with durable tires for indoor and outdoor play.",
      price: 260,
      currency: "GHS",
      stockQuantity: 40,
      categorySlug: "toys",
      images: [
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Family Strategy Board Game",
      slug: "family-strategy-board-game",
      description:
        "Interactive strategy board game designed for family game nights.",
      price: 145,
      currency: "GHS",
      stockQuantity: 58,
      categorySlug: "toys",
      images: [
        "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1606509031842-6e6d9c30f0cc?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      name: "Kids Puzzle Adventure 500 Pieces",
      slug: "kids-puzzle-adventure-500-pieces",
      description:
        "Colorful 500-piece puzzle set that builds problem-solving and focus.",
      price: 89,
      currency: "GHS",
      stockQuantity: 74,
      categorySlug: "toys",
      images: [
        "https://images.unsplash.com/photo-1587440871875-191322ee64b0?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  ];

  for (const product of productsSeed) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        stockQuantity: product.stockQuantity,
        images: product.images,
        isActive: true,
        categoryId: categoryMap.get(product.categorySlug) || null,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        currency: product.currency,
        stockQuantity: product.stockQuantity,
        images: product.images,
        isActive: true,
        categoryId: categoryMap.get(product.categorySlug) || null,
      },
    });
  }
  console.log(`✅ Upserted ${productsSeed.length} products`);

  // Add percentage-off pricing on selected products (originalPrice > price)
  const percentageOffProducts = [
    { slug: "wireless-bluetooth-headphones", originalPrice: 520 },
    { slug: "smart-fitness-watch", originalPrice: 410 },
    { slug: "modern-coffee-table", originalPrice: 920 },
    { slug: "classic-denim-jacket", originalPrice: 350 },
    { slug: "hydrating-face-serum", originalPrice: 165 },
  ];

  for (const item of percentageOffProducts) {
    await prisma.product.update({
      where: { slug: item.slug },
      data: {
        originalPrice: item.originalPrice,
      },
    });
  }
  console.log(
    `✅ Applied percentage-off pricing to ${percentageOffProducts.length} products`,
  );

  // Seed product badges
  const badges = [
    {
      name: "bestseller",
      label: "Best Seller",
      color: "#16A34A",
      textColor: "#FFFFFF",
    },
    {
      name: "new",
      label: "New Arrival",
      color: "#2563EB",
      textColor: "#FFFFFF",
    },
    {
      name: "sale",
      label: "Sale",
      color: "#DC2626",
      textColor: "#FFFFFF",
    },
    {
      name: "featured",
      label: "Featured",
      color: "#7C3AED",
      textColor: "#FFFFFF",
    },
  ];

  for (const badge of badges) {
    await prisma.productBadge.upsert({
      where: { name: badge.name },
      update: {
        label: badge.label,
        color: badge.color,
        textColor: badge.textColor,
        isActive: true,
      },
      create: {
        ...badge,
        isActive: true,
      },
    });
  }
  console.log(`✅ Upserted ${badges.length} product badges`);

  // Assign badges to selected products
  const products = await prisma.product.findMany({
    select: { id: true, slug: true },
  });
  const productIdBySlug = new Map(
    products.map((product) => [product.slug, product.id]),
  );

  const badgeRows = await prisma.productBadge.findMany({
    select: { id: true, name: true },
  });
  const badgeIdByName = new Map(
    badgeRows.map((badge) => [badge.name, badge.id]),
  );

  const badgeAssignments: Array<{ productSlug: string; badgeName: string }> = [
    { productSlug: "wireless-bluetooth-headphones", badgeName: "bestseller" },
    { productSlug: "wireless-bluetooth-headphones", badgeName: "sale" },
    { productSlug: "smart-fitness-watch", badgeName: "featured" },
    { productSlug: "modern-coffee-table", badgeName: "featured" },
    { productSlug: "classic-denim-jacket", badgeName: "new" },
    { productSlug: "hydrating-face-serum", badgeName: "new" },
    { productSlug: "kids-building-blocks-set", badgeName: "bestseller" },
  ];

  for (const assignment of badgeAssignments) {
    const productId = productIdBySlug.get(assignment.productSlug);
    const badgeId = badgeIdByName.get(assignment.badgeName);

    if (!productId || !badgeId) continue;

    await prisma.productBadgeAssignment.upsert({
      where: {
        productId_badgeId: {
          productId,
          badgeId,
        },
      },
      update: {},
      create: {
        productId,
        badgeId,
      },
    });
  }
  console.log(
    `✅ Upserted ${badgeAssignments.length} product badge assignments`,
  );

  // Seed coupons (including percentage-off coupons)
  const now = new Date();
  const in60Days = new Date(now);
  in60Days.setDate(in60Days.getDate() + 60);

  const coupons = [
    {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "percentage",
      discountValue: 10,
      minimumOrder: 100,
      maximumDiscount: 120,
      usageLimit: 500,
      perUserLimit: 1,
      freeShipping: false,
      startsAt: now,
      expiresAt: in60Days,
    },
    {
      code: "SAVE20",
      description: "20% off selected campaigns",
      discountType: "percentage",
      discountValue: 20,
      minimumOrder: 200,
      maximumDiscount: 250,
      usageLimit: 300,
      perUserLimit: 2,
      freeShipping: false,
      startsAt: now,
      expiresAt: in60Days,
    },
    {
      code: "FREESHIP",
      description: "Free shipping on qualifying orders",
      discountType: "fixed",
      discountValue: 0,
      minimumOrder: 150,
      maximumDiscount: null,
      usageLimit: 1000,
      perUserLimit: 3,
      freeShipping: true,
      startsAt: now,
      expiresAt: in60Days,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrder: coupon.minimumOrder,
        maximumDiscount: coupon.maximumDiscount,
        usageLimit: coupon.usageLimit,
        perUserLimit: coupon.perUserLimit,
        freeShipping: coupon.freeShipping,
        isActive: true,
        startsAt: coupon.startsAt,
        expiresAt: coupon.expiresAt,
      },
      create: {
        ...coupon,
        isActive: true,
      },
    });
  }
  console.log(`✅ Upserted ${coupons.length} coupons`);

  async function upsertUserWithCredential({
    email,
    name,
    role,
    status,
    password,
  }: {
    email: string;
    name: string;
    role: "admin" | "customer";
    status: "active" | "suspended" | "banned";
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        role,
        status,
        emailVerified: true,
      },
      create: {
        email,
        name,
        role,
        status,
        emailVerified: true,
      },
    });

    await prisma.account.upsert({
      where: {
        id: `${user.id}-credential`,
      },
      update: {
        password: hashedPassword,
        providerId: "credential",
        accountId: email,
      },
      create: {
        id: `${user.id}-credential`,
        userId: user.id,
        accountId: email,
        providerId: "credential",
        password: hashedPassword,
      },
    });

    return user;
  }

  const adminUser = await upsertUserWithCredential({
    email: "admin@nextcommerse.com",
    name: "NextCommerse Admin",
    role: "admin",
    status: "active",
    password: "Admin@1234",
  });

  const customerUser = await upsertUserWithCredential({
    email: "customer@nextcommerse.com",
    name: "Ama Mensah",
    role: "customer",
    status: "active",
    password: "Customer@1234",
  });

  await prisma.address.upsert({
    where: { id: `default-address-${customerUser.id}` },
    update: {
      fullName: customerUser.name,
      phoneNumber: "+233244123456",
      addressLine1: "15 Osu Oxford Street",
      city: "Accra",
      region: "Greater Accra",
      district: "Accra Metropolitan",
      landmark: "Near Osu Shell",
      isDefault: true,
    },
    create: {
      id: `default-address-${customerUser.id}`,
      userId: customerUser.id,
      fullName: customerUser.name,
      phoneNumber: "+233244123456",
      addressLine1: "15 Osu Oxford Street",
      city: "Accra",
      region: "Greater Accra",
      district: "Accra Metropolitan",
      landmark: "Near Osu Shell",
      isDefault: true,
    },
  });

  console.log(
    `✅ Upserted users: ${adminUser.email} (admin), ${customerUser.email} (customer)`,
  );

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
