'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import DocumentManager from '@/components/documents/document-manager';

export default function DocumentsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <DocumentManager />
    </div>
  );
}
