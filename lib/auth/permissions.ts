// Permission and route access control for MMG Platform

import { UserRole } from '@/lib/types';

// Check if user can access a specific route
export function canAccessRoute(
  route: string,
  userRole: UserRole,
  requiredPermissions?: string[]
): boolean {
  // Admin can access everything
  if (userRole === 'admin') return true;

  // Route-specific access control
  const routeAccess: Record<string, UserRole[]> = {
    '/dashboard': ['admin', 'owner', 'agent', 'tenant'],
    '/properties': ['admin', 'owner', 'agent'],
    '/tenants': ['admin', 'owner', 'agent'],
    '/leases': ['admin', 'owner', 'tenant'],
    '/maintenance': ['admin', 'owner', 'agent', 'tenant'],
    '/financials': ['admin', 'owner'],
    '/analytics': ['admin', 'owner'],
    '/reports': ['admin', 'owner'],
    '/inspections': ['admin', 'agent'],
    '/admin': ['admin'],
    '/agent': ['admin', 'agent'],
    '/profile': ['admin', 'owner', 'agent', 'tenant'],
    '/settings': ['admin', 'owner', 'agent', 'tenant'],
  };

  const allowedRoles = routeAccess[route];
  if (!allowedRoles) return true; // Allow access to unspecified routes
  
  return allowedRoles.includes(userRole);
}

// Check if route requires MFA (Multi-Factor Authentication)
export function routeRequiresMFA(route: string): boolean {
  const mfaRoutes = [
    '/admin',
    '/financials',
    '/analytics/sensitive',
  ];
  
  return mfaRoutes.some(mfaRoute => route.startsWith(mfaRoute));
}

// Get user permissions based on role
export function getUserPermissions(role: UserRole): string[] {
  const rolePermissions: Record<UserRole, string[]> = {
    admin: [
      'read:all',
      'write:all',
      'delete:all',
      'manage:users',
      'manage:properties',
      'manage:financials',
      'manage:system',
    ],
    owner: [
      'read:properties',
      'write:properties',
      'read:tenants',
      'write:tenants',
      'read:financials',
      'read:maintenance',
      'write:maintenance',
    ],
    agent: [
      'read:properties',
      'read:tenants',
      'read:maintenance',
      'write:maintenance',
      'read:inspections',
      'write:inspections',
    ],
    tenant: [
      'read:lease',
      'read:maintenance',
      'write:maintenance',
      'read:payments',
    ],
  };

  return rolePermissions[role] || [];
}

// Check if user has specific permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const userPermissions = getUserPermissions(userRole);
  
  // Admin has all permissions
  if (userRole === 'admin') return true;
  
  // Check for exact permission match
  if (userPermissions.includes(permission)) return true;
  
  // Check for wildcard permissions (e.g., 'read:all' includes 'read:properties')
  const [action, resource] = permission.split(':');
  if (userPermissions.includes(`${action}:all`)) return true;
  
  return false;
}