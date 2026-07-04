// web/components/PublicRoute.tsx
"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  children: ReactNode;
  redirectAuthenticatedTo?: string;
  requireGuest?: boolean;
}

export function PublicRoute({
  children,
  redirectAuthenticatedTo = '/dashboard',
  requireGuest = true,
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // If user is authenticated and we require guests only, redirect
    if (requireGuest && isAuthenticated) {
      router.push(redirectAuthenticatedTo);
      return;
    }
  }, [isAuthenticated, isLoading, router, redirectAuthenticatedTo, requireGuest]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and we require guests, return null (redirect will happen)
  if (requireGuest && isAuthenticated) {
    return null;
  }

  // Render children if all checks pass
  return <>{children}</>;
}