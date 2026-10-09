import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/server/db";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!webhookSecret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not configured.");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // 1. Verify HMAC SHA-256 signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const signatureBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // 2. Handle successful capture
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      // 3. Atomic conditional update (Prevents race condition)
      await db.$transaction(async (tx) => {
        const updateResult = await tx.order.updateMany({
          where: {
            razorpayOrderId,
            status: "PENDING", // Only matches if NOT already paid
          },
          data: {
            status: "PAID",
            razorpayPaymentId,
          },
        });

        // If count === 0, the verify procedure already credited the user!
        if (updateResult.count === 0) {
          return;
        }

        // Fetch order to retrieve the credit amount and user
        const order = await tx.order.findUnique({
          where: { razorpayOrderId },
        });

        if (order) {
          await tx.user.update({
            where: { id: order.userId },
            data: {
              credits: {
                increment: order.credits,
              },
            },
          });
        }
      });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}