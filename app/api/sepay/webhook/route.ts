import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getPlanByAmount, parsePlanFromPaymentContent } from "@/lib/payment/plans";

function isAuthorized(req: NextRequest) {
  const expectedSecret = process.env.SEPAY_WEBHOOK_SECRET;
  if (!expectedSecret) return true;

  const tokenHeader = req.headers.get("x-sepay-token");
  const apiKeyHeader = req.headers.get("x-api-key");
  const authHeader = req.headers.get("authorization");

  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : authHeader;

  const incomingToken = tokenHeader || apiKeyHeader || bearerToken;
  return incomingToken === expectedSecret;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ success: false, message: "Unauthorized webhook" }, { status: 401 });
    }

    const body = await req.json();
    const { content, transferAmount, referenceCode, id, transactionDate } = body;

    const parsed = parsePlanFromPaymentContent(String(content || ""));
    if (!parsed) {
      return NextResponse.json({ success: false, message: "Invalid transfer content" }, { status: 400 });
    }

    const plan = getPlanByAmount(Number(transferAmount));
    if (!plan) {
      return NextResponse.json({ success: false, message: "Unsupported plan amount" }, { status: 400 });
    }

    if (plan.code !== parsed.plan) {
      return NextResponse.json({ success: false, message: "Plan mismatch with amount" }, { status: 400 });
    }

    const transactionId = String(referenceCode || id || "").trim();
    if (!transactionId) {
      return NextResponse.json({ success: false, message: "Missing transaction id" }, { status: 400 });
    }

    await connectDB();

    // Idempotency: if transaction already recorded then skip crediting again
    const existed = await User.findOne({
      clerkId: parsed.clerkId,
      "paymentHistory.transactionId": transactionId,
    }).lean();

    if (existed) {
      return NextResponse.json({ success: true, duplicated: true, message: "Transaction already processed" });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: parsed.clerkId },
      {
        $set: { isPremium: plan.code !== "FREE" },
        $inc: { credits: plan.credits },
        $push: {
          paymentHistory: {
            transactionId,
            amount: Number(transferAmount),
            date: transactionDate ? new Date(transactionDate) : new Date(),
            status: `success:${plan.code}`,
          },
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, plan, user });
  } catch (error) {
    console.error("Sepay Webhook Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/sepay/webhook",
    message: "SePay webhook is ready",
  });
}
