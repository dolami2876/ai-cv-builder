"use client";

import { useUser } from "@clerk/nextjs";
import { Plus, FileText, Calendar, Trash2, Edit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import PricingModal from "@/components/editor/PricingModal";

interface ResumeSummary {
    _id: string;
    title: string;
    updatedAt: string;
}

export default function DashboardPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();
    const [resumes, setResumes] = useState<ResumeSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPricing, setShowPricing] = useState(false);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push("/");
        } else if (isLoaded && isSignedIn) {
            fetchResumes();
        }
    }, [isLoaded, isSignedIn, router]);

    const fetchResumes = async () => {
        try {
            const res = await fetch("/api/resumes");
            if (res.ok) {
                const data = await res.json();
                setResumes(data);
            }
        } catch (error) {
            console.error("Failed to fetch resumes", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteResume = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        if (!confirm("Are you sure you want to delete this resume?")) return;

        try {
            const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
            if (res.ok) {
                setResumes((prev) => prev.filter((r) => r._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const duplicateResume = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
            if (res.ok) {
                const newResume = await res.json();
                // Add to list (at the top)
                setResumes((prev) => [
                    {
                        _id: newResume._id,
                        title: newResume.title,
                        updatedAt: newResume.updatedAt
                    },
                    ...prev
                ]);
            }
        } catch (error) {
            console.error("Failed to duplicate", error);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
                        <p className="text-gray-500">Manage your CVs and create new ones.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowPricing(true)}
                            className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-5 py-2.5 text-sm font-medium text-yellow-700 hover:bg-yellow-100 transition-all"
                        >
                            <span className="">Upgrade PRO</span>
                        </button>
                        <Link
                            href="/onboarding"
                            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 focus:ring-4 focus:ring-gray-200"
                        >
                            <Plus className="h-4 w-4" /> Create New
                        </Link>
                    </div>
                </div>

                {resumes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
                        <div className="mb-4 rounded-full bg-gray-50 p-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No resumes yet</h3>
                        <p className="mb-6 max-w-sm text-gray-500">
                            You haven't created any resumes. Start by building your first professional CV with AI.
                        </p>
                        <Link
                            href="/onboarding"
                            className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
                        >
                            Create Resume
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {resumes.map((resume) => (
                            <Link
                                key={resume._id}
                                href={`/editor/${resume._id}`}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-purple-200 hover:shadow-md"
                            >
                                <div className="mb-4">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                                        {resume.title || "Untitled Resume"}
                                    </h3>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="h-3 w-3" />
                                        <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <span className="flex items-center gap-1 text-xs font-medium text-purple-600 group-hover:underline">
                                        Edit Resume <Edit className="h-3 w-3" />
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => duplicateResume(resume._id, e)}
                                            className="rounded p-2 text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                            title="Duplicate"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                        </button>
                                        <button
                                            onClick={(e) => deleteResume(resume._id, e)}
                                            className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
        </div>
    );
}
