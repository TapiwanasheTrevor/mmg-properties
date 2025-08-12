'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import ExpenseList from '@/components/financials/expenses/expense-list';
import { Button } from '@/components/ui/button';
import { Plus, Receipt, Download, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTransactions } from '@/lib/services/financials';
import { FinancialTransaction, TransactionCategory } from '@/lib/types/financials';

interface ExpenseStats {
  total: number;
  thisMonth: number;
  pending: number;
  approved: number;
  totalAmount: number;
  thisMonthAmount: number;
}

export default function ExpensesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expenses, setExpenses] = useState<FinancialTransaction[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({
    total: 0,
    thisMonth: 0,
    pending: 0,
    approved: 0,
    totalAmount: 0,
    thisMonthAmount: 0,
  });
  const [activeTab, setActiveTab] = useState('all');

  // Role-based permissions
  const canCreateExpenses = user?.role && ['admin', 'agent'].includes(user.role);
  const canViewAllExpenses = user?.role && ['admin'].includes(user.role);
  const canExport = user?.role && ['admin', 'owner'].includes(user.role);
  const canManageCategories = user?.role === 'admin';

  // Expense-related transaction types
  const expenseTypes: TransactionCategory[] = [
    'maintenance_cost',
    'service_fee',
    'utility_bill',
    'insurance',
    'other'
  ];

  useEffect(() => {
    if (!authLoading && user) {
      loadExpenses();
    }
  }, [authLoading, user, activeTab]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError('');

      const filters: any = {
        type: activeTab === 'all' ? undefined : activeTab as TransactionCategory
      };
      
      // Apply role-based filtering
      if (user?.role === 'owner' && user.properties) {
        filters.propertyId = user.properties;
      } else if (user?.role === 'agent' && user.assignedProperties) {
        filters.propertyId = user.assignedProperties;
      }

      const result = await getTransactions(filters);
      
      // Filter for expense-type transactions
      const expenseTransactions = result.transactions.filter(t => 
        expenseTypes.includes(t.type) || t.amount < 0
      );
      
      setExpenses(expenseTransactions);

      // Calculate stats
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const thisMonthExpenses = expenseTransactions.filter(e => 
        e.createdAt.toDate() >= startOfMonth
      );

      const newStats: ExpenseStats = {
        total: expenseTransactions.length,
        thisMonth: thisMonthExpenses.length,
        pending: expenseTransactions.filter(e => e.status === 'pending').length,
        approved: expenseTransactions.filter(e => e.status === 'completed').length,
        totalAmount: Math.abs(expenseTransactions.reduce((sum, e) => sum + e.amount, 0)),
        thisMonthAmount: Math.abs(thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0)),
      };
      setStats(newStats);

    } catch (error: any) {
      console.error('Error loading expenses:', error);
      setError(error.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExpenses = async () => {
    try {
      const csvData = expenses.map(e => ({
        Date: e.createdAt.toDate().toLocaleDateString(),
        Type: e.type,
        Amount: Math.abs(e.amount),
        Currency: e.currency,
        Status: e.status,
        Property: e.propertyName || '',
        Description: e.description,
        Reference: e.reference,
        VAT: e.allocation.vatAmount || 0,
        WithholdingTax: e.allocation.withholdingTax || 0,
      }));

      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting expenses:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Expense Management">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expenses...</p>
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
      title="Expense Management"
      requiredRoles={['admin', 'owner', 'agent']}
      headerActions={
        <div className="flex items-center space-x-2">
          {canManageCategories && (
            <Button variant="outline" onClick={() => router.push('/financials/expenses/categories')}>
              <Settings className="h-4 w-4 mr-2" />
              Categories
            </Button>
          )}
          {canExport && (
            <Button variant="outline" onClick={handleExportExpenses}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {canCreateExpenses && (
            <Button onClick={() => router.push('/financials/expenses/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
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

        {/* Expense Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Expenses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
              <p className="text-sm text-gray-600">This Month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-gray-600">Pending Approval</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-sm text-gray-600">Approved</p>
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

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">This Month's Expenses</h3>
                <p className="text-sm text-gray-600">
                  ${stats.thisMonthAmount.toLocaleString()} across {stats.thisMonth} expenses
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  ${stats.thisMonthAmount.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">
                  {stats.pending > 0 && `${stats.pending} pending approval`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Expenses
            </CardTitle>
            <CardDescription>
              {user.role === 'admin' 
                ? 'View and manage all property expenses'
                : user.role === 'owner'
                ? 'View expenses for your properties'
                : 'View and manage expenses for assigned properties'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="maintenance_cost">Maintenance</TabsTrigger>
                <TabsTrigger value="utility_bill">Utilities</TabsTrigger>
                <TabsTrigger value="service_fee">Services</TabsTrigger>
                <TabsTrigger value="insurance">Insurance</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4">
                <ExpenseList
                  expenses={expenses}
                  loading={loading}
                  userRole={user.role}
                  canEdit={canCreateExpenses}
                  onRefresh={loadExpenses}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}