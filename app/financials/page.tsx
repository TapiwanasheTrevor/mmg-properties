'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import ComprehensiveFinancialDashboard from '@/components/financials/comprehensive-financial-dashboard';

export default function FinancialsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect('/login');
  }

  // Enhanced role-based access control for financials
  const hasFinancialAccess = ['admin', 'owner', 'agent'].includes(user.role);
  
  if (!hasFinancialAccess) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access financial information. This section is restricted to 
              administrators, property owners, and agents only.
            </p>
            <p className="text-sm text-gray-500">
              Contact your system administrator if you believe you should have access to this section.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Role-based feature access
  const userPermissions = {
    canViewAllProperties: user.role === 'admin',
    canProcessTransactions: ['admin', 'agent'].includes(user.role),
    canReconcile: user.role === 'admin',
    canViewReports: true,
    canManageBudgets: ['admin', 'owner'].includes(user.role),
    canExportData: ['admin', 'owner'].includes(user.role),
  };

  return (
    <AppLayout
      title="Financial Management"
      requiredRoles={['admin', 'owner', 'agent']}
      headerActions={
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600">
            Role: <span className="capitalize font-medium">{user.role}</span>
          </div>
        </div>
      }
    >
      <ComprehensiveFinancialDashboard
        userRole={user.role}
        permissions={userPermissions}
        userId={user.uid}
      />
    </AppLayout>
  );
}