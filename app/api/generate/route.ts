import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { prompt, type, context } = await req.json();

    let systemPrompt = "You are an expert resume writer.";

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
            model: google('gemini-1.5-flash'),
            system: systemPrompt,
            prompt: finalPrompt,
        });

        return new Response(text);
    }

    const result = await streamText({
        model: google('gemini-1.5-flash'),
        system: systemPrompt,
        prompt: finalPrompt,
    });

    return result.toTextStreamResponse();
}
