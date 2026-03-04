import connectDB from "@/lib/db";
import Job from "@/models/Job";
import { fetchMarkdown } from "@/lib/ingest/fetch-markdown";
import { extractJobFromMarkdown } from "@/lib/ingest/extract-job";
import { getEmbedding } from "@/lib/embedding";

function inferSource(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("indeed.com")) return "indeed";
  return "company";
}

export async function ingestJobUrl(url: string) {
  await connectDB();

  const markdown = await fetchMarkdown(url);
  const extracted = await extractJobFromMarkdown(markdown, url);

  const jobPayload: Record<string, unknown> = {
    url,
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
    const textForEmbedding = [
      extracted.title,
      extracted.company,
      (extracted.skills || []).join(" "),
      extracted.descriptionMarkdown,
    ]
      .filter(Boolean)
      .join("\n");
    jobPayload.embedding = await getEmbedding(textForEmbedding);
  } catch {
    // embedding optional
  }

  const job = await Job.findOneAndUpdate({ url }, { $set: jobPayload }, { upsert: true, new: true });
  return job;
}

