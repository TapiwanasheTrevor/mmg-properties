'use client';

import { useState } from 'react';
import AppSidebar from './app-sidebar';
import AppHeader from './app-header';
import ProtectedRoute from '@/components/auth/protected-route';
import { UserRole } from '@/lib/types';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  headerActions?: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
}

export default function AppLayout({
  children,
  title,
  headerActions,
  requiredRoles,
  requiredPermissions,
}: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute
      requiredRoles={requiredRoles}
      requiredPermissions={requiredPermissions}
    >
      <div className="h-screen flex bg-gray-50">
        {/* Sidebar */}
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AppHeader title={title} actions={headerActions} />

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}