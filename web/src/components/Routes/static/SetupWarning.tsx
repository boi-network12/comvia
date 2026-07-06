// components/SetupWarning.tsx
"use client";

import { AlertTriangle, Settings, X, Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";

export function SetupWarning() {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't show if user is not logged in, setup is complete, or dismissed
  if (!user) return null;
  if (isDismissed) return null;

  // Check if email is not verified
  const isEmailUnverified = !user.isEmailVerified;
  
  // Check if setup is incomplete (not just email verification)
  const isSetupIncomplete = !user.setupCompleted;

  // If everything is complete and email is verified, don't show anything
  if (!isSetupIncomplete && !isEmailUnverified) return null;

  // Determine the message based on what's missing
  let message = "";
  let icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />;
  let bgColor = "bg-amber-50 dark:bg-amber-950/30";
  let borderColor = "border-amber-200 dark:border-amber-800/50";

  if (isEmailUnverified && isSetupIncomplete) {
    message = "Please verify your email and complete your account setup to start using all features.";
  } else if (isEmailUnverified) {
    message = "Please verify your email address to start using all features.";
    icon = <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />;
    bgColor = "bg-blue-50 dark:bg-blue-950/30";
    borderColor = "border-blue-200 dark:border-blue-800/50";
  } else if (isSetupIncomplete) {
    message = "Complete your account setup to start using all features.";
  }

  return (
    <div className={`relative ${bgColor} border-b ${borderColor}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          {/* Left side - Icon and Message */}
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-0.5 sm:mt-0">
              {icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 break-words">
                {isEmailUnverified && (
                  <span className="font-medium inline-block sm:inline">
                    {isSetupIncomplete ? "Setup incomplete! " : "Email not verified! "}
                  </span>
                )}
                {!isEmailUnverified && isSetupIncomplete && (
                  <span className="font-medium inline-block sm:inline">Setup incomplete! </span>
                )}
                <span className="inline">
                  {message}
                </span>
              </p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-start sm:self-center mt-1 sm:mt-0">
            {/* Email Verification Button */}
            {isEmailUnverified && (
              <Link
                href="/resend-verification"
                className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Verify Email</span>
                <span className="xs:hidden">Verify</span>
              </Link>
            )}

            {/* Setup Completion Button */}
            {isSetupIncomplete && (
              <Link
                href="/setup"
                className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Complete Setup</span>
                <span className="xs:hidden">Setup</span>
              </Link>
            )}

            {/* Dismiss Button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors flex-shrink-0"
              aria-label="Dismiss setup warning"
            >
              <X className={`w-4 h-4 sm:w-5 sm:h-5 ${
                isEmailUnverified 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-amber-600 dark:text-amber-400"
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}