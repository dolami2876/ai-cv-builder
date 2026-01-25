"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, GraduationCap, MapPin, Loader2 } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        experienceLevel: "", // Student, Experienced, Switcher
        targetDomain: "",    // e.g. Software Engineer
        jobGoal: "",         // e.g. Get a job
    });

    const handleSelectLevel = (level: string) => {
        setFormData({ ...formData, experienceLevel: level });
        setStep(2);
    };

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            // Create Resume in DB
            const res = await fetch("/api/resumes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetDomain: formData.targetDomain,
                    experienceLevel: formData.experienceLevel,
                    jobGoal: formData.jobGoal || "Full-time",
                    // Pre-fill Title contextually
                    title: `${formData.targetDomain} Resume`
                }),
            });

            if (!res.ok) throw new Error("Failed to create resume");

            const data = await res.json();

            // Redirect to Editor
            router.push(`/editor/${data._id}`);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
                {/* Progress Bar */}
                <div className="mb-8 flex gap-2">
                    <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-purple-600' : 'bg-gray-200'}`} />
                    <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
                </div>

                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Choose your starting point</h2>
                            <p className="text-gray-500">Helping us understand your experience helps AI write better content.</p>
                        </div>

                        <div className="grid gap-4">
                            <button
                                onClick={() => handleSelectLevel("Student / Fresher")}
                                className="flex items-center gap-4 rounded-xl border p-4 text-left transition hover:border-purple-600 hover:bg-purple-50"
                            >
                                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Student / Fresher</h3>
                                    <p className="text-sm text-gray-500">Less than 1 year of experience</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectLevel("Experienced Pro")}
                                className="flex items-center gap-4 rounded-xl border p-4 text-left transition hover:border-purple-600 hover:bg-purple-50"
                            >
                                <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                                    <Briefcase className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Experienced Pro</h3>
                                    <p className="text-sm text-gray-500">I have worked in my industry</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectLevel("Career Switcher")}
                                className="flex items-center gap-4 rounded-xl border p-4 text-left transition hover:border-purple-600 hover:bg-purple-50"
                            >
                                <div className="rounded-full bg-green-100 p-3 text-green-600">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Career Changer</h3>
                                    <p className="text-sm text-gray-500">Moving to a new industry</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Quick details</h2>
                            <p className="text-gray-500">Tell us what you are aiming for.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Target Job Title</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="e.g. UX Designer, Sales Manager"
                                    value={formData.targetDomain}
                                    onChange={(e) => setFormData({ ...formData, targetDomain: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            {/* Optional: Add Job Goal or Experience Years input here if strictly following diagram */}
                        </div>

                        <button
                            onClick={handleFinish}
                            disabled={!formData.targetDomain.trim() || isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <><Loader2 className="animate-spin" /> Creating Profile...</>
                            ) : (
                                <>Create Resume <ArrowRight className="h-5 w-5" /></>
                            )}
                        </button>

                        <button onClick={() => setStep(1)} className="w-full text-sm text-gray-400 hover:text-gray-600">
                            Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
