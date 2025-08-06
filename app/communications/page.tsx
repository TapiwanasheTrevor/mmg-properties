'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import EmailTemplateManager from '@/components/communications/email-template-manager';

export default function CommunicationsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  // Check if user has access to communications
  if (!['admin', 'agent'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage communications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <EmailTemplateManager />
    </div>
  );
}