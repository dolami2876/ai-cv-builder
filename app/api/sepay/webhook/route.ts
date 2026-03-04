import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getPlanByAmount, parsePlanFromPaymentContent } from "@/lib/payment/plans";

function extractApiKeyFromAuthorization(authHeader: string | null) {
  if (!authHeader) return "";
  const value = authHeader.trim();

  // SePay sends: Authorization: Apikey <API_KEY>
  if (/^apikey\s+/i.test(value)) {
    return value.replace(/^apikey\s+/i, "").trim();
  }

  // Backward compatibility (if needed)
  if (/^bearer\s+/i.test(value)) {
    return value.replace(/^bearer\s+/i, "").trim();
  }

  return value;
}

export async function POST(req: NextRequest) {
  try {
    const expectedSecret = process.env.SEPAY_WEBHOOK_SECRET || "";

    if (expectedSecret) {
      const authHeader = req.headers.get("authorization");
      const apiKeyFromAuth = extractApiKeyFromAuthorization(authHeader);
      const apiKeyDirect = req.headers.get("x-api-key") || req.headers.get("x-sepay-token") || "";
      const providedSecret = apiKeyFromAuth || apiKeyDirect;

      if (!providedSecret || providedSecret !== expectedSecret) {
        return NextResponse.json({ success: false, message: "Unauthorized webhook" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { content, transferAmount, referenceCode, id, transactionDate } = body;

    const parsed = parsePlanFromPaymentContent(content);
    if (!parsed) {
      return NextResponse.json({ success: false, message: "Invalid content" }, { status: 400 });
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

    // Idempotency: do not grant credits twice for same transaction
    const existing = await User.findOne({
      clerkId: parsed.clerkId,
      "paymentHistory.transactionId": transactionId,
    }).lean();

    if (existing) {
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: "SePay webhook is running" });
}
