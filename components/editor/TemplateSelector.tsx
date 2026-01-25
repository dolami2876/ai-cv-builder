"use client";

import { useResumeStore } from "@/lib/store";
import { Palette, Layout, Type } from "lucide-react";
import { useState } from "react";

export default function TemplateSelector() {
    const { style, setStyle } = useResumeStore();
    const [isOpen, setIsOpen] = useState(false);

    const colors = [
        "#000000", // Black
        "#2563eb", // Blue
        "#7c3aed", // Violet
        "#db2777", // Pink
        "#16a34a", // Green
        "#dc2626", // Red
    ];

    const fonts = [
        { id: "inter", name: "Inter (Modern)" },
        { id: "serif", name: "Serif (Classic)" },
        { id: "mono", name: "Mono (Technical)" },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
                <Palette className="h-4 w-4 text-gray-500" />
                <span className="hidden sm:inline">Design</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
                    <div className="mb-4 space-y-3">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <Palette className="h-3 w-3" /> Accent Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setStyle({ hexColor: color })}
                                    className={`h-6 w-6 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 ${style.hexColor === color ? 'ring-2 ring-gray-400 ring-offset-2' : ''}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mb-4 space-y-3">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <Type className="h-3 w-3" /> Font Family
                        </label>
                        <select
                            value={style.font}
                            onChange={(e) => setStyle({ font: e.target.value })}
                            className="w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1.5 text-sm outline-none focus:border-purple-500"
                        >
                            {fonts.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <Layout className="h-3 w-3" /> Layout
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setStyle({ layout: "modern" })}
                                className={`rounded-md border p-2 text-center text-xs transition-colors ${style.layout === "modern" ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                Modern
                            </button>
                            <button
                                onClick={() => setStyle({ layout: "classic" })}
                                className={`rounded-md border p-2 text-center text-xs transition-colors ${style.layout === "classic" ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                Classic
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside closer overlay could go here */}
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
}
