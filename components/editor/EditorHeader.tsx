"use client";

import { useResumeStore } from "@/lib/store";
import { Save, Loader2, CheckCircle, AlertCircle, Download, FileText, Lock, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import AIEvaluator from "@/components/editor/AIEvaluator";
import TemplateSelector from "@/components/editor/TemplateSelector";
import AIWriterButton from "@/components/editor/AIWriterButton";
import { generateDocx } from "@/lib/docx-generator";
import PricingModal from "./PricingModal";
import TargetJobModal from "./TargetJobModal";

export default function EditorHeader({ resumeId }: { resumeId: string }) {
    const { saveResume, isSaving, isError, fetchResume } = useResumeStore();

    const [showEvaluator, setShowEvaluator] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const [showTargetJob, setShowTargetJob] = useState(false);
    const isPremium = false; // Hardcoded for demo

    const handleDocxDownload = async () => {
        if (!isPremium) {
            setShowPricing(true);
            return;
        }
        const state = useResumeStore.getState();
        await generateDocx(state);
    };

    const handleDownload = () => {
        window.print();
    };

    // Fetch resume data on mount
    useEffect(() => {
        if (resumeId) {
            fetchResume(resumeId);
        }
    }, [resumeId, fetchResume]);

    return (
        <>
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">
                        Resume Editor
                    </h1>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        {isSaving ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" /> Saving changes...
                            </>
                        ) : isError ? (
                            <span className="text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Save failed
                            </span>
                        ) : (
                            <>
                                <CheckCircle className="h-3 w-3 text-green-500" /> Saved
                            </>
                        )}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <TemplateSelector />

                    <button
                        onClick={() => setShowTargetJob(true)}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        title="Add Job Description"
                    >
                        <Briefcase className="h-4 w-4" />
                        <span className="hidden sm:inline">Target JD</span>
                    </button>

                    <AIWriterButton />

                    <button
                        onClick={handleDocxDownload}
                        className={`group flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${isPremium
                                ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-200"
                                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            }`}
                        title={isPremium ? "Download as Word" : "Upgrade to Premium to Download Word"}
                        disabled={!isPremium}
                    >
                        {isPremium ? <FileText className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        <span className="hidden sm:inline">Word</span>
                    </button>

                    <button
                        onClick={handleDownload}
                        className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all"
                        title="Download as PDF"
                    >
                        <Download className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                        <span className="hidden sm:inline">PDF</span>
                    </button>

                    <button
                        onClick={() => setShowEvaluator(true)}
                        className="group flex items-center gap-2 rounded-lg border border-purple-100 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
                    >
                        <span className="hidden sm:inline">AI Review</span>
                    </button>

                    <button
                        onClick={() => saveResume(resumeId)}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 transition-all"
                    >
                        <Save className="h-4 w-4" />
                        <span className="hidden sm:inline">Save</span>
                    </button>
                </div>
            </header>

            <AIEvaluator isOpen={showEvaluator} onClose={() => setShowEvaluator(false)} />
            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
            <TargetJobModal isOpen={showTargetJob} onClose={() => setShowTargetJob(false)} />
        </>
    );
}
