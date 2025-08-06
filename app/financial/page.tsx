'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import FinancialDashboard from '@/components/financial/financial-dashboard';

export default function FinancialPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  // Check if user has access to financial features
  if (!['admin', 'owner', 'agent'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view financial information.</p>
        </div>
      </div>
    );
  }

  return <FinancialDashboard />;
}
