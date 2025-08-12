'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import PaymentDetails from '@/components/financials/payments/payment-details';
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentRecord } from '@/lib/types/financials';
import { getPaymentRecord } from '@/lib/services/financials';

export default function PaymentDetailsPage() {
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
      loadPayment();
    }
  }, [authLoading, user, paymentId]);

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

  const handleEdit = () => {
    if (payment && canEdit) {
      router.push(`/financials/payments/${payment.id}/edit`);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Payment Details">
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

  if (error) {
    return (
      <AppLayout title="Payment Details">
        <div className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!payment) {
    return (
      <AppLayout title="Payment Details">
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">Payment record not found</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Payment Details"
      requiredRoles={['admin', 'owner', 'agent']}
      headerActions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {canEdit && (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      }
    >
      <div className="p-6">
        <PaymentDetails
          payment={payment}
          userRole={user.role}
          onUpdate={loadPayment}
        />
      </div>
    </AppLayout>
  );
}