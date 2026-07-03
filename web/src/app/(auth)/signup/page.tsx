// app/(auth)/signup/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User } from "lucide-react";

// Type definitions for Cloudflare Turnstile
interface TurnstileInstance {
  remove: () => void;
  reset: () => void;
}

interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  theme: "light" | "dark";
  size: "normal" | "compact" | "invisible";
}

interface TurnstileAPI {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
}

declare global {
  interface Window {
    turnstile: TurnstileAPI;
  }
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCaptchaReady, setIsCaptchaReady] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const turnstileInstanceRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  // Render Turnstile when ready
  const renderTurnstile = () => {
    if (!captchaContainerRef.current || !window.turnstile) return;

    // Check if container already has a widget
    if (turnstileInstanceRef.current) {
      try {
        window.turnstile.remove(turnstileInstanceRef.current);
      } catch (error) {
        // Ignore removal errors
      }
      turnstileInstanceRef.current = null;
    }

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    
    if (!siteKey) {
      console.error("Turnstile site key is missing");
      return;
    }

    try {
      const widgetId = window.turnstile.render(captchaContainerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          setCaptchaToken(token);
          setCaptchaError(false);
        },
        "expired-callback": () => {
          setCaptchaToken(null);
          setCaptchaError(true);
        },
        "error-callback": () => {
          setCaptchaToken(null);
          setCaptchaError(true);
        },
        theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
        size: "normal",
      });
      turnstileInstanceRef.current = widgetId;
    } catch (error) {
      console.error("Failed to render Turnstile:", error);
    }
  };

  // Load Cloudflare Turnstile script
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="turnstile"]')) {
      scriptLoadedRef.current = true;
    //   eslint-disable-next-line
      setIsCaptchaReady(true);
      renderTurnstile();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      scriptLoadedRef.current = true;
      setIsCaptchaReady(true);
      renderTurnstile();
    };

    script.onerror = () => {
      console.error("Failed to load Cloudflare Turnstile");
    };

    document.head.appendChild(script);

    return () => {
      if (turnstileInstanceRef.current && window.turnstile) {
        try {
          window.turnstile.remove(turnstileInstanceRef.current);
        } catch (error) {
          // Ignore removal errors
        }
      }
      // Only remove script if we added it
      if (!scriptLoadedRef.current) {
        document.head.removeChild(script);
      }
    };
  }, []);

  

  // Re-render Turnstile on theme change
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (turnstileInstanceRef.current && window.turnstile) {
        try {
          window.turnstile.remove(turnstileInstanceRef.current);
          turnstileInstanceRef.current = null;
          renderTurnstile();
        } catch (error) {
          // Ignore errors during re-render
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!captchaToken) {
      setCaptchaError(true);
      return;
    }

    setIsLoading(true);
    setCaptchaError(false);
    
    try {
      // Add your signup logic here
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Handle successful signup (redirect, show message, etc.)
      console.log("Signup successful:", data);
      
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
      // Reset captcha after submission
      if (turnstileInstanceRef.current && window.turnstile) {
        try {
          window.turnstile.reset(turnstileInstanceRef.current);
          setCaptchaToken(null);
        } catch (error) {
          // Ignore reset errors
        }
      }
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Start your free 14-day trial today
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              required
              minLength={8}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Must be at least 8 characters
          </p>
        </div>

        {/* Cloudflare Turnstile Captcha */}
        <div className="pt-2">
          <div
            ref={captchaContainerRef}
            className="flex justify-center min-h-[65px]"
          />
          {!isCaptchaReady && (
            <div className="flex justify-center items-center min-h-[65px]">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          {isCaptchaReady && captchaError && !captchaToken && (
            <p className="text-xs text-red-500 text-center mt-1">
              Please complete the verification
            </p>
          )}
          {isCaptchaReady && captchaToken && (
            <p className="text-xs text-green-500 text-center mt-1">
              ✓ Verification complete
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !captchaToken}
          className="w-full py-3.5 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in instead
          </Link>
        </p>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social signup */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium">Google</span>
        </button>
        <button 
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="text-sm font-medium">GitHub</span>
        </button>
      </div>
    </>
  );
}