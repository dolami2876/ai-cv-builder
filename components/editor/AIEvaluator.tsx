"use client";

import { useResumeStore } from "@/lib/store";
import { useState } from "react";
import { Loader2, X, CheckCircle2, AlertTriangle, Trophy } from "lucide-react";

interface EvaluationResult {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    atsCheck: {
        score: number;
        issues: string[];
    };
}

export default function AIEvaluator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const store = useResumeStore();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<EvaluationResult | null>(null);

    const handleEvaluate = async () => {
        setIsLoading(true);
        try {
            // Prepare payload (exclude some UI state if any)
            const payload = {
                personalInfo: store.personalInfo,
                summary: store.summary,
                experience: store.experience,
                education: store.education,
                skills: store.skills,
                targetDomain: store.targetDomain,
                experienceLevel: store.experienceLevel,
            };

            const res = await fetch("/api/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeData: payload }),
            });

            if (!res.ok) throw new Error("Evaluation failed");

            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            alert("Failed to analyze resume. Please check your API usage.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        AI Resume Review
                    </h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!result && !isLoading && (
                        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                            <div className="rounded-full bg-purple-100 p-6">
                                <Trophy className="h-12 w-12 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold">Ready to Grade?</h3>
                            <p className="max-w-md text-gray-500">
                                Our AI will analyze your resume against industry standards, ATS compatibility, and impact optimization.
                            </p>
                            <button
                                onClick={handleEvaluate}
                                className="rounded-full bg-purple-600 px-8 py-3 font-semibold text-white hover:bg-purple-700"
                            >
                                Start Analysis
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center space-y-4 py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                            <p className="text-gray-500">Analyzing your resume...</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6">
                            {/* Score Card */}
                            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
                                <div>
                                    <p className="font-medium text-purple-100">Overall Score</p>
                                    <div className="text-5xl font-bold">{result.score}/100</div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-purple-100">ATS Score</p>
                                    <p className="text-2xl font-bold">{result.atsCheck.score}</p>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="rounded-xl bg-gray-50 p-4 border block">
                                <h4 className="font-bold text-gray-900 mb-2">Summary</h4>
                                <p className="text-sm text-gray-600">{result.summary}</p>
                            </div>

                            {/* Strengths */}
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-green-700 mb-3">
                                    <CheckCircle2 className="h-5 w-5" /> What you did well
                                </h4>
                                <ul className="space-y-2">
                                    {result.strengths.map((item, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                                            <span className="text-green-500">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Weaknesses */}
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-red-700 mb-3">
                                    <AlertTriangle className="h-5 w-5" /> Improvements Needed
                                </h4>
                                <ul className="space-y-2">
                                    {result.weaknesses.map((item, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                                            <span className="text-red-500">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
