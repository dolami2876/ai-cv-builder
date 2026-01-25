import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Sepay payload structure (example)
        const { transactionDate, content, transferAmount, id } = body;

        // Verify transaction (In a real app, verify signature or check content format)
        // Assume content contains "CVPREMIUM [CLERK_USER_ID]" or similar pattern

        await connectToDB();

        // Extract User ID from transaction content (Example: "CVPREMIUM user_2b...")
        const userIdMatch = content.match(/CVPREMIUM\s+(user_[a-zA-Z0-9]+)/);

        if (userIdMatch && userIdMatch[1]) {
            const userId = userIdMatch[1];

            // Upsert User or Update
            await User.findOneAndUpdate(
                { clerkId: userId },
                {
                    $set: { isPremium: true },
                    $inc: { credits: 100 }, // Grant credits
                    $push: {
                        paymentHistory: {
                            transactionId: id,
                            amount: transferAmount,
                            date: transactionDate,
                            status: "success"
                        }
                    }
                },
                { upsert: true, new: true }
            );

            return NextResponse.json({ success: true, message: "User upgraded" });
        }

        return NextResponse.json({ success: false, message: "Invalid content format" });

    } catch (error) {
        console.error("Webhook Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
