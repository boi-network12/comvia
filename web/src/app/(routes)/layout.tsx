// app/(routes)/layout.tsx
"use client";

import { DashboardSidebar } from "@/components/Routes/static/DashboardSidebar";
import { SetupWarning } from "@/components/Routes/static/SetupWarning";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "../_components/ProtectedRoute";
import { LoadingComponent } from "@/contexts";
import { useEffect } from "react";

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Log authentication state for debugging
  useEffect(() => {
    console.log('RoutesLayout - Auth State:', { 
      isAuthenticated, 
      hasUser: !!user, 
      hasToken: !!localStorage.getItem('accessToken'),
      pathname,
      isLoading 
    });
  }, [isAuthenticated, user, pathname, isLoading]);

 
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingComponent loading={true} message="Loading..." variant="spinner" />
      </div>
    );
  }


  // Check if user is authenticated - if not, redirect will happen in ProtectedRoute
  if (!isAuthenticated || !user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingComponent loading={true} message="Redirecting to login..." variant="spinner" />
        </div>
      </ProtectedRoute>
    );
  }

  // For protected routes, wrap with ProtectedRoute
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-50/50 dark:bg-gray-900/20">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          <SetupWarning />
          <main className="flex-1 py-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}