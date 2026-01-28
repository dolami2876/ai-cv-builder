import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { resumeData, jobDescription } = await req.json();

        let systemPrompt = `You are an expert ATS (Applicant Tracking System) and professional resume reviewer. 
Analyze the provided resume data. 
Critique it based on: 
1. Clarity and Conciseness
2. Impact (usage of action verbs, metrics)
3. ATS Friendliness (standard section names, keywords)
4. Completeness`;

        let userPrompt = `Resume Data: ${JSON.stringify(resumeData)}`;

        // If job description is provided, add JD matching analysis
        if (jobDescription) {
            systemPrompt += `
5. Job Description Match (how well the resume aligns with the job requirements)
6. Keyword Optimization (presence of relevant keywords from JD)
7. Skills Alignment (matching required vs. listed skills)`;
            
            userPrompt += `\n\nJob Description:\n${jobDescription}\n\nPlease evaluate how well this resume matches the job description and provide specific recommendations for improvement.`;
        }

        systemPrompt += `\n\nBe strict but constructive. Provide actionable feedback in Vietnamese.`;

        const result = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: z.object({
                score: z.number().describe('Overall score from 0 to 100'),
                summary: z.string().describe('Brief summary of the evaluation'),
                strengths: z.array(z.string()).describe('List of strong points in the resume'),
                weaknesses: z.array(z.string()).describe('List of areas that need improvement'),
                atsCheck: z.object({
                    score: z.number().describe('ATS compatibility score'),
                    issues: z.array(z.string()).describe('Specific ATS issues found')
                })
            }),
            system: systemPrompt,
            prompt: userPrompt,
        });

        return result.toJsonResponse();
    } catch (error) {
        console.error("Evaluation error:", error);
        return new Response(JSON.stringify({ error: "Failed to evaluate resume" }), { status: 500 });
    }
}
