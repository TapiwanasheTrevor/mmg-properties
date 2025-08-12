import { Metadata } from 'next';
import AppLayout from '@/components/layout/app-layout';
import MessageCenter from '@/components/communication/message-center';

export const metadata: Metadata = {
  title: 'Messages - MMG Platform',
  description: 'Communicate with tenants, property owners, and service providers',
};

export default function MessagesPage() {
  return (
    <AppLayout 
      title="Messages" 
      requiredRoles={['admin', 'owner', 'agent', 'tenant']}
    >
      <MessageCenter />
    </AppLayout>
  );
}
