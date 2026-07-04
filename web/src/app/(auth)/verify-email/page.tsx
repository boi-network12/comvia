// web/app/(auth)/verify-email/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail, isLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
        // eslint-disable-next-line 
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const handleVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage("Email verified successfully!");
        setTimeout(() => router.push("/dashboard"), 2000);
      } catch (error: unknown) {
        const err = error as Error & { response?: { data?: { message?: string } } };
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. Please try again.");
      }
    };

    handleVerification();
  }, [searchParams, verifyEmail, router]);

  if (status === "loading") {
    return (
      <div className="text-center space-y-4 py-8">
        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
        <h2 className="text-xl font-semibold">Verifying your email...</h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your account.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4 py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-xl font-semibold">Email Verified!</h2>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4 py-8">
      <XCircle className="w-16 h-16 text-red-500 mx-auto" />
      <h2 className="text-xl font-semibold">Verification Failed</h2>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
      <button
        onClick={() => router.push("/resend-verification")}
        className="mt-4 px-6 py-2 gradient-primary text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
      >
        Resend Verification Email
      </button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}