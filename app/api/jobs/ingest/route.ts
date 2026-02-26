/**
 * Tầng 1: Thu thập & Làm sạch - Ingest JD từ URL (Jina/Firecrawl + Gemini extract).
 * POST body: { url: string } hoặc { urls: string[] }
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Job from "@/models/Job";
import { fetchMarkdown } from "@/lib/ingest/fetch-markdown";
import { extractJobFromMarkdown } from "@/lib/ingest/extract-job";
import { isAdminClerkId } from "@/lib/admin";
import { getEmbedding } from "@/lib/embedding";

export const maxDuration = 60;

function inferSource(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("indeed.com")) return "indeed";
  return "company";
}

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

    await connectDB();

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
        const markdown = await fetchMarkdown(url);
        const extracted = await extractJobFromMarkdown(markdown, url);

        const jobPayload: Record<string, unknown> = {
          source: inferSource(url),
          title: extracted.title,
          company: extracted.company,
          descriptionMarkdown: extracted.descriptionMarkdown,
          skills: extracted.skills || [],
          salaryMin: extracted.salaryMin ?? undefined,
          salaryMax: extracted.salaryMax ?? undefined,
          salaryText: extracted.salaryText ?? undefined,
          location: extracted.location ?? undefined,
          jobType: extracted.jobType || "onsite",
          experienceLevel: extracted.experienceLevel ?? undefined,
          scrapedAt: new Date(),
        };

        try {
          const textForEmbedding = [extracted.title, extracted.company, (extracted.skills || []).join(" "), extracted.descriptionMarkdown].filter(Boolean).join("\n");
          jobPayload.embedding = await getEmbedding(textForEmbedding);
        } catch (_) {
          // Bỏ qua nếu embedding API lỗi; job vẫn lưu được
        }

        const job = await Job.findOneAndUpdate(
          { url },
          { $set: jobPayload },
          { upsert: true, new: true }
        );

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
