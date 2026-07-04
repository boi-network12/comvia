// web/components/ProtectedRoute.tsx
"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireEmailVerification?: boolean;
  requiredRoles?: Array<'user' | 'admin' | 'super_admin'>;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireEmailVerification = false,
  requiredRoles = [],
  redirectTo = '/login',
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showWarning } = useToast();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save the attempted URL for redirect after login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      showWarning('Please log in to access this page.', 'Authentication Required');
      router.push(redirectTo);
      return;
    }

    // Check email verification if required
    if (requireEmailVerification && user && !user.isEmailVerified) {
      showWarning('Please verify your email address to access this page.', 'Email Verification Required');
      router.push('/verify-email-pending');
      return;
    }

    // Check role requirements
    if (requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.includes(user.role);
      if (!hasRequiredRole) {
        showWarning('You do not have permission to access this page.', 'Access Denied');
        router.push('/dashboard');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, redirectTo, requiredRoles, requireEmailVerification, showWarning]);

  // Show loading state or fallback
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or doesn't have required role, return null (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  if (requireEmailVerification && user && !user.isEmailVerified) {
    return null;
  }

  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      return null;
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
}