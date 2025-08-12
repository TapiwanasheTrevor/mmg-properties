'use client';

import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/app-layout';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import OwnerDashboard from '@/components/dashboard/owner-dashboard';
import AgentDashboard from '@/components/dashboard/agent-dashboard';
import TenantDashboard from '@/components/dashboard/tenant-dashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // Debug logging
  console.log('Dashboard Page - Loading:', loading);
  console.log('Dashboard Page - User:', user);

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getDashboardComponent = () => {
    if (!user) {
      console.log('No user found, returning null');
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            No user data
          </h2>
          <p className="text-gray-600 mt-2">
            User authentication data not available. Please refresh the page.
          </p>
        </div>
      );
    }

    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'owner':
        return <OwnerDashboard />;
      case 'agent':
        return <AgentDashboard />;
      case 'tenant':
        return <TenantDashboard />;
      default:
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Dashboard not available
            </h2>
            <p className="text-gray-600 mt-2">
              Your user role does not have a dashboard configured.
            </p>
          </div>
        );
    }
  };

  return (
    <AppLayout title="Dashboard">
      {getDashboardComponent()}
    </AppLayout>
  );
}