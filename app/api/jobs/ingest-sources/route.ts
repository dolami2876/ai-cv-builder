import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdminClerkId } from "@/lib/admin";
import { ingestEnabledSources } from "@/lib/ingest/run-sources-ingestion";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (process.env.ADMIN_CLERK_IDS && !isAdminClerkId(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const sourceIds = Array.isArray(body?.sourceIds) ? body.sourceIds : undefined;
    const limitPerSource = typeof body?.limitPerSource === "number" ? body.limitPerSource : undefined;
    const hardLimitTotal = typeof body?.hardLimitTotal === "number" ? body.hardLimitTotal : undefined;

    const data = await ingestEnabledSources({ sourceIds, limitPerSource, hardLimitTotal });
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("Ingest sources error:", e);
    return NextResponse.json({ error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

