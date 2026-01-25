"use client";

import { useResumeStore } from "@/lib/store";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AIWriterButton() {
    const {
        targetDomain, experienceLevel,
        setPersonalInfo, setSummary, setExperience, setEducation, setSkills
    } = useResumeStore();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!confirm("AI will generate a sample resume based on your goal. This will overwrite existing content. Continue?")) return;

        setIsGenerating(true);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "generate_full",
                    context: { targetDomain, experienceLevel }
                }),
            });

            if (!res.ok) throw new Error("Generation failed");

            const text = await res.text();
            const jsonStr = text.replace(/```json|```/g, "").trim();
            const data = JSON.parse(jsonStr);

            // Populate Store
            if (data.personalInfo) {
                // Keep existing name/email if they exist, only overwrite if empty or specific logic needed
                // For "Auto-fill", we assume user wants the role title from AI
                setPersonalInfo({
                    // Only fill portfolio (Title) from AI, keep user contact info if present?
                    // Let's assume user wants full fill.
                    fullName: data.personalInfo.fullName || "Your Name",
                    portfolio: data.personalInfo.portfolio || "",
                });
            }

            if (data.summary) setSummary(data.summary);

            if (Array.isArray(data.experience)) {
                setExperience(data.experience.map((e: any) => ({ ...e, id: crypto.randomUUID() })));
            }

            if (Array.isArray(data.education)) {
                setEducation(data.education.map((e: any) => ({ ...e, id: crypto.randomUUID() })));
            }

            if (Array.isArray(data.skills)) {
                setSkills(data.skills);
            }

        } catch (error) {
            console.error(error);
            alert("Failed to generate resume. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="group flex items-center gap-2 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 text-sm font-medium text-purple-700 hover:from-purple-100 hover:to-indigo-100 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
        >
            {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="h-4 w-4 text-purple-500" />
            )}
            <span className="hidden sm:inline">AI Auto-Fill</span>
        </button>
    );
}
