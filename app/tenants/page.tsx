'use client';

import { ProtectedPage } from '@/components/auth/protected-page';
import TenantList from '@/components/tenants/tenant-list';

export default function TenantsPage() {
  return (
    <ProtectedPage allowedRoles={['admin', 'agent', 'owner']}>
      <TenantList />
    </ProtectedPage>
  );
}