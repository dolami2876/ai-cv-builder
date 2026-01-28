import { google } from '@ai-sdk/google';
import { streamText, generateObject } from 'ai';
import { z } from 'zod';
import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/db";
import User from "@/models/User";

// Shared schema cho các response dạng CV đầy đủ
const ResumeSchema = z.object({
    personalInfo: z.object({
        fullName: z.string().describe('Exact name from input'),
        email: z.string().describe('Exact email from input'),
        phone: z.string().optional().describe('Exact phone from input if provided'),
    }),
    summary: z.string().describe('Professional summary based on provided experience'),
    experience: z.array(z.object({
        company: z.string().describe('Company name extracted from experience text'),
        role: z.string().describe('Job role extracted from experience text'),
        startDate: z.string().describe('Start date extracted from experience text'),
        endDate: z.string().describe('End date extracted from experience text or "Present"'),
        description: z.string().describe('Formatted description from provided experience text'),
    })).describe('Experience entries parsed from provided text'),
    education: z.array(z.object({
        school: z.string().describe('School name extracted from education text'),
        degree: z.string().describe('Degree extracted from education text'),
        startDate: z.string().describe('Start date extracted from education text'),
        endDate: z.string().describe('End date extracted from education text'),
    })).describe('Education entries parsed from provided text'),
    skills: z.array(z.string()).describe('Skills array from provided skills text'),
});

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { prompt, type, context, tone } = await req.json();

        // Check for API Key
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return new Response("Missing Google API Key", { status: 500 });
        }

        // Check User Credits
        const { userId } = await auth();
        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        await connectToDB();

        let user = await User.findOne({ clerkId: userId });
        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        const today = new Date();
        const lastReset = user.lastFreeCreditReset ? new Date(user.lastFreeCreditReset) : new Date(0);

        // Reset credits if it's a new day
        if (today.toDateString() !== lastReset.toDateString()) {
            user.credits = 5; // Reset to 5 daily credits
            user.lastFreeCreditReset = today;
            await user.save();
        }

        // NOTE: Tạm thời không chặn theo credits để thuận tiện phát triển / demo.
        // Nếu muốn bật lại giới hạn, khôi phục đoạn kiểm tra bên dưới.
        /*
        if (user.credits <= 0 && !user.isPremium) {
            return new Response("Daily free credits exhausted. Upgrade to Premium for unlimited access.", { status: 403 });
        }

        if (!user.isPremium) {
            user.credits -= 1;
            await user.save();
        }
        */

        let systemPrompt = "You are an expert resume writer.";

        // Add Tone implementation
        if (tone) {
            systemPrompt += ` Adopt a ${tone} tone.`;
        }

        if (context) {
            const { experienceLevel, targetDomain, jobDescription } = context;
            if (experienceLevel) systemPrompt += ` The candidate is a ${experienceLevel}.`;
            if (targetDomain) systemPrompt += ` They are applying for jobs in the ${targetDomain} industry.`;
            if (jobDescription) systemPrompt += ` IMPORTANT: Tailor the resume content to match this Job Description:\n"${jobDescription}"\nUse keywords from the JD.`;
        }

        let finalPrompt = prompt;

        if (type === 'improve') {
            finalPrompt = `Rewrite the following resume section to be more professional, concise, and impactful. Use action verbs and quantifiable results where possible. \n\nInput Text:\n${prompt}`;
        } else if (type === 'fix_grammar') {
            finalPrompt = `Fix any grammar and spelling errors in the following text. Do not significantly change the tone or structure.\n\nInput Text:\n${prompt}`;
        } else if (type === 'generate_full') {
            // Parse user data - prioritize context.userData if available, otherwise parse from prompt
            let userData: any = context?.userData || {};
            
            if (!userData || Object.keys(userData).length === 0) {
                try {
                    userData = JSON.parse(prompt);
                } catch {
                    // If not JSON, try to extract from text format
                    userData = { rawText: prompt };
                }
            }

            // Enhanced system prompt với luật NGHIÊM NGẶT cho sinh CV mới từ dữ liệu thô
            systemPrompt = `You are an expert resume writer. CRITICAL RULES:
1. You MUST use the EXACT information provided by the user
2. DO NOT invent, create, or make up any information
3. Use the EXACT name, email, and phone number from the input
4. Parse and format the provided experience text - do not add new experiences
5. Parse and format the provided education text - do not add new education
6. Use the EXACT skills from the input (split by comma/semicolon if needed)
7. Only enhance the language and formatting, never change the facts
8. If information is missing, leave it empty or use placeholder text`;

            // Build detailed prompt with explicit instructions
            finalPrompt = `Create a professional resume using the EXACT information provided below.

User Information (MUST USE EXACTLY AS PROVIDED):
${JSON.stringify(userData, null, 2)}

${context?.jobDescription ? `Target Job Description:\n${context.jobDescription}\n\nTailor the resume to match this job description while using the exact user information.` : ''}

Instructions:
1. personalInfo.fullName: Use the EXACT name from userData.personalInfo.fullName
2. personalInfo.email: Use the EXACT email from userData.personalInfo.email  
3. personalInfo.phone: Use the EXACT phone from userData.personalInfo.phone (if provided)
4. experience: Parse the experience text from userData.experience. Extract company names, roles, dates, and descriptions. Format professionally but keep the original information.
5. education: Parse the education text from userData.education. Extract school names, degrees, and dates.
6. skills: Split the skills string from userData.skills (by comma, semicolon, or newline) and format as an array
7. summary: Create a professional summary based on the provided experience and target job, but use only the information provided`;

            // Use generateObject for structured output
            const result = await generateObject({
                model: google('gemini-2.5-flash'),
                schema: ResumeSchema,
                system: systemPrompt,
                prompt: finalPrompt,
            });

            return result.toJsonResponse();
        } else if (type === 'upgrade_full') {
            // UPGRADE: cho phép AI thêm chi tiết còn thiếu, giữ đúng các facts chính
            let userData: any = context?.userData || {};

            if (!userData || Object.keys(userData).length === 0) {
                try {
                    userData = JSON.parse(prompt);
                } catch {
                    userData = { rawText: prompt };
                }
            }

            systemPrompt = `You are an expert resume writer. Your job is to UPGRADE an existing resume.
RULES:
1. Keep core facts consistent (company names, job titles, degrees, dates) whenever they exist.
2. You MAY add reasonable bullet points, responsibilities and achievements that are realistic for the roles.
3. Strengthen wording, structure, and clarity; make the resume more concise and impactful.
4. Fill in obviously missing pieces such as summary, skills list, and descriptions using typical expectations for the role and industry.
5. Maintain a professional tone and avoid adding obviously false or exaggerated claims.`;

            finalPrompt = `Here is the current resume data in structured JSON format:

${JSON.stringify(userData, null, 2)}

Upgrade this resume while following the RULES. Return ONLY the upgraded resume in JSON that matches the schema (personalInfo, summary, experience[], education[], skills[]). Do not wrap in markdown.`;

            const result = await generateObject({
                model: google('gemini-2.5-flash'),
                schema: ResumeSchema,
                system: systemPrompt,
                prompt: finalPrompt,
            });

            return result.toJsonResponse();
        }

        const result = await streamText({
            model: google('gemini-2.5-flash'),
            system: systemPrompt,
            prompt: finalPrompt,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("AI Generation Error:", error);
        return new Response("Internal Server Error: " + (error as Error).message, { status: 500 });
    }
}
