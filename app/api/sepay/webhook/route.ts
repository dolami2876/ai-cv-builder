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

  // Backward compatibility
  if (/^bearer\s+/i.test(value)) {
    return value.replace(/^bearer\s+/i, "").trim();
  }

  return value;
}

function maskSecret(value: string) {
  if (!value) return "";
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}***${value.slice(-2)}`;
}

export async function POST(req: NextRequest) {
  try {
    const expectedSecret = process.env.SEPAY_WEBHOOK_SECRET || "";

    const authHeader = req.headers.get("authorization");
    const apiKeyFromAuth = extractApiKeyFromAuthorization(authHeader);
    const apiKeyDirect = req.headers.get("x-api-key") || req.headers.get("x-sepay-token") || "";
    const providedSecret = apiKeyFromAuth || apiKeyDirect;

    if (expectedSecret && (!providedSecret || providedSecret !== expectedSecret)) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "UNAUTHORIZED_WEBHOOK",
          message: "Webhook authentication failed",
          details: {
            reason: !providedSecret ? "Missing API key" : "API key mismatch",
            expectedAuthMode: "Authorization: Apikey <SEPAY_WEBHOOK_SECRET>",
            receivedHeaders: {
              authorizationPresent: Boolean(authHeader),
              xApiKeyPresent: Boolean(req.headers.get("x-api-key")),
              xSepayTokenPresent: Boolean(req.headers.get("x-sepay-token")),
            },
            providedSecretMasked: maskSecret(providedSecret),
          },
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content, transferAmount, referenceCode, id, transactionDate } = body || {};

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "MISSING_CONTENT",
          message: "Missing transfer content",
          details: {
            expected: "CVPLAN_<PLAN>_<clerkId>",
            received: content ?? null,
          },
        },
        { status: 400 }
      );
    }

    const parsed = parsePlanFromPaymentContent(String(content));
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INVALID_CONTENT_FORMAT",
          message: "Invalid content format",
          details: {
            expected: "CVPLAN_<FREE|STARTER|PROFESSIONAL>_<clerkId>",
            received: content,
          },
        },
        { status: 400 }
      );
    }

    const amount = Number(transferAmount);
    if (Number.isNaN(amount)) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INVALID_TRANSFER_AMOUNT",
          message: "transferAmount must be a valid number",
          details: {
            received: transferAmount ?? null,
          },
        },
        { status: 400 }
      );
    }

    const plan = getPlanByAmount(amount);
    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "UNSUPPORTED_PLAN_AMOUNT",
          message: "Unsupported plan amount",
          details: {
            receivedAmount: amount,
            supportedAmounts: [0, 20000, 49000],
          },
        },
        { status: 400 }
      );
    }

    if (plan.code !== parsed.plan) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "PLAN_AMOUNT_MISMATCH",
          message: "Plan in content does not match transfer amount",
          details: {
            planFromContent: parsed.plan,
            planFromAmount: plan.code,
            amount,
          },
        },
        { status: 400 }
      );
    }

    const transactionId = String(referenceCode || id || "").trim();
    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "MISSING_TRANSACTION_ID",
          message: "Missing transaction id (referenceCode or id)",
          details: {
            referenceCode: referenceCode ?? null,
            id: id ?? null,
          },
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({
      clerkId: parsed.clerkId,
      "paymentHistory.transactionId": transactionId,
    }).lean();

    if (existing) {
      return NextResponse.json({
        success: true,
        duplicated: true,
        message: "Transaction already processed",
        details: {
          transactionId,
          clerkId: parsed.clerkId,
          plan: plan.code,
        },
      });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: parsed.clerkId },
      {
        $set: { isPremium: plan.code !== "FREE" },
        $inc: { credits: plan.credits },
        $push: {
          paymentHistory: {
            transactionId,
            amount,
            date: transactionDate ? new Date(transactionDate) : new Date(),
            status: `success:${plan.code}`,
          },
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Payment processed",
      details: {
        transactionId,
        clerkId: parsed.clerkId,
        appliedPlan: plan.code,
        grantedCredits: plan.credits,
      },
      user,
    });
  } catch (error) {
    console.error("Sepay Webhook Error:", error);
    return NextResponse.json(
      {
        success: false,
        errorCode: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error",
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "SePay webhook is running",
    expected: {
      method: "POST",
      auth: "Authorization: Apikey <SEPAY_WEBHOOK_SECRET>",
      contentFormat: "CVPLAN_<FREE|STARTER|PROFESSIONAL>_<clerkId>",
      amounts: [0, 20000, 49000],
    },
  });
}
