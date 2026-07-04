// web/components/ProtectedRoute.tsx
"use client";

import { useEffect, ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { LoadingComponent } from '@/contexts';
import { User } from '@/services/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireEmailVerification?: boolean;
  requiredRoles?: Array<'user' | 'admin' | 'super_admin'>;
  redirectTo?: string;
  fallback?: ReactNode;
  user?: User | null;
}

export function ProtectedRoute({
  children,
  requireEmailVerification = false,
  requiredRoles = [],
  redirectTo = '/login',
  fallback
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showWarning } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasCheckedToken, setHasCheckedToken] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('accessToken');
    
    // If no token and not loading, redirect immediately
    if (!token && !isLoading) {
      // eslint-disable-next-line
      setIsRedirecting(true);
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push(redirectTo);
      return;
    }

    setHasCheckedToken(true);
  }, [isLoading, pathname, redirectTo, router]);

  useEffect(() => {
    // Don't do anything while loading or if already redirecting
    if (isLoading || isRedirecting || !hasCheckedToken) return;

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      // eslint-disable-next-line
      setIsRedirecting(true);
      // Clear invalid token
      localStorage.removeItem('accessToken');
      sessionStorage.setItem('redirectAfterLogin', pathname);
      showWarning('Please log in to access this page.', 'Authentication Required');
      router.push(redirectTo);
      return;
    }

    // Check email verification if required
    if (requireEmailVerification && user && !user.isEmailVerified) {
      setIsRedirecting(true);
      showWarning('Please verify your email address to access this page.', 'Email Verification Required');
      router.push('/verify-email-pending');
      return;
    }

    // Check role requirements
    if (requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.includes(user.role);
      if (!hasRequiredRole) {
        setIsRedirecting(true);
        showWarning('You do not have permission to access this page.', 'Access Denied');
        router.push('/dashboard');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, redirectTo, requiredRoles, requireEmailVerification, showWarning, isRedirecting, hasCheckedToken]);

  // Show loading state or fallback
  if (isLoading || !hasCheckedToken) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingComponent loading={true} message="Loading..." variant="spinner"/>
      </div>
    );
  }

  // If redirecting, show loading
  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingComponent loading={true} message="Redirecting..." variant="spinner"/>
      </div>
    );
  }

  // If not authenticated or doesn't have required role, return null (redirect will happen)
  if (!isAuthenticated || !user) {
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