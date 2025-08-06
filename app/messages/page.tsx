'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import MessageCenter from '@/components/communication/message-center';

export default function MessagesPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <MessageCenter />
    </div>
  );
}
