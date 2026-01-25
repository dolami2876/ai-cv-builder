"use client";

import { useResumeStore } from "@/lib/store";
import { Plus, Trash2, GripVertical, Wand2 } from "lucide-react";
import { useState } from "react";
// import AIWriter from "./AIWriter"; // Assuming we reuse AIWriter later

export default function ActivitiesForm() {
    const { activities, addActivity, updateActivity, removeActivity, style } = useResumeStore();
    const [isImproving, setIsImproving] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Activities & Extracurriculars</h3>
                <button
                    onClick={addActivity}
                    className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition"
                >
                    <Plus className="h-4 w-4" /> Add Activity
                </button>
            </div>

            {activities.length === 0 && (
                <p className="text-sm text-gray-500 italic">No activities added yet.</p>
            )}

            <div className="space-y-4">
                {activities.map((item, index) => (
                    <div key={item.id} className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                            <button
                                onClick={() => removeActivity(index)}
                                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Organization Name</label>
                                    <input
                                        type="text"
                                        value={item.organization}
                                        onChange={(e) => updateActivity(index, "organization", e.target.value)}
                                        placeholder="e.g. Volunteer Club"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Role</label>
                                    <input
                                        type="text"
                                        value={item.role}
                                        onChange={(e) => updateActivity(index, "role", e.target.value)}
                                        placeholder="e.g. Member"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Start Date</label>
                                    <input
                                        type="text"
                                        value={item.startDate}
                                        onChange={(e) => updateActivity(index, "startDate", e.target.value)}
                                        placeholder="MM/YYYY"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">End Date</label>
                                    <input
                                        type="text"
                                        value={item.endDate}
                                        onChange={(e) => updateActivity(index, "endDate", e.target.value)}
                                        placeholder="Present"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 flex items-center justify-between text-xs font-medium text-gray-500">
                                    <span>Description</span>
                                </label>
                                <textarea
                                    value={item.description}
                                    onChange={(e) => updateActivity(index, "description", e.target.value)}
                                    placeholder="Describe your responsibilities..."
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
