import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Resume from "@/models/Resume";
import { requireAdmin } from "../_util";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200);

  await connectDB();

  const users = await User.find({})
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  // attach resume count
  const ids = users.map((u: any) => u.clerkId);
  const counts = await Resume.aggregate([
    { $match: { userId: { $in: ids } } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c: any) => [c._id, c.count]));

  return NextResponse.json(
    users.map((u: any) => ({
      clerkId: u.clerkId,
      email: u.email,
      credits: u.credits,
      isPremium: u.isPremium,
      resumeCount: countMap.get(u.clerkId) || 0,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }))
  );
}

