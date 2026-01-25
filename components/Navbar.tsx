"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const { isSignedIn } = useUser();

    // Hide navbar on editor page for more space, or keep it minimal
    if (pathname.startsWith("/editor")) return null;

    return (
        <nav className="border-b bg-white/80 px-6 py-4 backdrop-blur-sm sticky top-0 z-50">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900">
                    <span className="text-purple-600">✨</span> CV Boost
                </Link>

                <div className="flex items-center gap-4">
                    {isSignedIn ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <SignInButton mode="modal">
                                <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                    Sign In
                                </button>
                            </SignInButton>
                            <SignInButton mode="modal">
                                <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-all">
                                    Get Started
                                </button>
                            </SignInButton>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}