"use client";

import { useResumeStore } from "@/lib/store";
import { Plus, Trash2 } from "lucide-react";

export default function CertificatesForm() {
    const { certificates, addCertificate, updateCertificate, removeCertificate } = useResumeStore();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Certificates</h3>
                <button
                    onClick={addCertificate}
                    className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition"
                >
                    <Plus className="h-4 w-4" /> Add Certificate
                </button>
            </div>

            {certificates.length === 0 && (
                <p className="text-sm text-gray-500 italic">No certificates added yet.</p>
            )}

            <div className="space-y-4">
                {certificates.map((item, index) => (
                    <div key={item.id} className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
                            <button
                                onClick={() => removeCertificate(index)}
                                className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Certificate Name</label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateCertificate(index, "name", e.target.value)}
                                    placeholder="e.g. AWS Certified Solutions Architect"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Issuer</label>
                                    <input
                                        type="text"
                                        value={item.issuer}
                                        onChange={(e) => updateCertificate(index, "issuer", e.target.value)}
                                        placeholder="e.g. Amazon Web Services"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Date</label>
                                    <input
                                        type="text"
                                        value={item.date}
                                        onChange={(e) => updateCertificate(index, "date", e.target.value)}
                                        placeholder="MM/YYYY"
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
