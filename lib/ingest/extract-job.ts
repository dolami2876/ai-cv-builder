/**
 * Tầng 1 - AI trích xuất: từ Markdown JD → cấu trúc Job (kỹ năng, lương, địa điểm, loại hình).
 */
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const JobExtractSchema = z.object({
  title: z.string().describe("Job title"),
  company: z.string().describe("Company name"),
  skills: z.array(z.string()).describe("Required skills from JD"),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  salaryText: z.string().nullable().optional().describe("e.g. Thỏa thuận, Competitive"),
  location: z.string().nullable().optional(),
  jobType: z.enum(["remote", "onsite", "hybrid"]).describe("Work arrangement"),
  experienceLevel: z.string().nullable().optional().describe("intern, junior, mid, senior"),
  descriptionMarkdown: z.string().describe("Cleaned job description in markdown"),
});

export type JobExtract = z.infer<typeof JobExtractSchema>;

export async function extractJobFromMarkdown(markdown: string, sourceUrl: string): Promise<JobExtract> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }

  const result = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: JobExtractSchema,
    system: `You are a job data extractor. Extract structured fields from job description markdown.
- skills: list all required/mentioned skills (technologies, soft skills).
- salaryMin/Max: only numbers if clearly stated, else null.
- jobType: remote | onsite | hybrid.
- descriptionMarkdown: keep the main body of the JD in clean markdown, no need to repeat title/company.`,
    prompt: `Extract job data from this job description (source: ${sourceUrl}):\n\n${markdown.slice(0, 30000)}`,
  });

  const obj = result.object as JobExtract;
  if (!obj.descriptionMarkdown || obj.descriptionMarkdown.length < 50) {
    obj.descriptionMarkdown = markdown.slice(0, 15000);
  }
  return obj;
}
