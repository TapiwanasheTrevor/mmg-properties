'use client';

import { useAuth } from '@/hooks/useAuth';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import LeaseEditForm from '@/components/leases/lease-edit-form';

export default function LeaseEditPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const leaseId = params.id as string;

  if (loading) {
    return (
      <AppLayout title="Edit Lease">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading lease...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout title="Edit Lease">
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
      title="Edit Lease" 
      requiredRoles={['admin', 'owner', 'agent']}
    >
      <LeaseEditForm leaseId={leaseId} />
    </AppLayout>
  );
}