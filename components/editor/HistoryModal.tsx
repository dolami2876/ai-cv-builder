"use client";

import { useResumeStore } from "@/lib/store";
import { X, Clock, RotateCcw } from "lucide-react";
// Native Date used instead

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    resumeId: string;
}

export default function HistoryModal({ isOpen, onClose, resumeId }: HistoryModalProps) {
    const { versions, restoreVersion } = useResumeStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        Version History
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Restore previous versions of your resume.</p>
                </div>

                <div className="mb-4">
                    <button
                        onClick={() => {
                            useResumeStore.getState().createVersion();
                            // Optional: auto-save after creating version to persist it immediately
                            useResumeStore.getState().saveResume(resumeId);
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-all"
                    >
                        <Clock className="h-4 w-4" /> Create Snapshot
                    </button>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                    {versions && versions.length > 0 ? (
                        versions
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((version, index) => (
                                <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4 hover:border-purple-200 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            Version {versions.length - index}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(version.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm("Restore this version? current changes will be lost.")) {
                                                restoreVersion(version.content);
                                                onClose();
                                            }
                                        }}
                                        className="flex items-center gap-1.5 rounded-md bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        Restore
                                    </button>
                                </div>
                            ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No history available yet. Save needed.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
