import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { auth } from "@clerk/nextjs/server";
import connectToDB from "@/lib/db";
import User from "@/models/User";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { prompt, type, context, tone } = await req.json();

        // Check for API Key
        if (!process.env.GEMINI_API_KEY) {
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

        // Check availability
        if (user.credits <= 0 && !user.isPremium) {
            return new Response("Daily free credits exhausted. Upgrade to Premium for unlimited access.", { status: 403 });
        }

        // Deduct credit
        if (!user.isPremium) {
            user.credits -= 1;
            await user.save();
        }

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
            systemPrompt += " Respond ONLY with valid JSON.";
            finalPrompt = `Generate a complete professional resume for a ${context?.experienceLevel || "experienced"} ${context?.targetDomain || "Professional"}. 
            Return a JSON object with the following structure (no markdown formatting):
            {
                "personalInfo": { "fullName": "[Name]", "email": "[Email]", "portfolio": "[Role Title]" },
                "summary": "Professional summary...",
                "experience": [ { "company": "Company Name", "role": "Role Title", "startDate": "2020", "endDate": "Present", "description": "Key achievement..." } ],
                "education": [ { "school": "University Name", "degree": "Degree Name", "startDate": "2016", "endDate": "2020" } ],
                "skills": ["Skill 1", "Skill 2"]
            }`;

            // For JSON generation, we use generateText instead of streamText to ensure validity
            const { generateText } = await import('ai');
            const { text } = await generateText({
                model: google('gemini-pro'),
                system: systemPrompt,
                prompt: finalPrompt,
            });

            return new Response(text);
        }

        const result = await streamText({
            model: google('gemini-pro'),
            system: systemPrompt,
            prompt: finalPrompt,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("AI Generation Error:", error);
        return new Response("Internal Server Error: " + (error as Error).message, { status: 500 });
    }
}
