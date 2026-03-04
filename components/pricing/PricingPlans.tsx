"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { PLAN_CONFIGS, PlanCode, buildPaymentContent } from "@/lib/payment/plans";

const PLAN_ORDER: PlanCode[] = ["FREE", "STARTER", "PROFESSIONAL"];

const PLAN_FEATURES: Record<PlanCode, string[]> = {
  FREE: [
    "50 credits để trải nghiệm",
    "Tạo và chỉnh sửa CV cơ bản",
    "Xuất PDF",
    "Dùng thử các công cụ AI ở mức cơ bản",
  ],
  STARTER: [
    "150 credits cho nhu cầu ứng tuyển thường xuyên",
    "Ưu tiên tốc độ xử lý AI",
    "Gợi ý cải thiện CV chuyên sâu hơn",
    "Phù hợp sinh viên, fresher, junior",
  ],
  PROFESSIONAL: [
    "450 credits cho nhu cầu cao",
    "Tối ưu CV nâng cao theo JD",
    "Đánh giá & cải thiện ATS chuyên sâu",
    "Phù hợp ứng tuyển liên tục và đa vị trí",
  ],
};

function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

const BANK_CODE = "MBBank";
const BANK_ACCOUNT = "0000000000";

export default function PricingPlans({ userId }: { userId: string | null }) {
  const [selectedPlan, setSelectedPlan] = useState<PlanCode | null>(null);

  const qrUrl = useMemo(() => {
    if (!selectedPlan) return null;

    const plan = PLAN_CONFIGS[selectedPlan];
    if (plan.amountVnd === 0) return null;

    const paymentContent = userId
      ? buildPaymentContent(plan.code, userId)
      : `CVPLAN_${plan.code}_user_xxx`;

    return {
      image: `https://qr.sepay.vn/img?bank=${BANK_CODE}&acc=${BANK_ACCOUNT}&template=compact&amount=${plan.amountVnd}&des=${encodeURIComponent(paymentContent)}`,
      content: paymentContent,
      plan,
    };
  }, [selectedPlan, userId]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        {PLAN_ORDER.map((planCode) => {
          const plan = PLAN_CONFIGS[planCode];
          const isSelected = selectedPlan === planCode;

          return (
            <div
              key={plan.code}
              className={`rounded-2xl bg-white p-6 shadow-sm ring-1 transition ${
                isSelected
                  ? "ring-2 ring-purple-500 shadow-md"
                  : plan.code === "PROFESSIONAL"
                    ? "ring-purple-300"
                    : "ring-gray-200"
              }`}
            >
              {plan.code === "PROFESSIONAL" && (
                <div className="mb-4 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  Recommended
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <p className="mt-3 text-3xl font-extrabold text-gray-900">{formatVnd(plan.amountVnd)} VND</p>

              <ul className="mt-5 space-y-3 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  {plan.credits} Credits
                </li>
                {PLAN_FEATURES[plan.code].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan.code)}
                className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  isSelected
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                {plan.amountVnd === 0 ? "Chọn gói FREE" : `Chọn ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <div className="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          {selectedPlan === "FREE" ? (
            <>
              <h3 className="text-lg font-bold text-gray-900">Bạn đã chọn FREE Plan</h3>
              <p className="mt-2 text-sm text-gray-600">Gói FREE không cần thanh toán, bạn có thể bắt đầu dùng ngay.</p>
            </>
          ) : qrUrl ? (
            <>
              <h3 className="text-lg font-bold text-gray-900">Mã QR thanh toán {qrUrl.plan.name}</h3>
              <p className="mt-2 text-sm text-gray-600">Quét mã để thanh toán, hệ thống sẽ tự cộng credits.</p>

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <img
                  src={qrUrl.image}
                  alt={`QR thanh toán ${qrUrl.plan.name}`}
                  className="mx-auto mb-3 h-44 w-44 mix-blend-multiply"
                />
                <p className="text-xs text-gray-600">Nội dung chuyển khoản:</p>
                <p className="mt-1 break-all rounded bg-white px-2 py-1 text-xs font-semibold text-gray-800">
                  {qrUrl.content}
                </p>
              </div>
            </>
          ) : null}
        </div>
      )}

      {!userId && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Bạn chưa đăng nhập. Hãy đăng nhập để hệ thống tạo đúng nội dung chuyển khoản theo user của bạn,
          tránh cộng nhầm credits.
        </div>
      )}
    </>
  );
}
