/**
 * Tầng 1 - Thu thập: biến HTML trang web thành Markdown sạch.
 * Dùng Jina Reader (không cần API key) hoặc Firecrawl nếu có key.
 */

const JINA_READER = "https://r.jina.ai/";

export async function fetchMarkdownFromUrl(url: string): Promise<string> {
  const encoded = encodeURIComponent(url);
  const res = await fetch(`${JINA_READER}${url}`, {
    headers: {
      "X-Return-Format": "markdown",
      "X-No-Cache": "true",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Jina Reader failed: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

/**
 * Firecrawl (nếu có FIRECRAWL_API_KEY trong .env)
 */
export async function fetchMarkdownWithFirecrawl(url: string): Promise<string> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error("FIRECRAWL_API_KEY is not set");
  }

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firecrawl failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  if (data.success && data.data?.markdown) {
    return data.data.markdown;
  }
  throw new Error("Firecrawl did not return markdown");
}

export async function fetchMarkdown(url: string): Promise<string> {
  if (process.env.FIRECRAWL_API_KEY) {
    return fetchMarkdownWithFirecrawl(url);
  }
  return fetchMarkdownFromUrl(url);
}
