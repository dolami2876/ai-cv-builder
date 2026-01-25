"use client";

import { useResumeStore } from "@/lib/store";

export default function PersonalInfoForm() {
    const { personalInfo, setPersonalInfo } = useResumeStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPersonalInfo({ [name]: value });
    };

    return (
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                <p className="text-sm text-gray-500">Start with your header details.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={personalInfo.fullName}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder:text-gray-400"
                        placeholder="e.g. Nguyen Van A"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={personalInfo.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder:text-gray-400"
                        placeholder="e.g. contact@email.com"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={personalInfo.phone}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder:text-gray-400"
                        placeholder="e.g. 0912 345 678"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">LinkedIn Profile</label>
                    <input
                        type="text"
                        name="linkedin"
                        value={personalInfo.linkedin}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder:text-gray-400"
                        placeholder="linkedin.com/in/username"
                    />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Portfolio / Website</label>
                    <input
                        type="text"
                        name="portfolio"
                        value={personalInfo.portfolio}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder:text-gray-400"
                        placeholder="e.g. myportfolio.com"
                    />
                </div>
            </div>
        </div>
    );
}
