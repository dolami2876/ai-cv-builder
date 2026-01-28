'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Layout, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const templates = [
    {
        id: 'modern',
        name: 'Modern',
        description: 'Thiết kế hiện đại, phù hợp với ngành công nghệ và sáng tạo',
        color: 'from-blue-500 to-purple-600',
        preview: 'bg-gradient-to-br from-blue-500 to-purple-600',
    },
    {
        id: 'classic',
        name: 'Classic',
        description: 'Thiết kế cổ điển, chuyên nghiệp, phù hợp với ngành tài chính và pháp luật',
        color: 'from-gray-700 to-gray-900',
        preview: 'bg-gradient-to-br from-gray-700 to-gray-900',
    },
    {
        id: 'sidebar',
        name: 'Sidebar',
        description: 'Bố cục thanh bên trái nổi bật, giống mẫu CV hiện đại',
        color: 'from-slate-900 to-slate-700',
        preview: 'bg-gradient-to-br from-slate-900 to-slate-700',
    },
];

export default function TemplateSelectorClient() {
    const { isSignedIn } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const resumeId = searchParams.get('resumeId');

    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCreateResume = async () => {
        if (!isSignedIn) {
            router.push('/sign-in');
            return;
        }

        if (!selectedTemplate) {
            alert('Vui lòng chọn template');
            return;
        }

        setLoading(true);
        try {
            const layout =
                selectedTemplate === 'classic' ? 'classic' :
                selectedTemplate === 'sidebar' ? 'sidebar' :
                'modern';

            // Nếu đã có resumeId (từ AI Sinh Nội Dung CV) -> chỉ cập nhật style
            if (resumeId) {
                const res = await fetch(`/api/resumes/${resumeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        style: {
                            hexColor: '#000000',
                            font: 'inter',
                            layout,
                        },
                    }),
                });

                if (!res.ok) throw new Error('Failed to update resume');

                router.push(`/editor/${resumeId}`);
                return;
            }

            // Fallback: không có resumeId thì tạo resume trống như trước
            const res = await fetch('/api/resumes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'My Resume',
                    experienceLevel: 'Experienced',
                    jobGoal: 'Full-time',
                    style: {
                        hexColor: '#000000',
                        font: 'inter',
                        layout,
                    },
                }),
            });

            if (!res.ok) throw new Error('Failed to create resume');

            const data = await res.json();
            router.push(`/editor/${data._id}`);
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <Layout className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Chọn Template & Tạo CV
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Chọn template chuyên nghiệp và bắt đầu tạo CV của bạn
                    </p>
                </div>

                {/* Templates Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`relative cursor-pointer rounded-2xl border-2 transition-all ${
                                selectedTemplate === template.id
                                    ? 'border-green-500 shadow-xl scale-105'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                            }`}
                        >
                            {selectedTemplate === template.id && (
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="bg-green-500 text-white rounded-full p-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                </div>
                            )}

                            {/* Preview */}
                            <div className={`h-48 ${template.preview} rounded-t-2xl`} />

                            {/* Info */}
                            <div className="bg-white p-6 rounded-b-2xl">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h3>
                                <p className="text-gray-600">{template.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center bg-white rounded-xl p-8 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Sẵn sàng tạo CV?</h3>
                    <p className="text-gray-600 mb-6">
                        {selectedTemplate
                            ? `Bạn đã chọn template ${templates.find(t => t.id === selectedTemplate)?.name}. Hãy bấm "Tạo CV Ngay" để tiếp tục!`
                            : 'Chọn một template để bắt đầu'}
                    </p>
                    <button
                        onClick={handleCreateResume}
                        disabled={!selectedTemplate || loading || !isSignedIn}
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                        {loading ? (
                            <>
                                <Sparkles className="h-5 w-5 animate-pulse" />
                                Đang tạo...
                            </>
                        ) : (
                            <>
                                Tạo CV Ngay <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>

                    {!isSignedIn && (
                        <p className="text-sm text-gray-500 mt-4">
                            <Link href="/sign-in" className="text-green-600 hover:underline">
                                Đăng nhập
                            </Link> để tạo CV
                        </p>
                    )}
                </div>

                {/* Alternative: Use existing resume */}
                <div className="mt-8 text-center">
                    <Link
                        href="/dashboard"
                        className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                        Hoặc xem CV đã tạo của bạn →
                    </Link>
                </div>
            </div>
        </div>
    );
}

