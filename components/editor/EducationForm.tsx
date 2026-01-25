"use client";

import { useResumeStore, Education } from "@/lib/store";
import { Plus, Trash2 } from "lucide-react";

export default function EducationForm() {
    const { education, addEducation, removeEducation, updateEducation } = useResumeStore();

    return (
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Education</h2>
            <div className="space-y-4">
                {education.map((edu, index) => (
                    <EducationItem
                        key={edu.id}
                        index={index}
                        data={edu}
                        update={updateEducation}
                        remove={removeEducation}
                    />
                ))}
            </div>
            <button
                onClick={addEducation}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
                <Plus className="h-4 w-4" /> Add Education
            </button>
        </div>
    );
}

function EducationItem({
    index,
    data,
    update,
    remove
}: {
    index: number;
    data: Education;
    update: (index: number, field: keyof Education, value: string) => void;
    remove: (index: number) => void;
}) {
    return (
        <div className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-5 transition-all hover:bg-white hover:shadow-sm">
            <button
                onClick={() => remove(index)}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Remove Item"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">School / University</label>
                    <input
                        value={data.school}
                        onChange={(e) => update(index, "school", e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="e.g. University of Science"
                    />
                </div>
                <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Degree & Major</label>
                    <input
                        value={data.degree}
                        onChange={(e) => update(index, "degree", e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="e.g. Bachelor of Computer Science"
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
                        placeholder="MM/YYYY or Present"
                    />
                </div>
            </div>
        </div>
    );
}
