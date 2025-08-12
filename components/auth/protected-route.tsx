'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { canAccessRoute, routeRequiresMFA } from '@/lib/auth/permissions';
import { UserRole } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = false,
  redirectTo = '/login',
  fallbackComponent: FallbackComponent,
}: ProtectedRouteProps) {
  const { user, firebaseUser, loading, error, mfaRequired, permissionsLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading || !permissionsLoaded) return;

      // Not authenticated
      if (!firebaseUser || !user) {
        router.push(redirectTo);
        return;
      }

      // Check if user account is active
      if (!user.isActive) {
        router.push('/account-disabled');
        return;
      }

      // Check MFA requirement for current route
      if (routeRequiresMFA(pathname) && mfaRequired) {
        router.push('/auth/mfa-setup');
        return;
      }

      // Check if user needs to set up MFA based on role
      if (user.mfaSetupRequired && !user.mfaEnabled && pathname !== '/auth/mfa-setup') {
        router.push('/auth/mfa-setup');
        return;
      }

      // Check role-based access
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }

      // Check permission requirements
      if (requiredPermissions && requiredPermissions.length > 0) {
        if (requireAllPermissions) {
          const hasAllRequired = requiredPermissions.every(permission =>
            user.permissions.includes(permission)
          );
          if (!hasAllRequired) {
            router.push('/unauthorized');
            return;
          }
        } else {
          const hasAnyRequired = requiredPermissions.some(permission =>
            user.permissions.includes(permission)
          );
          if (!hasAnyRequired) {
            router.push('/unauthorized');
            return;
          }
        }
      }

      // Check route-specific access
      const routeAccess = canAccessRoute(pathname, user.role, requiredPermissions);
      if (!routeAccess) {
        router.push('/unauthorized');
        return;
      }

      setHasAccess(true);
      setAccessChecked(true);
    };

    checkAccess();
  }, [
    user,
    firebaseUser,
    loading,
    mfaRequired,
    permissionsLoaded,
    allowedRoles,
    requiredPermissions,
    requireAllPermissions,
    redirectTo,
    router,
    pathname,
  ]);

  // Show loading state
  if (loading || !permissionsLoaded || !accessChecked) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">There was an error loading your account: {error.message}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!firebaseUser || !user) {
    return null;
  }

  // Account disabled
  if (!user.isActive) {
    return null;
  }

  // MFA required
  if (routeRequiresMFA(pathname) && mfaRequired) {
    return null;
  }

  // Access denied
  if (!hasAccess) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    return null;
  }

  return <>{children}</>;
}

// Component for unauthorized access
export function UnauthorizedAccess() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// Component for MFA setup requirement
export function MFASetupRequired() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Multi-Factor Authentication Required
        </h1>
        <p className="text-gray-600 mb-6">
          Your role requires multi-factor authentication for enhanced security. Please set up MFA to continue.
        </p>
        <button
          onClick={() => router.push('/auth/mfa-setup')}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        >
          Set Up MFA
        </button>
      </div>
    </div>
  );
}