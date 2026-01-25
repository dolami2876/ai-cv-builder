import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar (Simple) */}
      <nav className="flex items-center justify-between border-b px-6 py-4 md:px-12">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span>CV Boost</span>
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
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
            Create a standout CV in minutes. Our AI helps you write professional descriptions, fix grammar, and optimize for your dream job.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="flex items-center gap-2 rounded-full bg-purple-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-purple-700 hover:shadow-xl"
            >
              Start Building Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-3 text-lg font-medium text-gray-700 transition hover:bg-gray-50"
            >
              View Features
            </Link>
          </div>
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