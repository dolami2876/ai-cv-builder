/**
 * Tầng 3 - Matching Agent: LLM chấm điểm 1-100 + giải thích ngắn "Tại sao phù hợp".
 */
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const ScoreSchema = z.object({
  score: z.number().min(1).max(100).describe("Điểm phù hợp 1-100"),
  explanation: z.string().describe("Đoạn ngắn giải thích tại sao việc này phù hợp với ứng viên (1-3 câu)"),
});

export type JobScoreResult = z.infer<typeof ScoreSchema>;

export async function scoreJobMatch(
  resumeSummary: string,
  jobTitle: string,
  jobCompany: string,
  jobDescription: string,
  jobSkills: string[]
): Promise<JobScoreResult> {
  const result = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: ScoreSchema,
    system: `Bạn là chuyên gia tuyển dụng. Chấm điểm mức độ phù hợp giữa CV ứng viên và JD (1-100).
Tiêu chí: Kỹ năng, Kinh nghiệm, Văn hóa/ngành nghề. Viết explanation ngắn gọn bằng tiếng Việt.`,
    prompt: `CV ứng viên (tóm tắt):\n${resumeSummary}\n\n---\nCông việc: ${jobTitle} tại ${jobCompany}\nKỹ năng JD: ${jobSkills.join(", ") || "Không nêu rõ"}\nMô tả (rút gọn):\n${jobDescription.slice(0, 2500)}\n\nHãy chấm điểm và giải thích ngắn.`,
  });

  return result.object as JobScoreResult;
}
