// app/(auth)/setup/layout.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts";
import { useToast } from "@/contexts/ToastContext";
import { User } from "@/services/auth";

const steps = [
  { id: "product", label: "Choose Product", path: "/setup" },
  { id: "widget", label: "Widget Setup", path: "/setup/widget" },
  { id: "branding", label: "Brand Customization", path: "/setup/branding" },
  { id: "team", label: "Team Setup", path: "/setup/team" },
  { id: "integrations", label: "Integrations", path: "/setup/integrations" },
  { id: "complete", label: "Complete", path: "/setup/complete" },
];

// Define the order of steps for validation
const stepOrder = steps.map(s => s.id);

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { showWarning } = useToast();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const currentStepIndex = steps.findIndex((step) => step.path === pathname);
  const currentStep = steps[currentStepIndex] || steps[0];

  // Get the current step ID from the path
  const currentStepId = steps.find(s => s.path === pathname)?.id || null;

  /**
   * Check if user has completed all previous steps
   */
  const getCompletedSteps = (userData: User | null): string[] => {
    const completed: string[] = [];
    
    if (!userData) return completed;

    // Product step - check if user has selected a product
    if (userData.products && userData.products.length > 0) {
      completed.push('product');
    }

    // Widget step - check if widget position is set
    if (userData.widgetSettings?.position) {
      completed.push('widget');
    }

    // Branding step - check if company name is set
    if (userData.companyName) {
      completed.push('branding');
    }

    // Team step - check if team members exist
    if (userData.teamMembers && userData.teamMembers.length > 0) {
      completed.push('team');
    }

    // Integrations step - check if any integrations are configured
    if (userData.integrations) {
      const hasEnabledIntegration = Object.values(userData.integrations).some(
        (integration) => integration?.enabled === true
      );
      if (hasEnabledIntegration) {
        completed.push('integrations');
      }
    }
    
    return completed;
  };

  /**
   * Check if user can access a specific step
   */
  const canAccessStep = (stepId: string, userData: User | null): boolean => {
    if (!userData) return false;
    
    // If setup is already completed, redirect to dashboard
    if (userData.setupCompleted) {
      return false;
    }

    const completedSteps = getCompletedSteps(userData);
    const stepIndex = stepOrder.indexOf(stepId);
    
    // For the first step, always allow access
    if (stepIndex === 0) return true;
    
    // For the complete step, check if all required steps are done
    if (stepId === 'complete') {
      // Check if all steps except 'complete' are completed
      // 'integrations' is optional
      const requiredSteps = ['product', 'widget', 'branding', 'team'];
      return requiredSteps.every(step => completedSteps.includes(step));
    }
    
    // Check if all previous steps are completed
    const previousSteps = stepOrder.slice(0, stepIndex);
    return previousSteps.every(step => completedSteps.includes(step));
  };

  /**
   * Get the next incomplete step
   */
  const getNextIncompleteStep = (userData: User | null): string | null => {
    if (!userData) return null;
    
    const completedSteps = getCompletedSteps(userData);
    
    // Check each required step in order (skip integrations as it's optional)
    const requiredSteps = ['product', 'widget', 'branding', 'team'];
    
    for (const step of requiredSteps) {
      if (!completedSteps.includes(step)) {
        return step;
      }
    }
    
    // If all required steps are complete, go to complete
    return 'complete';
  };

  /**
   * Authorization check - runs when user or path changes
   */
  useEffect(() => {
    // Don't check if still loading
    if (isLoading) {
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      showWarning('Please log in to access setup.', 'Authentication Required');
      router.push('/login');
      // eslint-disable-next-line
      setIsAuthorized(false);
      return;
    }

    // If setup is already completed, redirect to dashboard
    if (user.setupCompleted) {
      showWarning('Setup is already completed.', 'Redirecting to Dashboard');
      router.push('/dashboard');
      setIsAuthorized(false);
      return;
    }

    // Check if user can access this specific step
    if (currentStepId) {
      const hasAccess = canAccessStep(currentStepId, user);
      
      if (!hasAccess) {
        // Find the next incomplete step
        const nextStep = getNextIncompleteStep(user);
        
        if (nextStep) {
          const nextStepPath = steps.find(s => s.id === nextStep)?.path;
          if (nextStepPath) {
            setIsRedirecting(true);
            showWarning(
              'Please complete the previous steps first.',
              'Redirecting...'
            );
            router.push(nextStepPath);
            setTimeout(() => setIsRedirecting(false), 1000);
            return;
          }
        }
      }
    }

    setIsAuthorized(true);
  }, [user, isLoading, isAuthenticated, pathname, router, currentStepId, showWarning]);

  /**
   * Loading state
   */
  if (isLoading || isAuthorized === null || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isRedirecting ? 'Redirecting...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // If not authorized, don't render anything (redirect will happen)
  if (!isAuthorized) {
    return null;
  }

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
            {/* Step indicators with clickable navigation */}
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                // Check if this step is accessible
                const isAccessible = user ? canAccessStep(step.id, user) : false;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (isAccessible && step.path !== pathname) {
                        router.push(step.path);
                      }
                    }}
                    disabled={!isAccessible || step.path === pathname}
                    className={`
                      text-xs transition-all flex items-center gap-1
                      ${isCompleted ? "text-primary cursor-pointer hover:underline" : ""}
                      ${isCurrent ? "text-primary font-bold" : ""}
                      ${!isCompleted && !isCurrent ? "text-gray-400 dark:text-gray-600" : ""}
                      ${!isAccessible && !isCompleted && !isCurrent ? "opacity-50 cursor-not-allowed" : ""}
                      ${isAccessible && !isCurrent ? "hover:text-primary cursor-pointer" : ""}
                    `}
                    title={!isAccessible ? "Complete previous steps first" : ""}
                  >
                    {index + 1}
                    {isCompleted && (
                      <span className="text-green-500">✓</span>
                    )}
                  </button>
                );
              })}
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