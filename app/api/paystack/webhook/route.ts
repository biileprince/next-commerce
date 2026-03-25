import { headers } from "next/headers";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Webhook configuration error" },
        { status: 500 },
      );
    }

    const headersList = await headers();
    const signature = headersList.get("x-paystack-signature");

    if (!signature) {
      console.error("No signature in webhook request");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Read raw body
    const rawBody = await req.text();

    // Verify signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse event
    const event = JSON.parse(rawBody);
    console.log("Paystack webhook event:", event.event);

    // Handle charge.success event
    if (event.event === "charge.success") {
      const { reference, status, channel, authorization } = event.data;

      console.log(`Processing payment: ${reference}, status: ${status}`);

      // Update order
      const order = await prisma.order.findUnique({
        where: { paystackReference: reference },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "paid",
            paymentMethod: channel, // card, bank, ussd, mobile_money
            orderStatus: "confirmed",
            paidAt: new Date(),
            paystackAuthCode: authorization?.authorization_code || null,
          },
        });

        console.log(`Order ${order.orderNumber} marked as paid`);
      } else {
        console.warn(`Order not found for reference: ${reference}`);
      }
    }

    // Handle failed payment
    if (event.event === "charge.failed") {
      const { reference } = event.data;

      console.log(`Payment failed: ${reference}`);

      // Update order
      const order = await prisma.order.findUnique({
        where: { paystackReference: reference },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "failed",
          },
        });

        console.log(`Order ${order.orderNumber} marked as failed`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
