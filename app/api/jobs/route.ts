/**
 * GET: Danh sách việc làm (có thể filter theo source, jobType, skills).
 */
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Job from "@/models/Job";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source");
    const jobType = searchParams.get("jobType");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    const filter: Record<string, unknown> = {};
    if (source) filter.source = source;
    if (jobType) filter.jobType = jobType;

    const jobs = await Job.find(filter)
      .sort({ scrapedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Job.countDocuments(filter);

    return NextResponse.json({ jobs, total });
  } catch (error: any) {
    console.error("Jobs list error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
