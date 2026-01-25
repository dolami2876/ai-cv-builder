"use client";

import { useResumeStore } from "@/lib/store";
import { Mail, Phone, Linkedin, Globe, MapPin } from "lucide-react";
import React from 'react';

export default function ResumePreview() {
    const store = useResumeStore();
    const { personalInfo, experience, education, skills, summary, style } = store;

    // Use store style or defaults
    const hexColor = style?.hexColor || "#000000";
    const layout = style?.layout || "modern";
    const font = style?.font || "inter";

    // Computed Styles
    const containerStyle = {
        fontFamily: font === 'serif' ? 'Times New Roman, serif' : font === 'mono' ? 'Courier New, monospace' : 'Arial, sans-serif',
    };

    return (
        <div
            id="resume-preview-container"
            className="mx-auto w-[210mm] min-h-[297mm] bg-white p-[20mm] shadow-2xl overflow-hidden text-sm leading-relaxed text-gray-800 transition-colors"
            style={containerStyle}
        >
            {/* --- LAYOUT: MODERN --- */}
            {layout === 'modern' && (
                <header className="mb-6 border-b-2 pb-6" style={{ borderColor: hexColor }}>
                    <h1 className="mb-2 text-4xl font-extrabold uppercase tracking-tight text-gray-900">
                        {personalInfo.fullName || "Your Name"}
                    </h1>
                    <p className="text-lg font-medium tracking-wide mb-4" style={{ color: hexColor }}>
                        {personalInfo.portfolio || "Professional Title"}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-600">
                        {personalInfo.email && <span>{personalInfo.email}</span>}
                        {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                        {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
                    </div>
                </header>
            )}

            {/* --- LAYOUT: CLASSIC (Centered) --- */}
            {layout === 'classic' && (
                <header className="mb-8 text-center">
                    <h1 className="mb-2 text-3xl font-serif font-bold text-gray-900">
                        {personalInfo.fullName || "Your Name"}
                    </h1>
                    <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600 mb-4">
                        {personalInfo.email && <span>{personalInfo.email}</span>}
                        {personalInfo.phone && <span>| {personalInfo.phone}</span>}
                        {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
                    </div>
                    <div className="h-0.5 w-16 bg-gray-800 mx-auto" style={{ backgroundColor: hexColor }}></div>
                </header>
            )}

            {/* SHARED SECTIONS */}

            <section className="mb-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: hexColor, borderColor: '#e5e7eb' }}>
                    Profile
                </h3>
                <p className="text-gray-700 leading-relaxed">
                    {summary || "A professional summary of your background and goals..."}
                </p>
            </section>

            <section className="mb-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: hexColor, borderColor: '#e5e7eb' }}>
                    Experience
                </h3>
                <div className="space-y-5">
                    {experience.length === 0 && <p className="text-gray-400 italic">No experience added.</p>}
                    {experience.map((exp) => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-gray-900">{exp.role}</h4>
                                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                                    {exp.startDate} – {exp.endDate}
                                </span>
                            </div>
                            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: hexColor }}>
                                {exp.company}
                            </div>
                            <div className="text-gray-700 whitespace-pre-line pl-1 border-l-2 border-gray-100">
                                {exp.description}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: hexColor, borderColor: '#e5e7eb' }}>
                    Education
                </h3>
                <div className="space-y-3">
                    {education.length === 0 && <p className="text-gray-400 italic">No education added.</p>}
                    {education.map((edu) => (
                        <div key={edu.id} className="flex justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900">{edu.school}</h4>
                                <div className="">{edu.degree}</div>
                            </div>
                            <div className="text-xs font-medium text-gray-500 text-right">
                                {edu.startDate} – {edu.endDate}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* EXTENDED SECTIONS */}
            {store.activities && store.activities.length > 0 && (
                <section className="mb-6">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: hexColor, borderColor: '#e5e7eb' }}>
                        Activities
                    </h3>
                    <div className="space-y-4">
                        {store.activities.map((act) => (
                            <div key={act.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-gray-900">{act.role}</h4>
                                    <span className="text-xs font-medium text-gray-500">{act.startDate} – {act.endDate}</span>
                                </div>
                                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: hexColor }}>
                                    {act.organization}
                                </div>
                                <p className="text-gray-700">{act.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {store.certificates && store.certificates.length > 0 && (
                <section className="mb-6">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: hexColor, borderColor: '#e5e7eb' }}>
                        Certificates
                    </h3>
                    <div className="grid gap-2">
                        {store.certificates.map((cert) => (
                            <div key={cert.id} className="flex justify-between">
                                <div>
                                    <span className="font-semibold text-gray-900">{cert.name}</span>
                                    <span className="text-gray-600"> - {cert.issuer}</span>
                                </div>
                                <span className="text-xs text-gray-500">{cert.date}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {store.awards && store.awards.length > 0 && (
                <section className="mb-6">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: hexColor, borderColor: '#e5e7eb' }}>
                        Honors & Awards
                    </h3>
                    <div className="space-y-3">
                        {store.awards.map((award) => (
                            <div key={award.id}>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-900">{award.title}</span>
                                    <span className="text-xs text-gray-500">{award.date}</span>
                                </div>
                                <div className="text-xs text-gray-600 mb-1">{award.issuer}</div>
                                {award.description && <p className="text-sm text-gray-700">{award.description}</p>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {store.interests && store.interests.length > 0 && (
                <section className="mb-6">
                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: hexColor, borderColor: '#e5e7eb' }}>
                        Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {store.interests.map((interest, i) => (
                            <span key={i} className="text-gray-700">
                                {interest}{i < store.interests.length - 1 ? " • " : ""}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {store.references && store.references.length > 0 && (
                <section className="mb-6">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: hexColor, borderColor: '#e5e7eb' }}>
                        References
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {store.references.map((ref) => (
                            <div key={ref.id} className="text-sm">
                                <div className="font-bold text-gray-900">{ref.name}</div>
                                <div className="text-gray-700">{ref.role} - {ref.company}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    <div>{ref.phone}</div>
                                    <div>{ref.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: hexColor, borderColor: '#e5e7eb' }}>
                    Skills
                </h3>
                <div className="flex flex-wrap gap-x-2 gap-y-2">
                    {skills.length === 0 && <p className="text-gray-400 italic">No skills added.</p>}
                    {skills.map((skill, i) => (
                        <span key={i} className="text-gray-800 font-medium bg-gray-50 px-2 py-0.5 rounded text-xs">
                            {skill}
                        </span>
                    ))}
                </div>
            </section>
        </div>
    );
}
