'use client';

import { ProtectedPage } from '@/components/auth/protected-page';
import MaintenanceList from '@/components/maintenance/maintenance-list';

export default function MaintenancePage() {
  return (
    <ProtectedPage allowedRoles={['admin', 'agent', 'owner', 'tenant']}>
      <MaintenanceList />
    </ProtectedPage>
  );
}