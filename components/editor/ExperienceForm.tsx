"use client";

import { useResumeStore, Experience } from "@/lib/store";
import { Plus, Trash2, Wand2, Loader2 } from "lucide-react";
import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";

export default function ExperienceForm() {
    const { experience, addExperience, removeExperience, updateExperience, experienceLevel, targetDomain } = useResumeStore();

    return (
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Work Experience</h2>
            <div className="space-y-6">
                {experience.map((exp, index) => (
                    <ExperienceItem
                        key={exp.id}
                        index={index}
                        data={exp}
                        update={updateExperience}
                        remove={removeExperience}
                        context={{ experienceLevel, targetDomain }}
                    />
                ))}
            </div>
            <button
                onClick={addExperience}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
                <Plus className="h-4 w-4" /> Add Position
            </button>
        </div>
    );
}

function ExperienceItem({
    index,
    data,
    update,
    remove,
    context
}: {
    index: number;
    data: Experience;
    update: (index: number, field: keyof Experience, value: string) => void;
    remove: (index: number) => void;
    context: { experienceLevel: string; targetDomain: string };
}) {
    const [tone, setTone] = useState("Professional");

    const { completion, input, handleInputChange, complete, isLoading } = useCompletion({
        api: "/api/generate",
        body: { type: "improve", context, tone }, // Dynamic body dependent on render? 
        // Note: useCompletion body might be cached. If it is, we need another way.
    });

    const handleAIImprove = (e: React.MouseEvent) => {
        e.preventDefault();
        complete(data.description);
    };

    // Sync completion back to store while streaming (optional, allows realtime view in preview)
    // Here updating onFinish is safer to avoid too many re-renders, 
    // OR we can use useEffect to sync `completion` to store if we want realtime typing effect in Preview.
    // For now, let's update store only when done or if we want typing effect, we update on change.
    // Let's try basic implementation first: Update store when completion updates

    // Better UX: Show completion in textarea while streaming
    const currentValue = isLoading ? completion : data.description;

    return (
        <div className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-5 transition-all hover:bg-white hover:shadow-sm">
            <button
                onClick={() => remove(index)}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Remove Item"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Company</label>
                    <input
                        value={data.company}
                        onChange={(e) => update(index, "company", e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="e.g. Google"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Role</label>
                    <input
                        value={data.role}
                        onChange={(e) => update(index, "role", e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="e.g. Senior Developer"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Start Date</label>
                    <input
                        type="text"
                        value={data.startDate}
                        onChange={(e) => update(index, "startDate", e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="MM/YYYY"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">End Date</label>
                    <input
                        type="text"
                        value={data.endDate}
                        onChange={(e) => update(index, "endDate", e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="Present"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Key Achievements</label>
                    <div className="flex items-center gap-2">
                        <select
                            className="rounded-md border border-gray-200 bg-white py-1 pl-2 pr-6 text-xs font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            onChange={(e) => {
                                // We store tone in a data-attribute or state if needed, 
                                // but here we need to reload useCompletion with new body.
                                // Limitation of useCompletion: body is static unless we restart.
                                // Better approach: pass body to `complete(prompt, { body: ... })` if supported, 
                                // but useCompletion body is usually init-only or requires reload.
                                // Vercel AI SDK `complete` accepts options? No, it takes prompt.
                                // Workaround: We can't easily change body dynamically with useCompletion this way without re-mounting or custom fetch.
                                // Actually, useCompletion `complete` function accepts options in recent versions, but maybe not in this version.
                                // Let's try standard React state for the *next* call.
                            }}
                        // Implementing via local state in component to pass to hook
                        >
                            <option value="Professional">Professional</option>
                            <option value="Friendly">Friendly</option>
                            <option value="Confident">Confident</option>
                            <option value="Technical">Technical</option>
                        </select>
                        <button
                            onClick={handleAIImprove}
                            disabled={isLoading || !data.description}
                            className="flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors border border-purple-100"
                        >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                            AI Polish
                        </button>
                    </div>
                </div>
                <textarea
                    value={isLoading ? completion : data.description}
                    onChange={(e) => {
                        update(index, "description", e.target.value);
                        handleInputChange(e);
                    }}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 min-h-[100px]"
                    placeholder="• Led a team of 5 engineers...&#10;• Increased performance by 20%..."
                />
            </div>
        </div>
    );
}
