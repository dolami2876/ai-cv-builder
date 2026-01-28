import { Suspense } from 'react';
import CVGeneratorClient from './CVGeneratorClient';

export default function CVGeneratorPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                    <div className="text-center text-gray-600 text-sm">
                        Đang tải công cụ AI Sinh Nội Dung CV...
                    </div>
                </div>
            }
        >
            <CVGeneratorClient />
        </Suspense>
    );
}
