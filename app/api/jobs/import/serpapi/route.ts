import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { importJobsFromSerpApi } from "@/lib/jobs/serpapi-import";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { q, location, limit } = await req.json().catch(() => ({}));

    const data = await importJobsFromSerpApi({ q, location, limit });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("SerpAPI import error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

