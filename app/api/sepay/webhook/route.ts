import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

// Sepay sends a POST request with transaction details
// Body structure example: { "gateway": "MBBank", "transactionDate": "...", "accountNumber": "...", "subAccount": null, "code": null, "content": "CVBOOST USER_123", "transferType": "in", "description": "...", "transferAmount": 200000, "referenceCode": "..." }

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Simple security check (In prod, check Sepay API Token in headers if available)
        // Or verify IP whitelist

        const { content, transferAmount } = body;

        // We expect the transfer content to contain "CVBOOST" and the userId or clerkId.
        // E.g., User scans QR code generated with content "CVBOOST <CLERK_USER_ID>"

        if (!content || !content.includes("CVBOOST")) {
            return NextResponse.json({ success: false, message: "Invalid content" });
        }

        // Extract Clerk ID from content (Simple parsing)
        // Assuming format: "CVBOOST user_2s..."
        const parts = content.split(" ");
        const clerkId = parts.find((p: string) => p.startsWith("user_"));

        if (!clerkId) {
            return NextResponse.json({ success: false, message: "User ID not found in content" });
        }

        if (transferAmount < 200000) {
            return NextResponse.json({ success: false, message: "Insufficient amount" });
        }

        await connectDB();

        // Find and update user
        const user = await User.findOneAndUpdate(
            { clerkId },
            {
                isPremium: true,
                $inc: { credits: 100 } // Bonus credits
            },
            { new: true, upsert: true } // Create if not exists (though verify email might be missing if created here)
        );

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("Sepay Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
