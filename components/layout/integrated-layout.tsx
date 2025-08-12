'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AppSidebar from './app-sidebar';
import MobileNav from './mobile-nav';
import ProtectedRoute from '@/components/auth/protected-route';
import { UserRole } from '@/lib/types';

interface IntegratedLayoutProps {
  children: ReactNode;
  title?: string;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  showNavigation?: boolean;
}

export default function IntegratedLayout({
  children,
  title,
  requiredRoles,
  requiredPermissions,
  showNavigation = true,
}: IntegratedLayoutProps) {
  const { user } = useAuth();

  // Don't show navigation for auth pages
  if (!showNavigation || !user) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles} requiredPermissions={requiredPermissions}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={requiredRoles} requiredPermissions={requiredPermissions}>
      <div className="h-screen flex bg-gray-50">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:flex">
          <AppSidebar collapsed={false} onToggle={() => {}} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header - Only show on mobile */}
          <div className="lg:hidden">
            <MobileNav />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 lg:px-6">
              {title && (
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                    {title}
                  </h1>
                </div>
              )}
              {children}
            </div>
          </main>

          {/* Mobile Bottom Navigation - Only show on mobile */}
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}