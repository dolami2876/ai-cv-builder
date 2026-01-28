import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "../../_util";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ clerkId: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { clerkId } = await params;
  const body = await req.json();

  const update: any = {};
  if (typeof body.credits === "number") update.credits = body.credits;
  if (typeof body.isPremium === "boolean") update.isPremium = body.isPremium;

  await connectDB();

  const user = await User.findOneAndUpdate({ clerkId }, { $set: update }, { new: true });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    clerkId: user.clerkId,
    email: user.email,
    credits: user.credits,
    isPremium: user.isPremium,
    updatedAt: user.updatedAt,
  });
}

