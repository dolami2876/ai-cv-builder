import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Briefcase, FileText, Layout, Star, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar (Simple) */}
      <nav className="flex items-center justify-between border-b px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span>CV Boost</span>
        </Link>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>

          <Link
            href="/onboarding"
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center md:px-12 lg:py-32">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="mx-auto w-fit rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-100">
            CV Boost - Professional Resume Builder
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Build your professional resume with <span className="text-purple-600">CV Boost AI</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-500 md:text-xl">
            Create a standout CV in minutes. Our AI-powered tools help you discover your career path, generate professional content, and optimize your resume for your dream job.
          </p>
        </div>

        {/* Tools Grid */}
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
            title="CV Của Tôi"
            description="Xem tất cả CV của bạn và quản lý chúng từ một nơi"
            icon={<Briefcase className="h-8 w-8 text-indigo-600" />}
            href="/dashboard"
            color="indigo"
          />
        </div>

        {/* Features Preview */}
        <div id="features" className="mt-24 grid w-full max-w-5xl gap-8 sm:grid-cols-3 text-left">
          <FeatureCard
            title="AI Writing Assistant"
            description="Stuck on what to write? Let CV Boost generate professional summaries and work experience points instantly."
            icon={<Sparkles className="h-6 w-6 text-purple-600" />}
          />
          <FeatureCard
            title="Real-time Preview"
            description="See your changes instantly with our split-screen editor. No more guessing how it looks."
            icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
          />
          <FeatureCard
            title="ATS Friendly"
            description="Clean, professional templates designed to pass Applicant Tracking Systems and get you hired."
            icon={<CheckCircle2 className="h-6 w-6 text-blue-600" />}
          />
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} CV Boost. All rights reserved.
      </footer>
    </div>
  );
}

function ToolCard({ 
  title, 
  description, 
  icon, 
  href, 
  color 
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

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-gray-50 p-6 transition hover:shadow-md">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm border">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}