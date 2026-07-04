// web/components/PublicRoute.tsx
"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingComponent } from '@/contexts';

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
        <div className="flex items-center justify-center min-h-screen">
          <LoadingComponent loading={isLoading} message="Loading data..." variant="spinner"/>
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