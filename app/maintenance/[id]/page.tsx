'use client';

import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import MaintenanceDetails from '@/components/maintenance/maintenance-details';

export default function MaintenanceDetailPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const maintenanceId = params.id as string;

  if (loading) {
    return (
      <AppLayout title="Maintenance Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading maintenance request...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout title="Maintenance Details">
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
      title="Maintenance Details" 
      requiredRoles={['admin', 'owner', 'agent']}
    >
      <MaintenanceDetails maintenanceId={maintenanceId} />
    </AppLayout>
  );
}