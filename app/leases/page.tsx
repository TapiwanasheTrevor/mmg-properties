'use client';

import { ProtectedPage } from '@/components/auth/protected-page';
import LeaseList from '@/components/leases/lease-list';

export default function LeasesPage() {
  return (
    <ProtectedPage allowedRoles={['admin', 'agent', 'owner']}>
      <LeaseList />
    </ProtectedPage>
  );
}