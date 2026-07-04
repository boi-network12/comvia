// web/app/(auth)/verify-email-pending/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Mail, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPendingPage() {
  const { user, resendVerification, isLoading } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResend = async () => {
    if (!user?.email) return;
    setMessage("");
    setError("");
    try {
      await resendVerification(user.email);
      setMessage("Verification email sent! Please check your inbox.");
    } catch (error: unknown) {
      const err = error as Error & { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to resend verification email.");
    }
  };

  return (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
        <Mail className="w-10 h-10 text-white" />
      </div>

      <div>
        <h1 className="text-3xl font-bold">Verify your email</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          We&apos;ve sent a verification link to
          <br />
          <span className="font-medium text-foreground">{user?.email}</span>
        </p>
      </div>

      <div className="max-w-sm mx-auto space-y-4">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/20 text-sm text-blue-600 dark:text-blue-400">
          <p>Click the link in the email to verify your account. If you don&apos;t see it, check your spam folder.</p>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={isLoading}
          className="w-full py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Resend verification email
            </>
          )}
        </button>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-foreground transition-colors"
        >
          Back to login
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}