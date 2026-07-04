// components/SetupWarning.tsx
"use client";

import { AlertTriangle, Settings, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useState } from "react";

export function SetupWarning() {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!user || user.setupCompleted || isDismissed) {
    return null;
  }

  return (
    <div className="relative bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <span className="font-medium">Setup incomplete!</span>
              {" "}Complete your account setup to start using all features.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Complete Setup
            </Link>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors"
              aria-label="Dismiss setup warning"
            >
              <X className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}