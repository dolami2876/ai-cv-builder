"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const [showQR, setShowQR] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
            <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Upgrade to Pro 🚀</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Free Plan */}
                    <div className="rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-500">Free Plan</h3>
                        <div className="mt-4 text-3xl font-bold text-gray-900">$0<span className="text-base font-normal text-gray-500">/mo</span></div>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-center gap-3 text-gray-600">
                                <Check className="h-5 w-5 text-green-500" /> 1 Resume
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <Check className="h-5 w-5 text-green-500" /> PDF Export (Watermarked)
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <Check className="h-5 w-5 text-green-500" /> Basic Templates
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <X className="h-5 w-5" /> Word (DOCX) Export
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <X className="h-5 w-5" /> Unlimited AI Writer
                            </li>
                        </ul>
                        <button onClick={onClose} className="mt-8 w-full rounded-lg border border-gray-200 py-2.5 font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                            Current Plan
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative rounded-xl border border-purple-200 bg-purple-50 p-6 ring-2 ring-purple-500">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white shadow-sm">
                            RECOMMENDED
                        </div>
                        <h3 className="text-lg font-semibold text-purple-900">Pro Plan</h3>
                        <div className="mt-4 text-3xl font-bold text-gray-900">$9<span className="text-base font-normal text-gray-500">/mo</span></div>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-center gap-3 text-gray-900 font-medium">
                                <Check className="h-5 w-5 text-purple-600" /> Unlimited Resumes
                            </li>
                            <li className="flex items-center gap-3 text-gray-900 font-medium">
                                <Check className="h-5 w-5 text-purple-600" /> PDF + DOCX Export
                            </li>
                            <li className="flex items-center gap-3 text-gray-900 font-medium">
                                <Check className="h-5 w-5 text-purple-600" /> Premium Templates
                            </li>
                            <li className="flex items-center gap-3 text-gray-900 font-medium">
                                <Check className="h-5 w-5 text-purple-600" /> Unlimited AI Writer
                            </li>
                            <li className="flex items-center gap-3 text-gray-900 font-medium">
                                <Check className="h-5 w-5 text-purple-600" /> Priority Support
                            </li>
                        </ul>
                        <button
                            onClick={() => setShowQR(true)}
                            className="mt-8 w-full rounded-lg bg-purple-600 py-2.5 font-semibold text-white shadow-md hover:bg-purple-700 transition-all hover:scale-[1.02]"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>

                {showQR && <PaymentQR onClose={() => { setShowQR(false); onClose(); }} />}

                <p className="mt-6 text-center text-xs text-gray-400">
                    Secure payment via Sepay. Scan QR code to upgrade instantly.
                </p>
            </div>
        </div>
    );
}

function PaymentQR({ onClose }: { onClose: () => void }) {
    // Demo QR link - Replace with your dynamic Sepay link logic
    // Format: https://qr.sepay.vn/img?bank=[BANK]&acc=[ACC]&template=[TEMPLATE]&amount=[AMOUNT]&des=[CONTENT]
    const qrUrl = "https://qr.sepay.vn/img?bank=MBBank&acc=0000000000&template=compact&amount=200000&des=CVBOOST UPGRADE";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Scan to Pay</h3>
                <p className="text-sm text-gray-500 mb-6">Open your banking app and scan this QR code.</p>

                <div className="mx-auto w-64 h-64 bg-gray-100 rounded-lg overflow-hidden mb-6 border-2 border-purple-100">
                    {/* In production, use next/image */}
                    <img src={qrUrl} alt="Sepay QR Code" className="w-full h-full object-cover" />
                </div>

                <div className="text-sm font-medium text-purple-700 bg-purple-50 py-2 px-4 rounded-lg mb-6 mx-auto inline-block">
                    Amount: 200,000 VND
                </div>

                <button onClick={onClose} className="w-full rounded-lg bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800">
                    I have paid
                </button>
            </div>
        </div>
    );
}
