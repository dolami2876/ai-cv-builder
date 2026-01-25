"use client";

import { useResumeStore } from "@/lib/store";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export default function InterestsForm() {
    const { interests, setInterests } = useResumeStore();
    const [inputValue, setInputValue] = useState("");

    const handleAdd = () => {
        if (!inputValue.trim()) return;
        setInterests([...interests, inputValue.trim()]);
        setInputValue("");
    };

    const handleRemove = (index: number) => {
        setInterests(interests.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Interests & Hobbies</h3>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Photography, Reading, Hiking"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <button
                    onClick={handleAdd}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {interests.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No interests added yet.</p>
                )}
                {interests.map((interest, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                        {interest}
                        <button
                            onClick={() => handleRemove(index)}
                            className="ml-1 rounded-full p-0.5 hover:bg-blue-200"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
