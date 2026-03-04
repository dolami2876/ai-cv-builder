import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, Sparkles, Briefcase, FileText, Layout, Star, Brain } from "lucide-react";
import connectDB from "@/lib/db";
import User from "@/models/User";

export default async function Home() {
  const { userId } = await auth();

  let credits = 0;
  let currentPlan = "FREE";

  if (userId) {
    await connectDB();
    const dbUser = await User.findOne({ clerkId: userId }).lean();

    credits = dbUser?.credits ?? 0;

    const latestStatus = dbUser?.paymentHistory?.[dbUser.paymentHistory.length - 1]?.status;
    if (typeof latestStatus === "string" && latestStatus.startsWith("success:")) {
      currentPlan = latestStatus.replace("success:", "").toUpperCase();
    } else if (dbUser?.isPremium) {
      currentPlan = "PROFESSIONAL";
    }
  }

  const isUpgraded = currentPlan !== "FREE";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <nav className="flex items-center justify-between border-b px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span>CV Boost</span>
        </Link>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>

            <div className="hidden sm:flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs">
              <span className="font-medium text-gray-700">Plan: {currentPlan}</span>
              <span className="text-gray-500">|</span>
              <span className="font-medium text-gray-700">Credits: {credits}</span>
            </div>

            {!isUpgraded && (
              <Link
                href="/pricing"
                className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
              >
                Upgrade PRO
              </Link>
            )}

            <UserButton />
          </SignedIn>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center md:px-12 lg:py-32">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="mx-auto w-fit rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-100">
            CV Boost - Professional Resume Builder
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Build your professional resume with <span className="text-purple-600">CV Boost AI</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-500 md:text-xl">
            Create a standout CV in minutes. Our AI-powered tools help you discover your career path, generate professional
            content, and optimize your resume for your dream job.
          </p>
        </div>

        <div id="tools" className="mt-24 grid w-full max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard
            title="AI Gợi ý Ngành Nghề"
            description="Xác định ngành nghề và vị trí phù hợp dựa trên kỹ năng, học vấn và sở thích của bạn"
            icon={<Brain className="h-8 w-8 text-blue-600" />}
            href="/tools/career-suggestion"
            color="blue"
          />
          <ToolCard
            title="AI Sinh Nội Dung CV"
            description="Tự động viết nội dung CV chuyên nghiệp, rõ ràng và tối ưu cho ATS"
            icon={<FileText className="h-8 w-8 text-purple-600" />}
            href="/tools/cv-generator"
            color="purple"
          />
          <ToolCard
            title="Chọn Template & Tạo CV"
            description="Chọn template chuyên nghiệp và tạo CV hoàn chỉnh với nội dung của bạn"
            icon={<Layout className="h-8 w-8 text-green-600" />}
            href="/tools/template-selector"
            color="green"
          />
          <ToolCard
            title="AI Đánh Giá & Tối Ưu CV"
            description="Nhận đánh giá chi tiết và gợi ý cải thiện CV theo tiêu chuẩn nhà tuyển dụng"
            icon={<Star className="h-8 w-8 text-yellow-600" />}
            href="/tools/cv-reviewer"
            color="yellow"
          />
          <ToolCard
            title="Việc làm gợi ý"
            description="Vào trang Jobs để chọn nhu cầu, hệ thống sẽ tìm việc phù hợp theo CV của bạn"
            icon={<Briefcase className="h-8 w-8 text-emerald-600" />}
            href="/jobs"
            color="green"
          />
          <ToolCard
            title="CV Của Tôi"
            description="Xem tất cả CV của bạn và quản lý chúng từ một nơi"
            icon={<Briefcase className="h-8 w-8 text-indigo-600" />}
            href="/dashboard"
            color="indigo"
          />
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">© {new Date().getFullYear()} CV Boost. All rights reserved.</footer>
    </div>
  );
}

function ToolCard({
  title,
  description,
  icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    purple: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    green: "bg-green-50 border-green-200 hover:bg-green-100",
    yellow: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    orange: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    indigo: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
  };

  return (
    <Link
      href={href}
      className={`group rounded-xl border-2 p-6 transition-all hover:shadow-lg ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-white shadow-sm border-2 border-gray-200 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900">
        Bắt đầu <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
