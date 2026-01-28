import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const maxDuration = 30;

const CareerSuggestionSchema = z.object({
    suggestedCareers: z.array(z.object({
        career: z.string().describe('Tên ngành nghề'),
        jobTitles: z.array(z.string()).describe('Các vị trí công việc phù hợp'),
        matchScore: z.number().describe('Điểm phù hợp từ 0-100'),
        reasons: z.array(z.string()).describe('Lý do phù hợp'),
        keywords: z.array(z.string()).describe('Từ khóa quan trọng cho ngành nghề này'),
        requiredSkills: z.array(z.string()).describe('Kỹ năng cần thiết'),
        growthPotential: z.string().describe('Tiềm năng phát triển (High/Medium/Low)'),
    })).describe('Danh sách ngành nghề được đề xuất'),
    summary: z.string().describe('Tóm tắt phân tích và đề xuất'),
    nextSteps: z.array(z.string()).describe('Các bước tiếp theo để phát triển sự nghiệp'),
});

export async function POST(req: Request) {
    try {
        const { skills, education, interests, goals } = await req.json();

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return new Response("Missing Google API Key", { status: 500 });
        }

        // Check User Credits
        const { userId } = await auth();
        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        await connectDB();

        let user = await User.findOne({ clerkId: userId });
        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        const today = new Date();
        const lastReset = user.lastFreeCreditReset ? new Date(user.lastFreeCreditReset) : new Date(0);

        // Reset credits if it's a new day
        if (today.toDateString() !== lastReset.toDateString()) {
            user.credits = 5;
            user.lastFreeCreditReset = today;
            await user.save();
        }

        // Check availability
        if (user.credits <= 0 && !user.isPremium) {
            return new Response("Daily free credits exhausted. Upgrade to Premium for unlimited access.", { status: 403 });
        }

        // Deduct credit
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

Kỹ năng: ${skills || 'Chưa cung cấp'}
Học vấn: ${education || 'Chưa cung cấp'}
Sở thích: ${interests || 'Chưa cung cấp'}
Mục tiêu: ${goals || 'Chưa cung cấp'}

Hãy đề xuất 3-5 ngành nghề phù hợp nhất với điểm số phù hợp, lý do, từ khóa quan trọng, kỹ năng cần thiết và tiềm năng phát triển.`;

        const result = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: CareerSuggestionSchema,
            system: systemPrompt,
            prompt: userPrompt,
        });

        return result.toJsonResponse();
    } catch (error) {
        console.error("Career Suggestion Error:", error);
        return new Response("Internal Server Error: " + (error as Error).message, { status: 500 });
    }
}
