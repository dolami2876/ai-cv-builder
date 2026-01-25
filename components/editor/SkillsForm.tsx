"use client";

import { useResumeStore } from "@/lib/store";
import { X, Plus } from "lucide-react";
import { useState, KeyboardEvent } from "react";

export default function SkillsForm() {
    const { skills, setSkills } = useResumeStore();
    const [inputValue, setInputValue] = useState("");

    const handleAddSkill = () => {
        if (inputValue.trim() && !skills.includes(inputValue.trim())) {
            setSkills([...skills, inputValue.trim()]);
            setInputValue("");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills(skills.filter((skill) => skill !== skillToRemove));
    };

    return (
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                <p className="text-sm text-gray-500">Add technical and soft skills (press Enter).</p>
            </div>

            <div className="flex gap-3">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="e.g. React, Next.js, Team Leadership..."
                />
                <button
                    onClick={handleAddSkill}
                    className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                    disabled={!inputValue.trim()}
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {skills.length === 0 && (
                    <span className="text-sm text-gray-400 italic">No skills added yet.</span>
                )}
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className="group flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 border border-purple-100"
                    >
                        {skill}
                        <button
                            onClick={() => removeSkill(skill)}
                            className="rounded-full p-0.5 text-purple-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}
