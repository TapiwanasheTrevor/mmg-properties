'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import PaymentForm from '@/components/financials/payments/payment-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentRecord } from '@/lib/types/financials';
import { getPaymentRecord } from '@/lib/services/financials';

export default function EditPaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Role-based permissions
  const canEdit = user?.role && ['admin', 'agent'].includes(user.role);

  useEffect(() => {
    if (!authLoading && user && paymentId) {
      if (!canEdit) {
        setError('You do not have permission to edit payment records');
        return;
      }
      loadPayment();
    }
  }, [authLoading, user, paymentId, canEdit]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      setError('');

      const paymentData = await getPaymentRecord(paymentId);
      
      if (!paymentData) {
        setError('Payment record not found');
        return;
      }

      setPayment(paymentData);
    } catch (error: any) {
      console.error('Error loading payment:', error);
      setError(error.message || 'Failed to load payment record');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Edit Payment">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment record...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!canEdit) {
    return (
      <AppLayout title="Edit Payment">
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
              You don't have permission to edit payment records. This action is restricted to 
              administrators and agents only.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Edit Payment">
        <div className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  if (!payment) {
    return (
      <AppLayout title="Edit Payment">
        <div className="p-6 text-center">
          <p className="text-gray-600">Payment record not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Edit Payment Record"
      requiredRoles={['admin', 'agent']}
    >
      <PaymentForm
        payment={payment}
        onSuccess={(paymentId) => {
          // Redirect to payment details
          window.location.href = `/financials/payments/${paymentId}`;
        }}
        onCancel={() => {
          // Go back to payment details
          window.location.href = `/financials/payments/${payment.id}`;
        }}
      />
    </AppLayout>
  );
}