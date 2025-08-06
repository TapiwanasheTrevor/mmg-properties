'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { canAccessRoute, routeRequiresMFA } from '@/lib/auth/permissions';
import { validateUserSession, logAuditEvent } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Lock, User } from 'lucide-react';

interface EnhancedRouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  requireMFA?: boolean;
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
  enableAuditLogging?: boolean;
}

export default function EnhancedRouteGuard({
  children,
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = false,
  requireMFA = false,
  redirectTo = '/login',
  fallbackComponent: FallbackComponent,
  enableAuditLogging = true,
}: EnhancedRouteGuardProps) {
  const { user, firebaseUser, loading, error, mfaRequired, permissionsLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [accessState, setAccessState] = useState<{
    checked: boolean;
    hasAccess: boolean;
    reason?: string;
    requiresAction?: 'mfa' | 'activation' | 'login';
  }>({
    checked: false,
    hasAccess: false,
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (loading || !permissionsLoaded) return;

      try {
        // Enhanced session validation
        const sessionValidation = await validateUserSession();
        
        if (!sessionValidation.isValid) {
          const reason = sessionValidation.errors.join(', ');
          
          if (sessionValidation.requiresMFA) {
            setAccessState({
              checked: true,
              hasAccess: false,
              reason: 'Multi-factor authentication required',
              requiresAction: 'mfa',
            });
            return;
          }
          
          if (!firebaseUser) {
            setAccessState({
              checked: true,
              hasAccess: false,
              reason: 'Authentication required',
              requiresAction: 'login',
            });
            return;
          }
          
          if (sessionValidation.user && !sessionValidation.user.isActive) {
            setAccessState({
              checked: true,
              hasAccess: false,
              reason: 'Account is disabled',
              requiresAction: 'activation',
            });
            return;
          }
          
          setAccessState({
            checked: true,
            hasAccess: false,
            reason,
          });
          return;
        }

        const currentUser = sessionValidation.user!;

        // Check role-based access
        if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
          setAccessState({
            checked: true,
            hasAccess: false,
            reason: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${currentUser.role}`,
          });
          
          // Log unauthorized access attempt
          if (enableAuditLogging) {
            await logAuditEvent({
              action: 'unauthorized_access_attempt',
              targetUserId: currentUser.id,
              performedBy: currentUser.id,
              details: {
                path: pathname,
                requiredRoles: allowedRoles,
                userRole: currentUser.role,
                reason: 'insufficient_role',
              },
              timestamp: new Date(),
            });
          }
          return;
        }

        // Check permission requirements
        if (requiredPermissions && requiredPermissions.length > 0) {
          const userPermissions = currentUser.permissions || [];
          
          let hasRequiredPermissions = false;
          if (requireAllPermissions) {
            hasRequiredPermissions = requiredPermissions.every(permission =>
              userPermissions.includes(permission)
            );
          } else {
            hasRequiredPermissions = requiredPermissions.some(permission =>
              userPermissions.includes(permission)
            );
          }

          if (!hasRequiredPermissions) {
            setAccessState({
              checked: true,
              hasAccess: false,
              reason: `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
            });
            
            // Log unauthorized access attempt
            if (enableAuditLogging) {
              await logAuditEvent({
                action: 'unauthorized_access_attempt',
                targetUserId: currentUser.id,
                performedBy: currentUser.id,
                details: {
                  path: pathname,
                  requiredPermissions,
                  userPermissions,
                  requireAllPermissions,
                  reason: 'insufficient_permissions',
                },
                timestamp: new Date(),
              });
            }
            return;
          }
        }

        // Check MFA requirements
        const routeMFARequired = routeRequiresMFA(pathname) || requireMFA;
        if (routeMFARequired && (mfaRequired || !currentUser.mfaEnabled)) {
          setAccessState({
            checked: true,
            hasAccess: false,
            reason: 'Multi-factor authentication required for this resource',
            requiresAction: 'mfa',
          });
          return;
        }

        // Check route-specific access
        const canAccess = await canAccessRoute(pathname);
        if (!canAccess) {
          setAccessState({
            checked: true,
            hasAccess: false,
            reason: 'Access denied for this route',
          });
          
          // Log unauthorized access attempt
          if (enableAuditLogging) {
            await logAuditEvent({
              action: 'unauthorized_access_attempt',
              targetUserId: currentUser.id,
              performedBy: currentUser.id,
              details: {
                path: pathname,
                reason: 'route_access_denied',
              },
              timestamp: new Date(),
            });
          }
          return;
        }

        // Access granted
        setAccessState({
          checked: true,
          hasAccess: true,
        });

        // Log successful access
        if (enableAuditLogging) {
          await logAuditEvent({
            action: 'route_access_granted',
            targetUserId: currentUser.id,
            performedBy: currentUser.id,
            details: {
              path: pathname,
              userRole: currentUser.role,
              userPermissions: currentUser.permissions,
            },
            timestamp: new Date(),
          });
        }

      } catch (error) {
        console.error('Error checking route access:', error);
        setAccessState({
          checked: true,
          hasAccess: false,
          reason: 'Access validation failed',
        });
      }
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
    requireMFA,
    pathname,
    enableAuditLogging,
  ]);

  // Show loading state
  if (loading || !permissionsLoaded || !accessState.checked) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
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
  if (error && !accessState.hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
            <CardDescription>
              There was an error with your authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle specific access denial reasons
  if (!accessState.hasAccess) {
    if (accessState.requiresAction === 'login') {
      router.push(redirectTo);
      return null;
    }

    if (accessState.requiresAction === 'mfa') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle className="text-yellow-600">MFA Required</CardTitle>
              <CardDescription>
                Multi-factor authentication is required to access this resource
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your role requires additional security verification
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push('/auth/mfa-setup')}
                className="w-full"
              >
                Set Up MFA
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (accessState.requiresAction === 'activation') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <CardTitle className="text-gray-600">Account Disabled</CardTitle>
              <CardDescription>
                Your account has been disabled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Please contact your administrator to reactivate your account
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push('/account-disabled')}
                className="w-full"
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Generic access denied
    if (FallbackComponent) {
      return <FallbackComponent />;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this resource
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{accessState.reason}</AlertDescription>
            </Alert>
            
            {user && (
              <div className="bg-gray-50 rounded p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Your Role:</span>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
                {allowedRoles && (
                  <div className="flex justify-between text-sm">
                    <span>Required Roles:</span>
                    <div className="flex gap-1">
                      {allowedRoles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {requiredPermissions && (
                  <div className="text-sm">
                    <span>Required Permissions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {requiredPermissions.map(permission => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                Go Back
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access granted - render children
  return <>{children}</>;
}