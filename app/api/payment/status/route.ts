import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).lean();

    const latestPayment = user?.paymentHistory?.length
      ? user.paymentHistory[user.paymentHistory.length - 1]
      : null;

    const currentPlan =
      typeof latestPayment?.status === "string" && latestPayment.status.startsWith("success:")
        ? latestPayment.status.replace("success:", "")
        : user?.isPremium
          ? "PROFESSIONAL"
          : "FREE";

    return NextResponse.json({
      success: true,
      data: {
        clerkId: userId,
        credits: user?.credits ?? 0,
        isPremium: Boolean(user?.isPremium),
        currentPlan,
        latestPayment: latestPayment
          ? {
              transactionId: latestPayment.transactionId,
              amount: latestPayment.amount,
              date: latestPayment.date,
              status: latestPayment.status,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
