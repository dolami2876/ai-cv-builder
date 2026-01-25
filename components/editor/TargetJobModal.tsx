"use client";

import { useResumeStore } from "@/lib/store";
import { X, Check } from "lucide-react";
import { useState } from "react";

interface TargetJobModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TargetJobModal({ isOpen, onClose }: TargetJobModalProps) {
    const { jobDescription, setJobDescription } = useResumeStore();
    const [text, setText] = useState(jobDescription || "");

    const handleSave = () => {
        setJobDescription(text);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Target Job Description</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                    Paste the job description (JD) below. AI will use this to optimize your keywords and tailor the resume content.
                </p>

                <textarea
                    className="w-full h-64 rounded-lg border border-gray-300 p-4 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                    placeholder="Paste Job Description here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border rounded-lg">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
                    >
                        <Check className="h-4 w-4" /> Save Context
                    </button>
                </div>
            </div>
        </div>
    );
}
