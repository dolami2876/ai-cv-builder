import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { resumeData } = await req.json();

        const result = await generateObject({
            model: google('gemini-1.5-flash'),
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
            system: `You are an expert ATS (Applicant Tracking System) and professional resume reviewer. 
      Analyze the provided resume data JSON. 
      Critique it based on: 
      1. Clarity and Conciseness
      2. Impact (usage of action verbs, metrics)
      3. ATS Friendliness (standard section names, keywords)
      4. Completeness
      
      Be strict but constructive.`,
            prompt: `Resume Data: ${JSON.stringify(resumeData)}`,
        });

        return result.toJsonResponse();
    } catch (error) {
        console.error("Evaluation error:", error);
        return new Response(JSON.stringify({ error: "Failed to evaluate resume" }), { status: 500 });
    }
}
