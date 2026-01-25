"use client";

import { useResumeStore } from "@/lib/store";
import { Plus, Trash2 } from "lucide-react";

export default function ReferencesForm() {
    const { references, addReference, updateReference, removeReference } = useResumeStore();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">References</h3>
                <button
                    onClick={addReference}
                    className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition"
                >
                    <Plus className="h-4 w-4" /> Add Reference
                </button>
            </div>

            {references.length === 0 && (
                <p className="text-sm text-gray-500 italic">No references added yet.</p>
            )}

            <div className="space-y-4">
                {references.map((item, index) => (
                    <div key={item.id} className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                            <button
                                onClick={() => removeReference(index)}
                                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Name</label>
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateReference(index, "name", e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Role</label>
                                    <input
                                        type="text"
                                        value={item.role}
                                        onChange={(e) => updateReference(index, "role", e.target.value)}
                                        placeholder="e.g. Manager"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Company</label>
                                <input
                                    type="text"
                                    value={item.company}
                                    onChange={(e) => updateReference(index, "company", e.target.value)}
                                    placeholder="e.g. Company XYZ"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
                                    <input
                                        type="email"
                                        value={item.email}
                                        onChange={(e) => updateReference(index, "email", e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Phone</label>
                                    <input
                                        type="text"
                                        value={item.phone}
                                        onChange={(e) => updateReference(index, "phone", e.target.value)}
                                        placeholder="+1 234 567 890"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
