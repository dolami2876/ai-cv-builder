import { XMLParser } from "fast-xml-parser";

export type FeedItem = {
  title?: string;
  link?: string;
  publishedAt?: Date;
};

function asArray<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function parseDate(v: unknown): Date | undefined {
  if (typeof v !== "string") return undefined;
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d : undefined;
}

export async function fetchFeedItems(feedUrl: string, limit = 50): Promise<FeedItem[]> {
  const res = await fetch(feedUrl, {
    headers: {
      "User-Agent": "CVBoostBot/1.0 (+jobs-ingestion)",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true,
  });
  const data = parser.parse(xml) as any;

  // RSS 2.0: rss.channel.item[]
  const rssItems = asArray(data?.rss?.channel?.item).map((it: any) => ({
    title: typeof it?.title === "string" ? it.title : undefined,
    link: typeof it?.link === "string" ? it.link : undefined,
    publishedAt: parseDate(it?.pubDate) ?? parseDate(it?.published),
  }));

  // Atom: feed.entry[]
  const atomItems = asArray(data?.feed?.entry).map((it: any) => {
    const linkCandidates = asArray(it?.link);
    const href =
      linkCandidates.find((l: any) => l?.["@_rel"] === "alternate")?.["@_href"] ??
      linkCandidates[0]?.["@_href"] ??
      (typeof it?.link === "string" ? it.link : undefined);

    return {
      title: typeof it?.title === "string" ? it.title : it?.title?.["#text"],
      link: typeof href === "string" ? href : undefined,
      publishedAt: parseDate(it?.updated) ?? parseDate(it?.published),
    } as FeedItem;
  });

  const items = [...rssItems, ...atomItems]
    .filter((i) => i.link && typeof i.link === "string")
    .slice(0, limit);

  return items;
}

