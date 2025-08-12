'use client';

import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/app-layout';
import ReportsDashboard from '@/components/reports/reports-dashboard';

export default function ReportsPage() {
  return (
    <AppLayout 
      title="Reports & Analytics" 
      requiredRoles={['admin', 'owner', 'agent', 'tenant']}
    >
      <ReportsDashboard />
    </AppLayout>
  );
}