// app/(auth)/setup/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";

const steps = [
  { id: "product", label: "Choose Product", path: "/setup" },
  { id: "widget", label: "Widget Setup", path: "/setup/widget" },
  { id: "branding", label: "Brand Customization", path: "/setup/branding" },
  { id: "team", label: "Team Setup", path: "/setup/team" },
  { id: "integrations", label: "Integrations", path: "/setup/integrations" },
  { id: "complete", label: "Complete", path: "/setup/complete" },
];

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStepIndex = steps.findIndex((step) => step.path === pathname);
  const currentStep = steps[currentStepIndex] || steps[0];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Comvia</span>
          </Link>
          
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-foreground transition-colors"
          >
            Skip to Dashboard →
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentStep.label}
            </span>
          </div>
          <div className="relative">
            <div className="overflow-hidden h-2 flex rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="h-full rounded-full gradient-primary transition-all duration-500"
                style={{
                  width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
            {/* Step indicators */}
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`text-xs ${
                    index <= currentStepIndex
                      ? "text-primary"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-background rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}