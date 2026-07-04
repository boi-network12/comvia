// app/(auth)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Only show branding on login and signup
  const isLogin = pathname === "/login";
  const isSignup = pathname === "/signup";

  const showBranding = isLogin || isSignup;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (Only visible on login & signup) */}
      {showBranding && (
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-primary/10 to-background dark:from-primary/10 dark:via-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="max-w-md text-center space-y-6">
              {/* Decorative circles */}
              <div className="absolute top-20 right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

              {/* Main content */}
              <div className="relative">
                <div className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold mt-6">
                  {isLogin ? "Welcome back!" : "Join the community"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {isLogin
                    ? "Sign in to access your dashboard and manage your support."
                    : "Create your account and start transforming your customer support."}
                </p>

                {/* Features list */}
                <div className="mt-8 space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Real-time live chat with AI assistance
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Customizable widget matching your brand
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Analytics and performance tracking
                    </span>
                  </div>
                </div>

                {/* Social proof */}
                <div className="mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex -space-x-2">
                      {["SJ", "MC", "ER"].map((initials, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium text-primary"
                        >
                          {initials}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Trusted by <span className="font-semibold text-foreground">2,000+</span> companies
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Side - Form/Content */}
      <div className={`flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 bg-background 
        ${!showBranding ? 'max-w-4xl mx-auto' : ''}`}
      >
        <div className={`w-full ${!showBranding ? 'max-w-4xl' : 'max-w-md'} mx-auto`}>
          {/* Logo */}
          {showBranding && (
            <Link href="/" className="flex items-center gap-2.5 group mb-8">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Comvia</span>
            </Link>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}