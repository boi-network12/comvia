// app/(auth)/accept-invite/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, ArrowRight, Users, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, login, register } = useAuth();
  
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"loading" | "success" | "error" | "requires-auth" | "new-user">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [inviteData, setInviteData] = useState<{
    inviterName?: string;
    companyName?: string;
    role?: string;
  }>({});

  // Form states for new user registration
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const acceptInvitation = async (token: string, email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/accept-invite`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.message || "Failed to accept invitation.");
        return;
      }

      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to accept invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const validateInvitation = async (token: string, email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/validate-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(data.message || "Invalid or expired invitation.");
        return;
      }

      setInviteData({
        inviterName: data.data?.inviterName || "Your team admin",
        companyName: data.data?.companyName || "Comvia",
        role: data.data?.role || "agent",
      });

      // Check if user already has an account
      if (isAuthenticated && user) {
        // User is already logged in, accept the invitation
        await acceptInvitation(token, email);
      } else {
        // Check if user exists (by email)
        const checkUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const userData = await checkUser.json();
        
        if (userData.exists) {
          setStatus("requires-auth");
        } else {
          setStatus("new-user");
        }
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to validate invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");
    
    if (!tokenParam || !emailParam) {
        // eslint-disable-next-line
      setStatus("error");
      setErrorMessage("Invalid invitation link. Please ask your team admin for a new invitation.");
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);

    // Validate the invitation token via API
    validateInvitation(tokenParam, emailParam);
  }, [searchParams]);

  

  
  const handleLoginAndAccept = async () => {
    // User needs to login first, then accept
    router.push(`/login?redirect=/accept-invite?token=${token}&email=${email}`);
  };

  const handleRegisterAndAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      // Register the user
      await register(name, email!, password);
      
      // After registration, accept the invitation
      await acceptInvitation(token!, email!);
    } catch (err: unknown) {
        const error = err as Error & { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="text-center space-y-6 py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-semibold">Validating your invitation...</h2>
        <p className="text-gray-500 dark:text-gray-400">Please wait while we verify your invitation.</p>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold">Invalid Invitation</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">{errorMessage}</p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all font-medium"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="w-20 h-20 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Welcome to the team! 🎉</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          You have successfully joined <strong>{inviteData.companyName}</strong> as a {inviteData.role}.
        </p>
        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    );
  }

  // User needs to login first
  if (status === "requires-auth") {
    return (
      <div className="space-y-8 py-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">You&apos;ve been invited!</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            <strong>{inviteData.inviterName}</strong> has invited you to join <strong>{inviteData.companyName}</strong> as a {inviteData.role}.
          </p>
          <p className="text-sm text-gray-500">
            You already have an account. Please login to accept the invitation.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleLoginAndAccept}
            className="px-8 py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium flex items-center justify-center gap-2"
          >
            Login to Accept
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/"
            className="px-8 py-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all font-medium text-center"
          >
            Cancel
          </Link>
        </div>
      </div>
    );
  }

  // New user registration
  return (
    <div className="space-y-8 py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20 mb-2">
          <Sparkles className="w-3 h-3" />
          Team Invitation
        </div>
        <h2 className="text-2xl font-bold">Join {inviteData.companyName}</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          <strong>{inviteData.inviterName}</strong> has invited you to join their team as a {inviteData.role}.
        </p>
        <p className="text-sm text-gray-500">Create your account to get started.</p>
      </div>

      {formError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleRegisterAndAccept} className="space-y-4 max-w-md mx-auto">
        <div>
          <label className="block text-sm font-medium mb-1.5">Full Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Email Address</label>
          <input
            type="email"
            value={email || ""}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            aria-label="email"
          />
          <p className="text-xs text-gray-500 mt-1">This email was used for the invitation.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Password *</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 pr-12 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground transition-colors"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 8 characters with uppercase, lowercase, number, and special character.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Confirm Password *</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Create Account & Accept Invitation
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-gray-500 mt-4">Loading...</p>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}