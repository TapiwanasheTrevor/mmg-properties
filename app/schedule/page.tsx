import { Metadata } from 'next';
import AppLayout from '@/components/layout/app-layout';
import ScheduleDashboard from '@/components/schedule/schedule-dashboard';

export const metadata: Metadata = {
  title: 'Schedule & Calendar - MMG Platform',
  description: 'Manage property schedules, maintenance appointments, inspections, and tenant meetings',
};

// Force dynamic rendering to prevent Firebase access during static generation
export const dynamic = 'force-dynamic';

export default function SchedulePage() {
  return (
    <AppLayout 
      title="Schedule & Calendar" 
      requiredRoles={['admin', 'owner', 'agent', 'tenant']}
    >
      <ScheduleDashboard />
    </AppLayout>
  );
}