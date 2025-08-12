'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import TransactionList from '@/components/financials/transactions/transaction-list';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTransactions } from '@/lib/services/financials';
import { FinancialTransaction, TransactionStatus, TransactionCategory } from '@/lib/types/financials';
import BulkTransactionOperations from '@/components/financials/transactions/bulk-transaction-operations';

interface TransactionStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  totalAmount: number;
  pendingAmount: number;
}

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showBulkOperations, setShowBulkOperations] = useState(false);

  // Role-based permissions
  const canCreateTransactions = user?.role && ['admin', 'agent'].includes(user.role);
  const canViewAllTransactions = user?.role && ['admin'].includes(user.role);
  const canExport = user?.role && ['admin', 'owner'].includes(user.role);
  const canBulkEdit = user?.role && ['admin'].includes(user.role);

  useEffect(() => {
    if (!authLoading && user) {
      loadTransactions();
    }
  }, [authLoading, user, activeTab]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const filters: any = {};
      
      // Apply role-based filtering
      if (user?.role === 'owner' && user.properties) {
        filters.propertyId = user.properties; // Assuming user has properties array
      } else if (user?.role === 'tenant') {
        filters.tenantId = user.uid;
      } else if (user?.role === 'agent' && user.assignedProperties) {
        filters.propertyId = user.assignedProperties;
      }

      // Apply tab filters
      if (activeTab !== 'all') {
        filters.status = activeTab as TransactionStatus;
      }

      const result = await getTransactions(filters);
      setTransactions(result.transactions);

      // Calculate stats
      const newStats: TransactionStats = {
        total: result.transactions.length,
        pending: result.transactions.filter(t => t.status === 'pending').length,
        completed: result.transactions.filter(t => t.status === 'completed').length,
        failed: result.transactions.filter(t => t.status === 'failed').length,
        totalAmount: result.transactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        pendingAmount: result.transactions
          .filter(t => t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0),
      };
      setStats(newStats);

    } catch (error: any) {
      console.error('Error loading transactions:', error);
      setError(error.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSelect = (transactionId: string, selected: boolean) => {
    if (selected) {
      setSelectedTransactions(prev => [...prev, transactionId]);
    } else {
      setSelectedTransactions(prev => prev.filter(id => id !== transactionId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTransactions(transactions.map(t => t.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleBulkOperationComplete = () => {
    setSelectedTransactions([]);
    setShowBulkOperations(false);
    loadTransactions();
  };

  const handleExportTransactions = async () => {
    try {
      // Implementation for exporting transactions
      // This would generate a CSV or Excel file
      const csvData = transactions.map(t => ({
        Date: t.createdAt.toDate().toLocaleDateString(),
        Type: t.type,
        Amount: t.amount,
        Currency: t.currency,
        Status: t.status,
        Property: t.propertyName || '',
        Tenant: t.tenantName || '',
        Description: t.description,
        Reference: t.reference,
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
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting transactions:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Transactions">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
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
      title="Transaction Management"
      requiredRoles={['admin', 'owner', 'agent', 'tenant']}
      headerActions={
        <div className="flex items-center space-x-2">
          {canExport && (
            <Button variant="outline" onClick={handleExportTransactions}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {canCreateTransactions && (
            <Button onClick={() => router.push('/financials/transactions/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
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

        {/* Transaction Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Transactions</p>
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

        {/* Bulk Operations */}
        {canBulkEdit && selectedTransactions.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {selectedTransactions.length} selected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkOperations(!showBulkOperations)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Bulk Actions
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTransactions([])}
                >
                  Clear Selection
                </Button>
              </div>
              
              {showBulkOperations && (
                <div className="mt-4">
                  <BulkTransactionOperations
                    selectedTransactionIds={selectedTransactions}
                    onComplete={handleBulkOperationComplete}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Transactions
            </CardTitle>
            <CardDescription>
              {user.role === 'admin' 
                ? 'View and manage all financial transactions'
                : user.role === 'owner'
                ? 'View transactions for your properties'
                : user.role === 'tenant'
                ? 'View your payment history'
                : 'View transactions for assigned properties'
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
                <TransactionList
                  transactions={transactions}
                  loading={loading}
                  userRole={user.role}
                  canEdit={canCreateTransactions}
                  canSelect={canBulkEdit}
                  selectedIds={selectedTransactions}
                  onSelect={handleTransactionSelect}
                  onSelectAll={handleSelectAll}
                  onRefresh={loadTransactions}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}