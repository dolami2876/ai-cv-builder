import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Resume from "@/models/Resume";
import { requireAdmin } from "../_util";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  await connectDB();

  const [users, premiumUsers, resumes] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isPremium: true }),
    Resume.countDocuments({}),
  ]);

  return NextResponse.json({
    users,
    premiumUsers,
    resumes,
  });
}

