/**
 * Tầng 2 - Vector: tạo embedding từ text bằng Google Gemini.
 *
 * Sử dụng model `text-embedding-004` với endpoint v1:
 * POST https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }

  const truncated = text.slice(0, 8000); // giới hạn độ dài để tránh quá quota

  const endpoint =
    "https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent";

  const res = await fetch(`${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/text-embedding-004",
      content: {
        parts: [{ text: truncated }],
      },
    }),
    signal: AbortSignal.timeout(10000),
  });

  const bodyText = await res.text();
  if (!res.ok) {
    throw new Error(`Embedding API failed: ${res.status} ${bodyText}`);
  }

  let data: any;
  try {
    data = JSON.parse(bodyText);
  } catch {
    throw new Error(`Embedding API invalid JSON: ${bodyText}`);
  }

  const values = data.embedding?.values;
  if (!Array.isArray(values)) {
    throw new Error("Embedding API response missing embedding.values");
  }

  return values;
}

/** Cosine similarity giữa 2 vector (để so khớp CV - JD). */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const den = Math.sqrt(na) * Math.sqrt(nb);
  return den === 0 ? 0 : dot / den;
}
