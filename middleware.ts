import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routes, isAuthorizedForRoute } from '@/lib/routes';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/properties',
  '/tenants',
  '/leases',
  '/maintenance',
  '/financials',
  '/inspections',
  '/messages',
  '/communications',
  '/documents',
  '/analytics',
  '/reports',
  '/admin',
  '/agent',
  '/profile',
  '/settings',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/terms',
  '/privacy',
  '/contact',
  '/about',
];

// Admin-only routes
const adminRoutes = [
  '/admin',
  '/admin/users',
  '/admin/audit',
  '/admin/seed',
];

// Agent-only routes
const agentRoutes = [
  '/agent',
  '/inspections',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Simplified middleware - let client-side handle auth
  // Only redirect root to login for now
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow all other routes to pass through
  // Client-side auth will handle redirects
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};