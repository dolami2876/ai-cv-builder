"use client";

import { useResumeStore } from "@/lib/store";
import { Plus, Trash2 } from "lucide-react";

export default function AwardsForm() {
    const { awards, addAward, updateAward, removeAward } = useResumeStore();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Honors & Awards</h3>
                <button
                    onClick={addAward}
                    className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition"
                >
                    <Plus className="h-4 w-4" /> Add Award
                </button>
            </div>

            {awards.length === 0 && (
                <p className="text-sm text-gray-500 italic">No awards added yet.</p>
            )}

            <div className="space-y-4">
                {awards.map((item, index) => (
                    <div key={item.id} className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                            <button
                                onClick={() => removeAward(index)}
                                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Award Title</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateAward(index, "title", e.target.value)}
                                    placeholder="e.g. Employee of the Month"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Issuer</label>
                                    <input
                                        type="text"
                                        value={item.issuer}
                                        onChange={(e) => updateAward(index, "issuer", e.target.value)}
                                        placeholder="e.g. Company ABC"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Date</label>
                                    <input
                                        type="text"
                                        value={item.date}
                                        onChange={(e) => updateAward(index, "date", e.target.value)}
                                        placeholder="MM/YYYY"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Description (Optional)</label>
                                <textarea
                                    value={item.description}
                                    onChange={(e) => updateAward(index, "description", e.target.value)}
                                    placeholder="Brief details about the award..."
                                    rows={2}
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
