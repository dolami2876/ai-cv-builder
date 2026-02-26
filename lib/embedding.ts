/**
 * Tầng 2 - Vector: tạo embedding từ text (Google Gemini embedding API).
 * Dùng cho Job và Resume để so khớp theo nghĩa.
 */
const EMBED_API = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";

export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }

  const truncated = text.slice(0, 8000); // giới hạn độ dài

  const res = await fetch(`${EMBED_API}?key=${apiKey}`, {
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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding API failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const values = data.embedding?.values;
  if (!Array.isArray(values)) {
    throw new Error("Invalid embedding response");
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
