'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import TransactionDetails from '@/components/financials/transactions/transaction-details';
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FinancialTransaction } from '@/lib/types/financials';
import { getTransaction, deleteTransaction } from '@/lib/services/financials';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function TransactionDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  const [transaction, setTransaction] = useState<FinancialTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Role-based permissions
  const canEdit = user?.role && ['admin', 'agent'].includes(user.role);
  const canDelete = user?.role === 'admin';

  useEffect(() => {
    if (!authLoading && user && transactionId) {
      loadTransaction();
    }
  }, [authLoading, user, transactionId]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      setError('');

      const transactionData = await getTransaction(transactionId);
      
      if (!transactionData) {
        setError('Transaction not found');
        return;
      }

      // Check if user has permission to view this transaction
      if (user?.role === 'owner' && user.properties && !user.properties.includes(transactionData.propertyId)) {
        setError('You do not have permission to view this transaction');
        return;
      }

      if (user?.role === 'tenant' && user.uid !== transactionData.tenantId) {
        setError('You do not have permission to view this transaction');
        return;
      }

      if (user?.role === 'agent' && user.assignedProperties && !user.assignedProperties.includes(transactionData.propertyId)) {
        setError('You do not have permission to view this transaction');
        return;
      }

      setTransaction(transactionData);
    } catch (error: any) {
      console.error('Error loading transaction:', error);
      setError(error.message || 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction || !canDelete) return;

    try {
      setDeleting(true);
      await deleteTransaction(transaction.id);
      router.push('/financials/transactions');
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      setError(error.message || 'Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (transaction && canEdit) {
      router.push(`/financials/transactions/${transaction.id}/edit`);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Transaction Details">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transaction...</p>
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
      <AppLayout title="Transaction Details">
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

  if (!transaction) {
    return (
      <AppLayout title="Transaction Details">
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">Transaction not found</p>
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
      title="Transaction Details"
      requiredRoles={['admin', 'owner', 'agent', 'tenant']}
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
          
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this transaction? This action cannot be undone.
                    Transaction reference: {transaction.reference}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleting ? 'Deleting...' : 'Delete Transaction'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      }
    >
      <div className="p-6">
        <TransactionDetails
          transaction={transaction}
          userRole={user.role}
          onUpdate={loadTransaction}
        />
      </div>
    </AppLayout>
  );
}