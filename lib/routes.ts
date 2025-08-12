import { UserRole } from '@/lib/types';

export interface RouteConfig {
  path: string;
  title: string;
  roles: UserRole[];
  permissions?: string[];
  component?: string;
  icon?: string;
  showInNav?: boolean;
  mobileOrder?: number;
}

export const routes: RouteConfig[] = [
  // Dashboard Routes
  {
    path: '/dashboard',
    title: 'Dashboard',
    roles: ['admin', 'owner', 'agent', 'tenant'],
    icon: 'Home',
    showInNav: true,
    mobileOrder: 1,
  },

  // Property Management Routes (Owners & Agents)
  {
    path: '/properties',
    title: 'Properties',
    roles: ['admin', 'owner', 'agent'],
    icon: 'Building2',
    showInNav: true,
    mobileOrder: 2,
  },
  {
    path: '/properties/new',
    title: 'Add Property',
    roles: ['admin', 'owner'],
    showInNav: false,
  },
  {
    path: '/properties/[id]',
    title: 'Property Details',
    roles: ['admin', 'owner', 'agent', 'tenant'],
    showInNav: false,
  },
  {
    path: '/properties/[id]/edit',
    title: 'Edit Property',
    roles: ['admin', 'owner'],
    showInNav: false,
  },

  // Unit Management
  {
    path: '/units',
    title: 'Units',
    roles: ['admin', 'owner', 'agent'],
    icon: 'Grid3x3',
    showInNav: true,
  },
  {
    path: '/units/[id]',
    title: 'Unit Details',
    roles: ['admin', 'owner', 'agent', 'tenant'],
    showInNav: false,
  },

  // Tenant Management
  {
    path: '/tenants',
    title: 'Tenants',
    roles: ['admin', 'owner', 'agent'],
    icon: 'Users',
    showInNav: true,
  },
  {
    path: '/tenants/new',
    title: 'Add Tenant',
    roles: ['admin', 'owner', 'agent'],
    showInNav: false,
  },
  {
    path: '/tenants/[id]',
    title: 'Tenant Details',
    roles: ['admin', 'owner', 'agent'],
    showInNav: false,
  },

  // Lease Management
  {
    path: '/leases',
    title: 'Leases',
    roles: ['admin', 'owner', 'agent'],
    icon: 'FileText',
    showInNav: true,
  },
  {
    path: '/leases/new',
    title: 'New Lease',
    roles: ['admin', 'owner', 'agent'],
    showInNav: false,
  },
  {
    path: '/leases/[id]',
    title: 'Lease Details',
    roles: ['admin', 'owner', 'agent', 'tenant'],
    showInNav: false,
  },

  // Maintenance Management
  {
    path: '/maintenance',
    title: 'Maintenance',
    roles: ['admin', 'owner', 'agent', 'tenant'],
    icon: 'Wrench',
    showInNav: true,
    mobileOrder: 3,
  },
  {
    path: '/maintenance/new',
    title: 'New Maintenance Request',
    roles: ['admin', 'owner', 'agent', 'tenant'],
    showInNav: false,
  },
  {
    path: '/maintenance/[id]',
    title: 'Maintenance Details',
    roles: ['admin', 'owner', 'agent', 'tenant'],
    showInNav: false,
  },

  // Financial Management
  {
    path: '/financials',
    title: 'Financials',
    roles: ['admin', 'owner'],
    icon: 'DollarSign',
    showInNav: true,
  },
  {
    path: '/financials/expenses',
    title: 'Expenses',
    roles: ['admin', 'owner'],
    showInNav: false,
  },
  {
    path: '/financials/payouts',
    title: 'Owner Payouts',
    roles: ['admin', 'owner'],
    showInNav: false,
  },
  {
    path: '/financials/reports',
    title: 'Financial Reports',
    roles: ['admin', 'owner'],
    showInNav: false,
  },

  // Inspections (Agents)
  {
    path: '/inspections',
    title: 'Inspections',
    roles: ['admin', 'agent'],
    icon: 'Camera',
    showInNav: true,
    mobileOrder: 5,
  },
  {
    path: '/inspections/new',
    title: 'New Inspection',
    roles: ['admin', 'agent'],
    showInNav: false,
  },
  {
    path: '/inspections/[id]',
    title: 'Inspection Details',
    roles: ['admin', 'owner', 'agent'],
    showInNav: false,
  },

  // Communications
  {
    path: '/messages',
    title: 'Messages',
    roles: ['admin', 'owner', 'agent', 'tenant'],
    icon: 'MessageCircle',
    showInNav: true,
    mobileOrder: 4,
  },
  {
    path: '/communications',
    title: 'Communications',
    roles: ['admin', 'owner', 'agent'],
    icon: 'Mail',
    showInNav: true,
  },

  // Documents
  {
    path: '/documents',
    title: 'Documents',
    roles: ['admin', 'owner', 'agent', 'tenant'],
    icon: 'FileText',
    showInNav: true,
  },

  // Analytics & Reports
  {
    path: '/analytics',
    title: 'Analytics',
    roles: ['admin', 'owner'],
    icon: 'BarChart3',
    showInNav: true,
  },
  {
    path: '/reports',
    title: 'Reports',
    roles: ['admin', 'owner'],
    icon: 'TrendingUp',
    showInNav: false,
  },

  // Admin Routes
  {
    path: '/admin',
    title: 'Admin Panel',
    roles: ['admin'],
    icon: 'Shield',
    showInNav: true,
  },
  {
    path: '/admin/users',
    title: 'User Management',
    roles: ['admin'],
    showInNav: false,
  },
  {
    path: '/admin/audit',
    title: 'Audit Logs',
    roles: ['admin'],
    showInNav: false,
  },
  {
    path: '/admin/seed',
    title: 'Database Seeding',
    roles: ['admin'],
    showInNav: false,
  },

  // Agent Mobile Routes
  {
    path: '/agent',
    title: 'Agent Dashboard',
    roles: ['agent'],
    icon: 'MapPin',
    showInNav: true,
  },
  {
    path: '/agent/checkin',
    title: 'Property Check-in',
    roles: ['agent'],
    showInNav: false,
  },
  {
    path: '/agent/tasks',
    title: 'My Tasks',
    roles: ['agent'],
    showInNav: false,
  },

  // Profile & Settings
  {
    path: '/profile',
    title: 'Profile',
    roles: ['admin', 'owner', 'agent', 'tenant'],
    icon: 'User',
    showInNav: true,
  },
  {
    path: '/settings',
    title: 'Settings',
    roles: ['admin', 'owner', 'agent', 'tenant'],
    icon: 'Settings',
    showInNav: false,
  },

  // Authentication Routes (No roles required)
  {
    path: '/login',
    title: 'Login',
    roles: [],
    showInNav: false,
  },
  {
    path: '/register',
    title: 'Register',
    roles: [],
    showInNav: false,
  },
  {
    path: '/account-disabled',
    title: 'Account Disabled',
    roles: [],
    showInNav: false,
  },
  {
    path: '/unauthorized',
    title: 'Unauthorized',
    roles: [],
    showInNav: false,
  },
];

// Helper functions
export function getRoutesForRole(role: UserRole): RouteConfig[] {
  return routes.filter(route => 
    route.roles.length === 0 || route.roles.includes(role)
  );
}

export function getNavigationRoutes(role: UserRole): RouteConfig[] {
  return routes.filter(route => 
    route.showInNav && (route.roles.length === 0 || route.roles.includes(role))
  ).sort((a, b) => (a.mobileOrder || 999) - (b.mobileOrder || 999));
}

export function getMobileNavigationRoutes(role: UserRole): RouteConfig[] {
  return getNavigationRoutes(role)
    .filter(route => route.mobileOrder)
    .sort((a, b) => (a.mobileOrder || 999) - (b.mobileOrder || 999));
}

export function getRouteByPath(path: string): RouteConfig | undefined {
  return routes.find(route => route.path === path);
}

export function isAuthorizedForRoute(route: RouteConfig, userRole: UserRole): boolean {
  return route.roles.length === 0 || route.roles.includes(userRole);
}

export function getRouteTitle(path: string): string {
  const route = getRouteByPath(path);
  return route?.title || 'MMG Properties';
}

// Role-specific dashboard redirects
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'agent':
      return '/agent';
    case 'owner':
    case 'tenant':
    default:
      return '/dashboard';
  }
}

// Get breadcrumb for nested routes
export function getBreadcrumb(path: string): { title: string; href: string }[] {
  const segments = path.split('/').filter(Boolean);
  const breadcrumb: { title: string; href: string }[] = [];
  
  let currentPath = '';
  segments.forEach(segment => {
    currentPath += `/${segment}`;
    const route = getRouteByPath(currentPath) || getRouteByPath(currentPath.replace(/\/[^\/]+$/, '/[id]'));
    if (route) {
      breadcrumb.push({
        title: route.title,
        href: currentPath,
      });
    }
  });
  
  return breadcrumb;
}