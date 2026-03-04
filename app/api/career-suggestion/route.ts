import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { ensureUserByClerkId } from "@/lib/users/ensure-user";

export const maxDuration = 30;

const CareerSuggestionSchema = z.object({
  suggestedCareers: z.array(
    z.object({
      career: z.string().describe("Tên ngành nghề"),
      jobTitles: z.array(z.string()).describe("Các vị trí công việc phù hợp"),
      matchScore: z.number().describe("Điểm phù hợp từ 0-100"),
      reasons: z.array(z.string()).describe("Lý do phù hợp"),
      keywords: z.array(z.string()).describe("Từ khóa quan trọng cho ngành nghề này"),
      requiredSkills: z.array(z.string()).describe("Kỹ năng cần thiết"),
      growthPotential: z.string().describe("Tiềm năng phát triển (High/Medium/Low)"),
    })
  ),
  summary: z.string().describe("Tóm tắt phân tích và đề xuất"),
  nextSteps: z.array(z.string()).describe("Các bước tiếp theo để phát triển sự nghiệp"),
});

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Career suggestion endpoint is running",
    expectedMethod: "POST",
  });
}

export async function POST(req: NextRequest) {
  try {
    const { skills, education, interests, goals } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Missing GOOGLE_GENERATIVE_AI_API_KEY" },
        { status: 500 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await ensureUserByClerkId(userId);

    const today = new Date();
    const lastReset = user.lastFreeCreditReset ? new Date(user.lastFreeCreditReset) : new Date(0);

    if (today.toDateString() !== lastReset.toDateString()) {
      user.credits = 50;
      user.lastFreeCreditReset = today;
      await user.save();
    }

    if (user.credits <= 0 && !user.isPremium) {
      return NextResponse.json(
        {
          success: false,
          message: "Daily free credits exhausted. Upgrade to Premium for unlimited access.",
        },
        { status: 403 }
      );
    }

    if (!user.isPremium) {
      user.credits -= 1;
      await user.save();
    }

    const systemPrompt = `You are an expert career counselor and job market analyst.
Analyze the user's profile and suggest suitable careers and job positions.
Consider:
1. Skills match with industry requirements
2. Education background alignment
3. Personal interests and goals
4. Market demand and growth potential
5. Career progression paths

Provide detailed, actionable suggestions in Vietnamese.`;

    const userPrompt = `Phân tích hồ sơ cá nhân sau và đề xuất ngành nghề phù hợp:

Kỹ năng: ${skills || "Chưa cung cấp"}
Học vấn: ${education || "Chưa cung cấp"}
Sở thích: ${interests || "Chưa cung cấp"}
Mục tiêu: ${goals || "Chưa cung cấp"}

Hãy đề xuất 3-5 ngành nghề phù hợp nhất với điểm số phù hợp, lý do, từ khóa quan trọng, kỹ năng cần thiết và tiềm năng phát triển.`;

    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: CareerSuggestionSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Career Suggestion Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
