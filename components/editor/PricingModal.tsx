"use client";

import { X, Check } from "lucide-react";
import { PLAN_CONFIGS, PlanCode, buildPaymentContent } from "@/lib/payment/plans";

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    clerkId?: string;
}

const PLAN_ORDER: PlanCode[] = ["FREE", "STARTER", "PROFESSIONAL"];

function formatVnd(amount: number) {
    return new Intl.NumberFormat("vi-VN").format(amount);
}

export default function PricingModal({ isOpen, onClose, clerkId }: PricingModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl md:p-10">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Bảng giá Credits</h2>
                    <p className="mt-2 text-gray-600">Chọn gói phù hợp để nhận credits sử dụng AI</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {PLAN_ORDER.map((code) => {
                        const plan = PLAN_CONFIGS[code];
                        const description = clerkId ? buildPaymentContent(plan.code, clerkId) : "Đăng nhập để tạo mã thanh toán";
                        const bankCode = process.env.NEXT_PUBLIC_SEPAY_BANK_CODE || "MBBank";
                        const bankAccount = process.env.NEXT_PUBLIC_SEPAY_BANK_ACCOUNT || "";
                        const qrUrl = `https://qr.sepay.vn/img?bank=${bankCode}&acc=${bankAccount}&template=compact&amount=${plan.amountVnd}&des=${encodeURIComponent(description)}`;

                        return (
                            <div
                                key={plan.code}
                                className={`rounded-xl p-6 ${
                                    plan.code === "PROFESSIONAL"
                                        ? "border-2 border-purple-600 bg-white shadow-lg"
                                        : "border border-gray-200 bg-white"
                                }`}
                            >
                                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                <div className="my-4">
                                    <span className="text-3xl font-bold text-gray-900">{formatVnd(plan.amountVnd)} VND</span>
                                </div>

                                <ul className="mb-6 space-y-3">
                                    <li className="flex items-center gap-2 text-sm text-gray-700">
                                        <Check className="h-4 w-4 text-green-600" />
                                        {plan.credits} Credits
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-gray-700">
                                        <Check className="h-4 w-4 text-green-600" />
                                        Kích hoạt tự động qua webhook
                                    </li>
                                </ul>

                                {plan.amountVnd === 0 ? (
                                    <button
                                        onClick={onClose}
                                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 font-semibold text-gray-900 hover:bg-gray-50"
                                    >
                                        Tiếp tục miễn phí
                                    </button>
                                ) : (
                                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                                        <img
                                            src={qrUrl}
                                            alt={`Sepay QR ${plan.code}`}
                                            className="mx-auto mb-2 h-28 w-28 mix-blend-multiply"
                                        />
                                        <p className="text-[11px] text-gray-500">Nội dung CK: {description}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
