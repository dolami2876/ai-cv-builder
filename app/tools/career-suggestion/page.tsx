'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Brain, Loader2, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface CareerSuggestion {
    career: string;
    jobTitles: string[];
    matchScore: number;
    reasons: string[];
    keywords: string[];
    requiredSkills: string[];
    growthPotential: string;
}

interface CareerSuggestionResponse {
    suggestedCareers: CareerSuggestion[];
    summary: string;
    nextSteps: string[];
}

export default function CareerSuggestionPage() {
    const { isSignedIn } = useUser();
    const [skills, setSkills] = useState('');
    const [education, setEducation] = useState('');
    const [interests, setInterests] = useState('');
    const [goals, setGoals] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CareerSuggestionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isSignedIn) {
            setError('Vui lòng đăng nhập để sử dụng công cụ này');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/career-suggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skills, education, interests, goals }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to get career suggestions');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const getGrowthColor = (potential: string) => {
        if (potential.toLowerCase().includes('high')) return 'text-green-600 bg-green-50';
        if (potential.toLowerCase().includes('medium')) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                        <Brain className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        AI Gợi ý Ngành Nghề
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Khám phá ngành nghề phù hợp với kỹ năng, học vấn và sở thích của bạn
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kỹ năng của bạn <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder="Ví dụ: JavaScript, Python, Quản lý dự án, Giao tiếp, Thiết kế..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Học vấn
                            </label>
                            <input
                                type="text"
                                value={education}
                                onChange={(e) => setEducation(e.target.value)}
                                placeholder="Ví dụ: Cử nhân Công nghệ Thông tin, Đại học Bách Khoa..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sở thích / Mục tiêu
                            </label>
                            <textarea
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                                placeholder="Ví dụ: Phát triển phần mềm, Khởi nghiệp, Làm việc với dữ liệu..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mục tiêu nghề nghiệp
                            </label>
                            <textarea
                                value={goals}
                                onChange={(e) => setGoals(e.target.value)}
                                placeholder="Ví dụ: Trở thành Senior Developer trong 3 năm, Khởi nghiệp công ty công nghệ..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !isSignedIn}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Đang phân tích...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Nhận Gợi ý Ngành Nghề
                                </>
                            )}
                        </button>

                        {!isSignedIn && (
                            <p className="text-sm text-center text-gray-500">
                                <Link href="/sign-in" className="text-blue-600 hover:underline">
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
                    <div className="space-y-8">
                        {/* Summary */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
                            <h2 className="text-2xl font-bold mb-4">Tóm tắt Phân tích</h2>
                            <p className="text-lg leading-relaxed">{result.summary}</p>
                        </div>

                        {/* Suggested Careers */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">Ngành Nghề Đề Xuất</h2>
                            {result.suggestedCareers.map((career, index) => {
                                const targetJobFromSuggestion =
                                    career.jobTitles?.[0] || career.career;
                                const href = `/tools/cv-generator?${new URLSearchParams({
                                    targetJob: targetJobFromSuggestion,
                                    skills,
                                    education,
                                }).toString()}`;
                                return (
                                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{career.career}</h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-medium text-gray-600">Điểm phù hợp:</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                                            style={{ width: `${career.matchScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-lg font-bold text-blue-600">{career.matchScore}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGrowthColor(career.growthPotential)}`}>
                                            {career.growthPotential}
                                        </span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Vị trí công việc:</h4>
                                            <ul className="space-y-1">
                                                {career.jobTitles.map((title, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-gray-700">
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        {title}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Lý do phù hợp:</h4>
                                            <ul className="space-y-1">
                                                {career.reasons.map((reason, i) => (
                                                    <li key={i} className="text-gray-700 flex items-start gap-2">
                                                        <ArrowRight className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                                                        <span>{reason}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Kỹ năng cần thiết:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {career.requiredSkills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Từ khóa quan trọng:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {career.keywords.map((keyword, i) => (
                                                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <Link
                                            href={href}
                                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                                        >
                                            Tạo CV với ngành này
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                                );
                            })}
                        </div>

                        {/* Next Steps */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Các Bước Tiếp Theo</h3>
                            <ol className="space-y-3">
                                {result.nextSteps.map((step, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="text-gray-700 pt-1">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* CTA */}
                        <div className="text-center bg-white rounded-xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sẵn sàng tạo CV?</h3>
                            <p className="text-gray-600 mb-6">Sử dụng thông tin này để tạo CV chuyên nghiệp với AI</p>
                            <Link
                                href="/tools/cv-generator"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Tạo CV Ngay <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
