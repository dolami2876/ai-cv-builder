"use client";

import { X, Check } from "lucide-react";

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl md:p-10">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Upgrade to Premium</h2>
                    <p className="mt-2 text-gray-600">Unlock full power of AI Resume Builder</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Free Plan */}
                    <div className="rounded-xl border border-gray-200 p-8">
                        <h3 className="text-xl font-semibold text-gray-900">Free</h3>
                        <p className="mt-2 text-gray-500">For trying out the editor</p>
                        <div className="my-6">
                            <span className="text-4xl font-bold text-gray-900">$0</span>
                            <span className="text-gray-500">/forever</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500" />
                                <span className="text-gray-600">Create 1 Resume</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500" />
                                <span className="text-gray-600">PDF Export</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500" />
                                <span className="text-gray-600">Basic AI Suggestions</span>
                            </li>
                        </ul>
                        <button
                            onClick={onClose}
                            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 font-semibold text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                        >
                            Continue Free
                        </button>
                    </div>

                    {/* Premium Plan */}
                    <div className="relative rounded-xl border-2 border-purple-600 bg-white p-8 shadow-lg">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-4 py-1 text-sm font-bold text-white uppercase tracking-wide">
                            Recommended
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Premium</h3>
                        <p className="mt-2 text-gray-500">For serious job seekers</p>
                        <div className="my-6">
                            <span className="text-4xl font-bold text-gray-900">99k</span>
                            <span className="text-gray-500">/one-time</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-purple-600" />
                                <span className="text-gray-900 font-medium">Unlimited Resumes</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-purple-600" />
                                <span className="text-gray-900 font-medium">Export to Word (DOCX)</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-purple-600" />
                                <span className="text-gray-900 font-medium">Advanced AI Writer</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-purple-600" />
                                <span className="text-gray-900 font-medium">ATS Score Checker</span>
                            </li>
                        </ul>

                        {/* Sepay QR Placeholder */}
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                            <img
                                src="https://qr.sepay.vn/img?bank=MBBank&acc=0000000000&template=compact&amount=99000&des=CVPREMIUM"
                                alt="Sepay QR"
                                className="mx-auto h-32 w-32 mb-2 mix-blend-multiply"
                            />
                            <p className="text-xs text-gray-500">Scan to pay with Sepay.vn</p>
                            <p className="text-xs text-gray-500">Content: CVPREMIUM [YOUR_ID]</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
