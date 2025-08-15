'use client';

import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/app-layout';
import UnitsList from '@/components/units/units-list';

export default function UnitsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppLayout title="Units Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading units...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout title="Units Management">
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Access Denied
          </h2>
          <p className="text-gray-600 mt-2">
            You need to be logged in to access this page.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Units Management" 
      requiredRoles={['admin', 'owner', 'agent']}
    >
      <UnitsList />
    </AppLayout>
  );
}