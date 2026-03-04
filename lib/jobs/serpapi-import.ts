import connectDB from "@/lib/db";
import Job from "@/models/Job";
import { getEmbedding } from "@/lib/embedding";

export type SerpImportParams = {
  q?: string;
  location?: string;
  limit?: number;
};

type SerpJob = {
  job_id?: string;
  title?: string;
  company_name?: string;
  location?: string;
  description?: string;
  detected_extensions?: {
    schedule_type?: string;
  };
  apply_options?: { link?: string }[];
  apply_link?: string;
};

function buildJobUrl(job: SerpJob): string | null {
  if (job.apply_link) return job.apply_link;
  const firstApply = job.apply_options?.find((o) => o.link);
  if (firstApply?.link) return firstApply.link;
  if (job.job_id) {
    return `https://www.google.com/search?ibp=htl;jobs&q=&htidocid=${encodeURIComponent(
      job.job_id
    )}`;
  }
  return null;
}

export async function importJobsFromSerpApi(params: SerpImportParams) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY is not set in environment");
  }

  const searchParams = new URLSearchParams({
    engine: "google_jobs",
    api_key: apiKey,
    q: params.q || "developer",
  });
  if (params.location) searchParams.set("location", params.location);

  const serpUrl = `https://serpapi.com/search.json?${searchParams.toString()}`;

  const res = await fetch(serpUrl, {
    method: "GET",
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SerpAPI error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as any;
  const jobs: SerpJob[] = Array.isArray(data?.jobs_results)
    ? data.jobs_results
    : [];

  const take = Math.min(
    Math.max(Number.isFinite(params.limit as number) ? (params.limit as number) : 20, 1),
    50
  );
  const selected = jobs.slice(0, take);

  await connectDB();

  const results: { jobId?: string; url?: string; error?: string }[] = [];

  for (const j of selected) {
    const url = buildJobUrl(j);
    if (!url || !j.title || !j.company_name) {
      results.push({
        error: "Missing url/title/company for one job; skipped",
      });
      continue;
    }

    const jobPayload: Record<string, unknown> = {
      url,
      source: "google_jobs",
      title: j.title,
      company: j.company_name,
      descriptionMarkdown: j.description || "",
      skills: [],
      location: j.location || "",
      jobType: j.detected_extensions?.schedule_type || "onsite",
      scrapedAt: new Date(),
    };

    try {
      const txt = [
        jobPayload.title,
        jobPayload.company,
        jobPayload.location,
        jobPayload.descriptionMarkdown,
      ]
        .filter(Boolean)
        .join("\n");
      jobPayload.embedding = await getEmbedding(txt);
    } catch {
      // embedding optional
    }

    try {
      const saved = await Job.findOneAndUpdate(
        { url },
        { $set: jobPayload },
        { upsert: true, new: true }
      );
      results.push({ jobId: saved._id.toString(), url });
    } catch (e: any) {
      results.push({ url, error: e?.message || "save failed" });
    }
  }

  return {
    imported: results.filter((r) => r.jobId).length,
    totalFromSerp: jobs.length,
    results,
  };
}

