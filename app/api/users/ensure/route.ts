import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const primaryEmail =
      clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      `${userId}@no-email.local`;

    await connectDB();

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $setOnInsert: {
          clerkId: userId,
          credits: 50,
          lastFreeCreditReset: new Date(),
          isPremium: false,
          paymentHistory: [],
        },
        $set: {
          email: primaryEmail,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "User synced",
      data: {
        clerkId: user.clerkId,
        email: user.email,
        credits: user.credits,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error("Ensure user error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
