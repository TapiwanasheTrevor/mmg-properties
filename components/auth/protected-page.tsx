'use client';

import { ReactNode } from 'react';
import { UserRole } from '@/lib/types';
import EnhancedRouteGuard from './enhanced-route-guard';

interface ProtectedPageProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  requireMFA?: boolean;
  className?: string;
}

export function ProtectedPage({
  children,
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = false,
  requireMFA = false,
  className,
}: ProtectedPageProps) {
  return (
    <EnhancedRouteGuard
      allowedRoles={allowedRoles}
      requiredPermissions={requiredPermissions}
      requireAllPermissions={requireAllPermissions}
      requireMFA={requireMFA}
    >
      <div className={className}>
        {children}
      </div>
    </EnhancedRouteGuard>
  );
}

export default ProtectedPage;