"use client";

import { useResumeStore } from "@/lib/store";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AIWriterButton({ resumeId }: { resumeId?: string }) {
    const {
        personalInfo,
        summary,
        experience,
        education,
        skills,
        targetDomain,
        experienceLevel,
        jobDescription,
        setPersonalInfo,
        setSummary,
        setExperience,
        setEducation,
        setSkills,
        saveResume,
    } = useResumeStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [tone, setTone] = useState("Professional");

    const handleGenerate = async () => {
        if (!confirm("AI sẽ NÂNG CẤP CV hiện tại của bạn: đánh giá, cải thiện câu chữ và bổ sung các ý còn thiếu (nhưng vẫn dựa trên thông tin bạn đã có). Tiếp tục?")) return;

        setIsGenerating(true);
        try {
            // Đóng gói toàn bộ CV hiện tại gửi cho AI để nâng cấp
            const currentData = {
                personalInfo,
                summary,
                experience,
                education,
                skills,
                targetDomain,
                experienceLevel,
                jobDescription,
            };

            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "upgrade_full",
                    prompt: JSON.stringify(currentData),
                    context: {
                        targetDomain,
                        experienceLevel,
                        jobDescription,
                        userData: currentData,
                    },
                    tone,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Generation failed");
            }

            const text = await res.text();
            const data = JSON.parse(text);

            // Populate Store
            if (data.personalInfo) {
                setPersonalInfo({
                    fullName: data.personalInfo.fullName || personalInfo.fullName,
                    email: data.personalInfo.email || personalInfo.email,
                    phone: data.personalInfo.phone || personalInfo.phone,
                    linkedin: personalInfo.linkedin,
                    portfolio: personalInfo.portfolio,
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

            // Tự động lưu lại sau khi nâng cấp nếu có resumeId
            if (resumeId) {
                await saveResume(resumeId);
            }
        } catch (error) {
            console.error(error);
            alert("Nâng cấp CV thất bại. Vui lòng thử lại.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="relative group/tone flex-shrink-0">
                <div className="flex items-center justify-center h-full px-1 cursor-pointer text-gray-400 hover:text-purple-600" title="Set AI Tone">
                    <Sparkles className="w-3 h-3 mr-1" />
                    <select
                        className="appearance-none bg-transparent border-none text-xs font-medium text-gray-600 focus:ring-0 cursor-pointer py-0 pl-0 pr-6" // pr-6 for arrow if native, but we appearance-none might hide it. Let's keep appearance-none and rely on hover or just simple text.
                        style={{ backgroundImage: 'none' }} // Ensure no native arrow if possible, or we want it? Native arrow is fine but takes space.
                        onChange={(e) => setTone(e.target.value)}
                        value={tone}
                    >
                        <option value="Professional">Pro</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Confident">Bold</option>
                        <option value="Technical">Tech</option>
                    </select>
                </div>
            </div>
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-shrink-0 group flex items-center gap-2 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2 text-sm font-medium text-purple-700 hover:from-purple-100 hover:to-indigo-100 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all whitespace-nowrap"
            >
                {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="h-4 w-4 text-purple-500" />
                )}
                <span className="hidden sm:inline">Nâng cấp CV</span>
            </button>
        </div>
    );
}
