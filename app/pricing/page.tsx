import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import PricingPlans from "@/components/pricing/PricingPlans";

export default async function PricingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Sparkles className="h-5 w-5 text-purple-600" />
            CV Boost
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            Chọn gói phù hợp với bạn
          </h1>
          <p className="mt-3 text-gray-600">
            Xem quyền lợi từng gói, sau đó chọn gói để hiện mã QR thanh toán.
          </p>
        </div>

        <PricingPlans userId={userId} />
      </main>
    </div>
  );
}
