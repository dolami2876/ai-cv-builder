import connectDB from "@/lib/db";
import JobSource, { IJobSource } from "@/models/JobSource";
import { fetchFeedItems } from "@/lib/ingest/rss";
import { fetchMarkdown } from "@/lib/ingest/fetch-markdown";
import { extractCandidateLinks } from "@/lib/ingest/extract-links";
import { ingestJobUrl } from "@/lib/ingest/ingest-job-url";

export type IngestSourcesResult = {
  sources: Array<{
    sourceId: string;
    name: string;
    type: string;
    url: string;
    attempted: number;
    succeeded: number;
    errors: Array<{ url?: string; error: string }>;
  }>;
  totalAttempted: number;
  totalSucceeded: number;
};

export async function ingestEnabledSources(opts?: {
  sourceIds?: string[];
  limitPerSource?: number;
  hardLimitTotal?: number;
}): Promise<IngestSourcesResult> {
  const limitPerSource = Math.max(1, Math.min(opts?.limitPerSource ?? 20, 50));
  const hardLimitTotal = Math.max(1, Math.min(opts?.hardLimitTotal ?? 60, 200));

  await connectDB();

  const filter: Record<string, unknown> = { enabled: true };
  if (opts?.sourceIds?.length) {
    filter._id = { $in: opts.sourceIds };
  }

  const sources = (await JobSource.find(filter).sort({ updatedAt: -1 }).lean()) as unknown as IJobSource[];

  const result: IngestSourcesResult = {
    sources: [],
    totalAttempted: 0,
    totalSucceeded: 0,
  };

  let remaining = hardLimitTotal;

  for (const src of sources) {
    if (remaining <= 0) break;

    const sourceResult = {
      sourceId: (src as any)._id?.toString?.() ?? "",
      name: src.name,
      type: src.type,
      url: src.url,
      attempted: 0,
      succeeded: 0,
      errors: [] as Array<{ url?: string; error: string }>,
    };

    const runAt = new Date();
    await JobSource.updateOne({ _id: (src as any)._id }, { $set: { lastRunAt: runAt, lastError: "" } }).catch(() => {});

    try {
      let urls: string[] = [];

      if (src.type === "rss") {
        const items = await fetchFeedItems(src.url, limitPerSource);
        urls = items
          .map((i) => i.link)
          .filter((u): u is string => typeof u === "string" && u.length > 0)
          .slice(0, limitPerSource);
      } else if (src.type === "links") {
        const md = await fetchMarkdown(src.url);
        urls = extractCandidateLinks(md, src.url, limitPerSource);
      }

      urls = urls.slice(0, Math.min(limitPerSource, remaining));
      sourceResult.attempted = urls.length;
      result.totalAttempted += urls.length;
      remaining -= urls.length;

      for (const url of urls) {
        try {
          await ingestJobUrl(url);
          sourceResult.succeeded += 1;
          result.totalSucceeded += 1;
        } catch (e: any) {
          sourceResult.errors.push({ url, error: e?.message || "ingest failed" });
        }
      }

      await JobSource.updateOne(
        { _id: (src as any)._id },
        {
          $set: {
            lastSuccessAt: new Date(),
            lastError: sourceResult.errors.length ? truncate(sourceResult.errors[0].error, 400) : "",
          },
        }
      ).catch(() => {});
    } catch (e: any) {
      sourceResult.errors.push({ error: e?.message || "source run failed" });
      await JobSource.updateOne(
        { _id: (src as any)._id },
        { $set: { lastError: truncate(e?.message || "source run failed", 400) } }
      ).catch(() => {});
    }

    result.sources.push(sourceResult);
  }

  return result;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

