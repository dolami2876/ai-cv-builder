'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { RefreshCw, Loader2, History, GitCompare, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Version {
    id: string;
    timestamp: Date;
    data: any;
    score?: number;
    notes?: string;
}

export default function CVIterationPage() {
    const { isSignedIn, userId } = useUser();
    const router = useRouter();
    const [resumeId, setResumeId] = useState<string | null>(null);
    const [currentData, setCurrentData] = useState<any>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [selectedVersions, setSelectedVersions] = useState<[string | null, string | null]>([null, null]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isSignedIn && userId) {
            loadResumes();
        }
    }, [isSignedIn, userId]);

    const loadResumes = async () => {
        try {
            const res = await fetch('/api/resumes');
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    setResumeId(data[0]._id);
                    loadResumeData(data[0]._id);
                }
            }
        } catch (err) {
            console.error('Failed to load resumes:', err);
        }
    };

    const loadResumeData = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/resumes/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCurrentData(data);
                // Load version history (you might want to store this in a separate collection)
                setVersions([{
                    id: 'current',
                    timestamp: new Date(data.updatedAt || data.createdAt),
                    data: data,
                }]);
            }
        } catch (err) {
            setError('Không thể tải dữ liệu CV');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVersion = () => {
        if (!currentData) return;
        
        const newVersion: Version = {
            id: Date.now().toString(),
            timestamp: new Date(),
            data: { ...currentData },
        };
        
        setVersions([newVersion, ...versions]);
        alert('Đã lưu phiên bản mới!');
    };

    const handleCompare = () => {
        if (selectedVersions[0] && selectedVersions[1]) {
            // Show comparison modal or navigate to comparison page
            alert('Tính năng so sánh đang được phát triển');
        }
    };

    if (!isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h2>
                    <Link href="/sign-in" className="text-blue-600 hover:underline">
                        Đăng nhập để sử dụng công cụ này
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại Dashboard
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100">
                            <RefreshCw className="h-8 w-8 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                Tối Ưu Vòng Lặp Chỉnh Sửa
                            </h1>
                            <p className="text-lg text-gray-600">
                                Chỉnh sửa, so sánh và cải thiện CV của bạn liên tục
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
                        <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                ) : !currentData ? (
                    <div className="text-center bg-white rounded-xl p-8 shadow-lg">
                        <p className="text-gray-600 mb-4">Bạn chưa có CV nào. Hãy tạo CV mới!</p>
                        <Link
                            href="/tools/template-selector"
                            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                        >
                            Tạo CV Mới
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Current CV Info */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{currentData.title || 'My Resume'}</h2>
                                    <p className="text-gray-600">Cập nhật lần cuối: {new Date(currentData.updatedAt || currentData.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <Link
                                    href={`/editor/${resumeId}`}
                                    className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition"
                                >
                                    Chỉnh Sửa CV
                                </Link>
                            </div>
                        </div>

                        {/* Version History */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Lịch Sử Phiên Bản
                                </h3>
                                <button
                                    onClick={handleSaveVersion}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Save className="h-4 w-4" />
                                    Lưu Phiên Bản
                                </button>
                            </div>

                            {versions.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Chưa có phiên bản nào được lưu</p>
                            ) : (
                                <div className="space-y-3">
                                    {versions.map((version) => (
                                        <div
                                            key={version.id}
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedVersions.includes(version.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            if (!selectedVersions[0]) {
                                                                setSelectedVersions([version.id, selectedVersions[1]]);
                                                            } else if (!selectedVersions[1]) {
                                                                setSelectedVersions([selectedVersions[0], version.id]);
                                                            }
                                                        } else {
                                                            setSelectedVersions([
                                                                selectedVersions[0] === version.id ? null : selectedVersions[0],
                                                                selectedVersions[1] === version.id ? null : selectedVersions[1],
                                                            ]);
                                                        }
                                                    }}
                                                    disabled={selectedVersions.includes(version.id) || (selectedVersions[0] && selectedVersions[1] && !selectedVersions.includes(version.id))}
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Phiên bản {version.id === 'current' ? 'Hiện tại' : version.id}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {version.timestamp.toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                                {version.score && (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                        Điểm: {version.score}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedVersions[0] && selectedVersions[1] && (
                                <button
                                    onClick={handleCompare}
                                    className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                                >
                                    <GitCompare className="h-5 w-5" />
                                    So Sánh 2 Phiên Bản
                                </button>
                            )}
                        </div>

                        {/* Workflow Guide */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold mb-4">Quy Trình Tối Ưu CV</h3>
                            <ol className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-white text-orange-600 rounded-full flex items-center justify-center font-bold">
                                        1
                                    </span>
                                    <span>Chỉnh sửa CV dựa trên gợi ý từ AI Reviewer</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-white text-orange-600 rounded-full flex items-center justify-center font-bold">
                                        2
                                    </span>
                                    <span>Lưu phiên bản mới để theo dõi thay đổi</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-white text-orange-600 rounded-full flex items-center justify-center font-bold">
                                        3
                                    </span>
                                    <span>So sánh các phiên bản để thấy sự cải thiện</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-white text-orange-600 rounded-full flex items-center justify-center font-bold">
                                        4
                                    </span>
                                    <span>Lặp lại quy trình để tối ưu CV liên tục</span>
                                </li>
                            </ol>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <Link
                                href={`/editor/${resumeId}`}
                                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
                            >
                                <RefreshCw className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                <h4 className="font-semibold text-gray-900">Chỉnh Sửa CV</h4>
                            </Link>
                            <Link
                                href="/tools/cv-reviewer"
                                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
                            >
                                <History className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                <h4 className="font-semibold text-gray-900">Đánh Giá CV</h4>
                            </Link>
                            <Link
                                href="/dashboard"
                                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
                            >
                                <Save className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <h4 className="font-semibold text-gray-900">Xem Tất Cả CV</h4>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
