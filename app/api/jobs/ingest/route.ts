/**
 * Tầng 1: Thu thập & Làm sạch - Ingest JD từ URL (Jina/Firecrawl + Gemini extract).
 * POST body: { url: string } hoặc { urls: string[] }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdminClerkId } from "@/lib/admin";
import { ingestJobUrl } from "@/lib/ingest/ingest-job-url";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Chỉ admin hoặc cho phép mọi user đã đăng nhập tùy bạn. Ở đây mình cho admin mới ingest.
    if (process.env.ADMIN_CLERK_IDS && !isAdminClerkId(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const urls: string[] = Array.isArray(body.urls)
      ? body.urls
      : body.url
        ? [body.url]
        : [];

    if (urls.length === 0) {
      return NextResponse.json({ error: "Missing url or urls" }, { status: 400 });
    }

    const results: { url: string; jobId?: string; error?: string }[] = [];

    for (const url of urls.slice(0, 10)) {
      try {
        const job = await ingestJobUrl(url);
        results.push({ url, jobId: job._id.toString() });
      } catch (err: any) {
        results.push({ url, error: err.message || "Ingest failed" });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Jobs ingest error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
