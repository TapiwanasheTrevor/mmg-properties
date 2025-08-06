import React from 'react';
import { UserRole } from '../types';
import { getUserRole, hasPermission, hasRole, hasAnyRole, hasAllPermissions } from '../auth';

// Route access configuration
export interface RouteConfig {
  path: string;
  roles?: UserRole[];
  permissions?: string[];
  requiresAll?: boolean; // If true, user must have ALL permissions, otherwise ANY
  requiresMFA?: boolean;
}

// Define route access rules
export const ROUTE_ACCESS: RouteConfig[] = [
  // Admin routes
  {
    path: '/admin',
    roles: ['admin'],
    requiresMFA: true,
  },
  {
    path: '/admin/audit',
    roles: ['admin'],
    permissions: ['audit_logs'],
    requiresMFA: true,
  },
  {
    path: '/admin/users',
    roles: ['admin'],
    permissions: ['manage_users'],
    requiresMFA: true,
  },
  
  // Owner routes
  {
    path: '/dashboard',
    roles: ['admin', 'owner', 'agent', 'tenant'],
  },
  {
    path: '/properties',
    roles: ['admin', 'owner', 'agent'],
    permissions: ['view_all_properties', 'manage_properties'],
  },
  {
    path: '/properties/new',
    roles: ['admin', 'owner'],
    permissions: ['create_property'],
  },
  {
    path: '/financial',
    roles: ['admin', 'owner'],
    permissions: ['view_financials'],
    requiresMFA: true,
  },
  {
    path: '/financial/reports',
    roles: ['admin', 'owner'],
    permissions: ['generate_reports'],
    requiresMFA: true,
  },
  
  // Agent routes
  {
    path: '/maintenance',
    roles: ['admin', 'owner', 'agent'],
    permissions: ['manage_requests', 'view_all_requests'],
  },
  {
    path: '/tenants',
    roles: ['admin', 'owner', 'agent'],
    permissions: ['manage_tenants', 'view_tenant_data'],
  },
  {
    path: '/leases',
    roles: ['admin', 'owner', 'agent'],
    permissions: ['manage_leases'],
  },
  
  // Tenant routes
  {
    path: '/profile',
    roles: ['admin', 'owner', 'agent', 'tenant'],
  },
  {
    path: '/messages',
    roles: ['admin', 'owner', 'agent', 'tenant'],
  },
];

// Check if user can access a route
export const canAccessRoute = async (path: string): Promise<boolean> => {
  try {
    const routeConfig = ROUTE_ACCESS.find(route => 
      path.startsWith(route.path) || path === route.path
    );
    
    if (!routeConfig) {
      // No specific rules, allow access
      return true;
    }
    
    // Check role requirements
    if (routeConfig.roles && routeConfig.roles.length > 0) {
      const hasRequiredRole = await hasAnyRole(routeConfig.roles);
      if (!hasRequiredRole) {
        return false;
      }
    }
    
    // Check permission requirements
    if (routeConfig.permissions && routeConfig.permissions.length > 0) {
      if (routeConfig.requiresAll) {
        const hasAllRequired = await hasAllPermissions(routeConfig.permissions);
        if (!hasAllRequired) {
          return false;
        }
      } else {
        // Check if user has any of the required permissions
        const hasAnyPermission = await Promise.all(
          routeConfig.permissions.map(permission => hasPermission(permission))
        );
        if (!hasAnyPermission.some(Boolean)) {
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking route access:', error);
    return false;
  }
};

// Get accessible routes for current user
export const getAccessibleRoutes = async (): Promise<string[]> => {
  const accessibleRoutes: string[] = [];
  
  for (const routeConfig of ROUTE_ACCESS) {
    const canAccess = await canAccessRoute(routeConfig.path);
    if (canAccess) {
      accessibleRoutes.push(routeConfig.path);
    }
  }
  
  return accessibleRoutes;
};

// Check if route requires MFA
export const routeRequiresMFA = (path: string): boolean => {
  const routeConfig = ROUTE_ACCESS.find(route => 
    path.startsWith(route.path) || path === route.path
  );
  
  return routeConfig?.requiresMFA === true;
};

// Permission checking utilities for components
export class PermissionChecker {
  private static instance: PermissionChecker;
  private userRole: UserRole | null = null;
  private userPermissions: string[] = [];
  
  private constructor() {}
  
  public static getInstance(): PermissionChecker {
    if (!PermissionChecker.instance) {
      PermissionChecker.instance = new PermissionChecker();
    }
    return PermissionChecker.instance;
  }
  
  public async initialize(): Promise<void> {
    try {
      this.userRole = await getUserRole();
      // Get permissions from user claims or profile
      const permissions = await this.getUserPermissions();
      this.userPermissions = permissions;
    } catch (error) {
      console.error('Error initializing permission checker:', error);
      this.userRole = null;
      this.userPermissions = [];
    }
  }
  
  private async getUserPermissions(): Promise<string[]> {
    try {
      // Try to get from custom claims first
      const hasPermissionChecks = await Promise.all([
        hasPermission('read'),
        hasPermission('write'),
        hasPermission('delete'),
        hasPermission('approve'),
        hasPermission('manage_users'),
        hasPermission('manage_properties'),
        hasPermission('manage_requests'),
        hasPermission('manage_tenants'),
        hasPermission('view_financials'),
        hasPermission('generate_reports'),
        hasPermission('manage_leases'),
        hasPermission('view_lease'),
        hasPermission('system_admin'),
        hasPermission('audit_logs'),
      ]);
      
      const allPermissions = [
        'read', 'write', 'delete', 'approve', 'manage_users', 'manage_properties',
        'manage_requests', 'manage_tenants', 'view_financials', 'generate_reports',
        'manage_leases', 'view_lease', 'system_admin', 'audit_logs'
      ];
      
      return allPermissions.filter((_, index) => hasPermissionChecks[index]);
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }
  
  public can(permission: string): boolean {
    return this.userPermissions.includes(permission);
  }
  
  public canAny(permissions: string[]): boolean {
    return permissions.some(permission => this.userPermissions.includes(permission));
  }
  
  public canAll(permissions: string[]): boolean {
    return permissions.every(permission => this.userPermissions.includes(permission));
  }
  
  public hasRole(role: UserRole): boolean {
    return this.userRole === role;
  }
  
  public hasAnyRole(roles: UserRole[]): boolean {
    return this.userRole ? roles.includes(this.userRole) : false;
  }
  
  public isAdmin(): boolean {
    return this.userRole === 'admin';
  }
  
  public isOwner(): boolean {
    return this.userRole === 'owner';
  }
  
  public isAgent(): boolean {
    return this.userRole === 'agent';
  }
  
  public isTenant(): boolean {
    return this.userRole === 'tenant';
  }
  
  public canManageUsers(): boolean {
    return this.can('manage_users');
  }
  
  public canManageProperties(): boolean {
    return this.can('manage_properties');
  }
  
  public canViewFinancials(): boolean {
    return this.can('view_financials');
  }
  
  public canGenerateReports(): boolean {
    return this.can('generate_reports');
  }
  
  public canManageRequests(): boolean {
    return this.can('manage_requests');
  }
  
  public canManageTenants(): boolean {
    return this.can('manage_tenants');
  }
  
  public canManageLeases(): boolean {
    return this.can('manage_leases');
  }
  
  public canViewAuditLogs(): boolean {
    return this.can('audit_logs');
  }
}

// Singleton instance
export const permissionChecker = PermissionChecker.getInstance();

// Higher-order component for permission-based rendering
export const withPermissions = (
  permissions: string[],
  requireAll: boolean = false
) => {
  return (WrappedComponent: React.ComponentType<any>) => {
    return function PermissionWrapper(props: any) {
      const [hasAccess, setHasAccess] = React.useState<boolean>(false);
      const [loading, setLoading] = React.useState<boolean>(true);
      
      React.useEffect(() => {
        const checkPermissions = async () => {
          try {
            let access = false;
            if (requireAll) {
              access = await hasAllPermissions(permissions);
            } else {
              const checks = await Promise.all(
                permissions.map(permission => hasPermission(permission))
              );
              access = checks.some(Boolean);
            }
            setHasAccess(access);
          } catch (error) {
            console.error('Error checking permissions:', error);
            setHasAccess(false);
          } finally {
            setLoading(false);
          }
        };
        
        checkPermissions();
      }, []);
      
      if (loading) {
        return <div>Loading...</div>;
      }
      
      if (!hasAccess) {
        return <div>Access denied. Insufficient permissions.</div>;
      }
      
      return <WrappedComponent {...props} />;
    };
  };
};

// Higher-order component for role-based rendering
export const withRoles = (allowedRoles: UserRole[]) => {
  return (WrappedComponent: React.ComponentType<any>) => {
    return function RoleWrapper(props: any) {
      const [hasAccess, setHasAccess] = React.useState<boolean>(false);
      const [loading, setLoading] = React.useState<boolean>(true);
      
      React.useEffect(() => {
        const checkRole = async () => {
          try {
            const access = await hasAnyRole(allowedRoles);
            setHasAccess(access);
          } catch (error) {
            console.error('Error checking role:', error);
            setHasAccess(false);
          } finally {
            setLoading(false);
          }
        };
        
        checkRole();
      }, []);
      
      if (loading) {
        return <div>Loading...</div>;
      }
      
      if (!hasAccess) {
        return <div>Access denied. Insufficient role permissions.</div>;
      }
      
      return <WrappedComponent {...props} />;
    };
  };
};