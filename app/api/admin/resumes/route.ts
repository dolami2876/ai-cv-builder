import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Resume from "@/models/Resume";
import { requireAdmin } from "../_util";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200);

  await connectDB();

  const resumes = await Resume.find({})
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select({
      userId: 1,
      title: 1,
      targetDomain: 1,
      experienceLevel: 1,
      style: 1,
      updatedAt: 1,
      createdAt: 1,
    })
    .lean();

  return NextResponse.json(resumes);
}

