import { Suspense } from 'react';
import TemplateSelectorClient from './TemplateSelectorClient';

export const dynamic = "force-dynamic";

export default function TemplateSelectorPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
                    <div className="text-center text-gray-600 text-sm">
                        Đang tải trang chọn template...
                    </div>
                </div>
            }
        >
            <TemplateSelectorClient />
        </Suspense>
    );
}
