'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import PaymentForm from '@/components/financials/payments/payment-form';

export default function NewPaymentPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppLayout title="Record Payment">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    redirect('/login');
  }

  // Check permissions
  const canCreatePayments = ['admin', 'agent'].includes(user.role);
  
  if (!canCreatePayments) {
    return (
      <AppLayout title="Record Payment">
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
              You don't have permission to record payments. This action is restricted to 
              administrators and agents only.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Record Payment"
      requiredRoles={['admin', 'agent']}
    >
      <PaymentForm
        onSuccess={(paymentId) => {
          // Redirect to payment details or back to list
          window.location.href = `/financials/payments/${paymentId}`;
        }}
        onCancel={() => {
          window.location.href = '/financials/payments';
        }}
      />
    </AppLayout>
  );
}