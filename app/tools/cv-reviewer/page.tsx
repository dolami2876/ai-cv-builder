'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Star, Loader2, Sparkles, AlertCircle, CheckCircle2, TrendingUp, Upload, FileText, X } from 'lucide-react';
import Link from 'next/link';

interface ReviewResult {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    atsCheck: {
        score: number;
        issues: string[];
    };
}

export default function CVReviewerPage() {
    const { isSignedIn } = useUser();
    const [resumeData, setResumeData] = useState('');
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [result, setResult] = useState<ReviewResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setExtracting(true);
        setError(null);
        setUploadedFile({ name: file.name, size: file.size });

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/extract-cv', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to extract text from file');
            }

            // Set extracted text to resumeData
            setResumeData(data.text);
        } catch (err: any) {
            setError(err.message || 'Không thể đọc file. Vui lòng thử lại hoặc dán nội dung trực tiếp.');
            setUploadedFile(null);
        } finally {
            setExtracting(false);
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setResumeData('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Core review logic (can be called from form submit or auto after upload)
    const runReview = async (rawText: string) => {
        if (!isSignedIn) {
            setError('Vui lòng đăng nhập để sử dụng công cụ này');
            return;
        }

        if (!rawText.trim()) {
            setError('Vui lòng upload file CV để đánh giá');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let parsedData;
            try {
                parsedData = JSON.parse(rawText);
            } catch {
                // If not JSON, treat as plain text
                parsedData = { rawText };
            }

            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    resumeData: parsedData,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to review CV');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await runReview(resumeData);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
                        <Star className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        AI Đánh Giá & Tối Ưu CV
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Nhận đánh giá chi tiết và gợi ý cải thiện CV theo tiêu chuẩn nhà tuyển dụng và ATS
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* File Upload Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload File CV (PDF, DOCX, DOC, TXT)
                            </label>
                            <div className="space-y-3">
                                {!uploadedFile ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-500 transition-colors">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.doc,.docx,.txt"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="file-upload"
                                            disabled={extracting}
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer flex flex-col items-center gap-2"
                                        >
                                            {extracting ? (
                                                <>
                                                    <Loader2 className="h-8 w-8 text-yellow-600 animate-spin" />
                                                    <span className="text-sm text-gray-600">Đang đọc file...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Click để chọn file hoặc kéo thả vào đây
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Hỗ trợ: PDF, DOCX, DOC, TXT (Tối đa 10MB)
                                                    </span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-yellow-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {(uploadedFile.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="p-2 text-gray-400 hover:text-red-600 transition"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !isSignedIn}
                            className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Đang đánh giá CV...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Đánh Giá CV
                                </>
                            )}
                        </button>

                        {!isSignedIn && (
                            <p className="text-sm text-center text-gray-500">
                                <Link href="/sign-in" className="text-yellow-600 hover:underline">
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
                        {/* Score Card */}
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-2xl p-8 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Điểm Đánh Giá Tổng Thể</h2>
                                    <p className="text-lg opacity-90">{result.summary}</p>
                                </div>
                                <div className={`text-6xl font-bold ${getScoreColor(result.score).split(' ')[0]}`}>
                                    {result.score}
                                </div>
                            </div>
                            <div className="mt-4 w-full bg-white/20 rounded-full h-3">
                                <div 
                                    className="bg-white rounded-full h-3 transition-all"
                                    style={{ width: `${result.score}%` }}
                                />
                            </div>
                        </div>

                        {/* Strengths */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                <h3 className="text-xl font-bold text-gray-900">Điểm Mạnh</h3>
                            </div>
                            <ul className="space-y-2">
                                {result.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-700">
                                        <span className="text-green-600 mt-1">✓</span>
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                                <h3 className="text-xl font-bold text-gray-900">Cần Cải Thiện</h3>
                            </div>
                            <ul className="space-y-2">
                                {result.weaknesses.map((weakness, index) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-700">
                                        <span className="text-red-600 mt-1">!</span>
                                        <span>{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ATS Check */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                                <h3 className="text-xl font-bold text-gray-900">Kiểm Tra ATS</h3>
                                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.atsCheck.score)}`}>
                                    {result.atsCheck.score}/100
                                </span>
                            </div>
                            {result.atsCheck.issues.length > 0 ? (
                                <ul className="space-y-2">
                                    {result.atsCheck.issues.map((issue, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-700">
                                            <span className="text-blue-600 mt-1">•</span>
                                            <span>{issue}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-700">CV của bạn tương thích tốt với ATS!</p>
                            )}
                        </div>

                        {/* CTA */}
                        <div className="text-center bg-white rounded-xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Cải thiện CV của bạn</h3>
                            <p className="text-gray-600 mb-6">Sử dụng các gợi ý trên để chỉnh sửa và tối ưu CV</p>
                            <Link
                                href="/tools/cv-iteration"
                                className="inline-flex items-center gap-2 bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition"
                            >
                                Chỉnh Sửa CV <Sparkles className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
