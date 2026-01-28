'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { FileText, Loader2, Sparkles, Download, Copy, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CVGeneratorClient() {
    const { isSignedIn } = useUser();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        experience: '',
        education: '',
        skills: '',
        targetJob: '',
        jobDescription: '',
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!searchParams) return;
        const targetJobParam = searchParams.get('targetJob') || '';
        const skillsParam = searchParams.get('skills') || '';
        const educationParam = searchParams.get('education') || '';

        if (targetJobParam || skillsParam || educationParam) {
            setFormData(prev => ({
                ...prev,
                targetJob: targetJobParam || prev.targetJob,
                skills: skillsParam || prev.skills,
                education: educationParam || prev.education,
            }));
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isSignedIn) {
            setError('Vui lòng đăng nhập để sử dụng công cụ này');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setResumeId(null);

        try {
            // Prepare structured data for AI
            const userData = {
                personalInfo: {
                    fullName: formData.name,
                    email: formData.email,
                    phone: formData.phone || undefined,
                },
                experience: formData.experience,
                education: formData.education,
                skills: formData.skills,
                targetJob: formData.targetJob,
                jobDescription: formData.jobDescription || undefined,
            };

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: JSON.stringify(userData),
                    type: 'generate_full',
                    context: {
                        targetDomain: formData.targetJob,
                        jobDescription: formData.jobDescription,
                        userData: userData, // Pass structured data
                    },
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to generate CV content');
            }

            const text = await response.text();
            const data = JSON.parse(text);
            setResult(data);

            // Tự động lưu nội dung CV thành một Resume trong database
            try {
                const createRes = await fetch('/api/resumes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: `${formData.targetJob || 'AI Generated'} Resume`,
                        targetDomain: formData.targetJob || undefined,
                        experienceLevel: 'AI-generated',
                        jobGoal: 'Full-time',
                        personalInfo: {
                            fullName: data.personalInfo?.fullName || formData.name,
                            email: data.personalInfo?.email || formData.email,
                            phone: data.personalInfo?.phone || formData.phone,
                            linkedin: '',
                            portfolio: '',
                        },
                        summary: data.summary,
                        experience: data.experience,
                        education: data.education,
                        skills: data.skills,
                    }),
                });

                if (!createRes.ok) {
                    console.error('Failed to auto-save resume');
                } else {
                    const created = await createRes.json();
                    setResumeId(created._id);
                }
            } catch (saveErr) {
                console.error('Error auto-saving resume:', saveErr);
            }
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                        <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        AI Sinh Nội Dung CV
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Tự động tạo nội dung CV chuyên nghiệp, tối ưu cho ATS và phù hợp với vị trí ứng tuyển
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và Tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kinh nghiệm làm việc <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                placeholder="Ví dụ: 3 năm làm Frontend Developer tại công ty ABC, chịu trách nhiệm phát triển web app..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                rows={4}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Học vấn
                            </label>
                            <textarea
                                name="education"
                                value={formData.education}
                                onChange={handleChange}
                                placeholder="Ví dụ: Cử nhân Công nghệ Thông tin, Đại học Bách Khoa (2018-2022)..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kỹ năng <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="Ví dụ: JavaScript, React, Node.js, Python, Git, Agile..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vị trí ứng tuyển <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="targetJob"
                                value={formData.targetJob}
                                onChange={handleChange}
                                placeholder="Ví dụ: Senior Frontend Developer"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả công việc (Job Description)
                            </label>
                            <textarea
                                name="jobDescription"
                                value={formData.jobDescription}
                                onChange={handleChange}
                                placeholder="Dán mô tả công việc từ nhà tuyển dụng để AI tối ưu CV phù hợp..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                rows={5}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !isSignedIn}
                            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Đang tạo nội dung CV...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Tạo Nội Dung CV
                                </>
                            )}
                        </button>

                        {!isSignedIn && (
                            <p className="text-sm text-center text-gray-500">
                                <Link href="/sign-in" className="text-purple-600 hover:underline">
                                    Đăng nhập
                                </Link> để sử dụng công cụ này
                            </p>
                        )}
                    </form>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Nội Dung CV Đã Tạo</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                                    >
                                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Đã copy' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            {/* Personal Info */}
                            {result.personalInfo && (
                                <div className="mb-6 pb-6 border-b">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin cá nhân</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm text-gray-600">Họ tên:</span>
                                            <p className="font-medium">{result.personalInfo.fullName}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Email:</span>
                                            <p className="font-medium">{result.personalInfo.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            {result.summary && (
                                <div className="mb-6 pb-6 border-b">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tóm tắt</h3>
                                    <p className="text-gray-700 leading-relaxed">{result.summary}</p>
                                </div>
                            )}

                            {/* Experience */}
                            {result.experience && result.experience.length > 0 && (
                                <div className="mb-6 pb-6 border-b">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Kinh nghiệm</h3>
                                    <div className="space-y-4">
                                        {result.experience.map((exp: any, index: number) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                                                        <p className="text-gray-600">{exp.company}</p>
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {exp.startDate} - {exp.endDate}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {result.education && result.education.length > 0 && (
                                <div className="mb-6 pb-6 border-b">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Học vấn</h3>
                                    <div className="space-y-3">
                                        {result.education.map((edu: any, index: number) => (
                                            <div key={index} className="flex justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                                                    <p className="text-gray-600">{edu.school}</p>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {edu.startDate} - {edu.endDate}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills */}
                            {result.skills && result.skills.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Kỹ năng</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.skills.map((skill: string, index: number) => (
                                            <span key={index} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CTA */}
                        <div className="text-center bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold mb-4">Sẵn sàng tạo CV hoàn chỉnh?</h3>
                            <p className="mb-6">Chọn template và tạo CV chuyên nghiệp với nội dung này</p>
                            <Link
                                href={resumeId ? `/tools/template-selector?resumeId=${resumeId}` : '/tools/template-selector'}
                                className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                            >
                                Chọn Template <Download className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

