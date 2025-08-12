'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import PaymentList from '@/components/financials/payments/payment-list';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getPaymentRecords } from '@/lib/services/financials';
import { PaymentRecord } from '@/lib/types/financials';

interface PaymentStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  totalAmount: number;
  pendingAmount: number;
}

export default function PaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  const [activeTab, setActiveTab] = useState('all');

  // Role-based permissions
  const canCreatePayments = user?.role && ['admin', 'agent'].includes(user.role);
  const canViewAllPayments = user?.role && ['admin'].includes(user.role);
  const canExport = user?.role && ['admin', 'owner'].includes(user.role);

  useEffect(() => {
    if (!authLoading && user) {
      loadPayments();
    }
  }, [authLoading, user, activeTab]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');

      const filters: any = {};
      
      // Apply tab filters
      if (activeTab !== 'all') {
        filters.status = activeTab;
      }

      const paymentData = await getPaymentRecords(filters);
      setPayments(paymentData);

      // Calculate stats
      const newStats: PaymentStats = {
        total: paymentData.length,
        pending: paymentData.filter(p => p.status === 'pending').length,
        completed: paymentData.filter(p => p.status === 'completed').length,
        failed: paymentData.filter(p => p.status === 'failed').length,
        totalAmount: paymentData
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        pendingAmount: paymentData
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0),
      };
      setStats(newStats);

    } catch (error: any) {
      console.error('Error loading payments:', error);
      setError(error.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPayments = async () => {
    try {
      const csvData = payments.map(p => ({
        Date: p.createdAt.toDate().toLocaleDateString(),
        Reference: p.reference,
        Amount: p.amount,
        Currency: p.currency,
        Status: p.status,
        PaymentMethod: p.paymentMethod,
        TransactionId: p.transactionId,
      }));

      // Convert to CSV and download
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting payments:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Payment Records">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment records...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <AppLayout
      title="Payment Records"
      requiredRoles={['admin', 'owner', 'agent']}
      headerActions={
        <div className="flex items-center space-x-2">
          {canExport && (
            <Button variant="outline" onClick={handleExportPayments}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {canCreatePayments && (
            <Button onClick={() => router.push('/financials/payments/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Payments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-sm text-gray-600">Failed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                ${stats.totalAmount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Total Value</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Records
            </CardTitle>
            <CardDescription>
              {user.role === 'admin' 
                ? 'View and manage all payment records'
                : user.role === 'owner'
                ? 'View payment records for your properties'
                : 'View and manage payment records for assigned properties'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({stats.completed})
                </TabsTrigger>
                <TabsTrigger value="failed">
                  Failed ({stats.failed})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4">
                <PaymentList
                  payments={payments}
                  loading={loading}
                  userRole={user.role}
                  canEdit={canCreatePayments}
                  onRefresh={loadPayments}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}