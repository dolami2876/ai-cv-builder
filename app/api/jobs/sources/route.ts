import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import JobSource from "@/models/JobSource";
import { isAdminClerkId } from "@/lib/admin";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (process.env.ADMIN_CLERK_IDS && !isAdminClerkId(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const sources = await JobSource.find({}).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ sources });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (process.env.ADMIN_CLERK_IDS && !isAdminClerkId(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, type, url, enabled, notes } = body || {};
    if (!name || !type || !url) {
      return NextResponse.json({ error: "Missing name/type/url" }, { status: 400 });
    }

    await connectDB();
    const src = await JobSource.findOneAndUpdate(
      { url },
      { $set: { name, type, url, enabled: enabled !== false, notes: notes || "" } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ source: src });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

