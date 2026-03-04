import { NextRequest, NextResponse } from "next/server";
import { ingestEnabledSources } from "@/lib/ingest/run-sources-ingestion";

export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = req.headers.get("x-cron-secret");
  if (header && header === secret) return true;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("secret");
  return q === secret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await ingestEnabledSources({ limitPerSource: 20, hardLimitTotal: 60 });
    return NextResponse.json({ ok: true, ...data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

