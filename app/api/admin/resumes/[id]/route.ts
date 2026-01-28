import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Resume from "@/models/Resume";
import { requireAdmin } from "../../_util";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { id } = await params;
  await connectDB();

  const deleted = await Resume.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}

