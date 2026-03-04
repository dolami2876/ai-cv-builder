export function extractCandidateLinks(markdown: string, baseUrl: string, limit = 30): string[] {
  const links = new Set<string>();

  const urlRegex = /\bhttps?:\/\/[^\s<>()"]+/gi;
  const matches = markdown.match(urlRegex) || [];

  const baseHost = safeHost(baseUrl);

  for (const raw of matches) {
    const cleaned = raw.replace(/[)\].,;]+$/g, "");
    try {
      const u = new URL(cleaned);
      if (baseHost && u.host !== baseHost) continue;
      // Heuristic: likely job detail links
      const p = u.pathname.toLowerCase();
      if (!/(job|career|vacan|position|recruit)/.test(p)) continue;
      links.add(u.toString());
      if (links.size >= limit) break;
    } catch {
      // ignore
    }
  }

  return Array.from(links);
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

