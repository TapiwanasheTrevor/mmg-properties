'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import BudgetList from '@/components/financials/budgets/budget-list';
import { Button } from '@/components/ui/button';
import { Plus, PieChart, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBudgets } from '@/lib/services/financials';
import { Budget } from '@/lib/types/financials';

interface BudgetStats {
  total: number;
  active: number;
  draft: number;
  completed: number;
  totalBudgeted: number;
  totalActual: number;
  variancePercentage: number;
}

export default function BudgetsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<BudgetStats>({
    total: 0,
    active: 0,
    draft: 0,
    completed: 0,
    totalBudgeted: 0,
    totalActual: 0,
    variancePercentage: 0,
  });
  const [activeTab, setActiveTab] = useState('all');

  // Role-based permissions
  const canCreateBudgets = user?.role && ['admin', 'owner'].includes(user.role);
  const canViewAllBudgets = user?.role && ['admin'].includes(user.role);
  const canExport = user?.role && ['admin', 'owner'].includes(user.role);

  useEffect(() => {
    if (!authLoading && user) {
      loadBudgets();
    }
  }, [authLoading, user, activeTab]);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError('');

      const filters: any = {};
      
      // Apply role-based filtering
      if (user?.role === 'owner' && user.properties) {
        filters.propertyId = user.properties; // Note: This would need to be handled differently for multiple properties
      }

      // Apply tab filters
      if (activeTab !== 'all') {
        filters.status = activeTab;
      }

      const budgetData = await getBudgets(filters);
      setBudgets(budgetData);

      // Calculate stats
      const newStats: BudgetStats = {
        total: budgetData.length,
        active: budgetData.filter(b => b.status === 'active').length,
        draft: budgetData.filter(b => b.status === 'draft').length,
        completed: budgetData.filter(b => b.status === 'completed').length,
        totalBudgeted: budgetData.reduce((sum, b) => sum + b.totalBudgeted, 0),
        totalActual: budgetData.reduce((sum, b) => sum + b.totalActual, 0),
        variancePercentage: 0,
      };

      // Calculate variance percentage
      if (newStats.totalBudgeted > 0) {
        newStats.variancePercentage = ((newStats.totalActual - newStats.totalBudgeted) / newStats.totalBudgeted) * 100;
      }

      setStats(newStats);

    } catch (error: any) {
      console.error('Error loading budgets:', error);
      setError(error.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleExportBudgets = async () => {
    try {
      const csvData = budgets.map(b => ({
        Name: b.name,
        Property: b.propertyId,
        Period: b.period,
        Status: b.status,
        StartDate: b.startDate.toDate().toLocaleDateString(),
        EndDate: b.endDate.toDate().toLocaleDateString(),
        TotalBudgeted: b.totalBudgeted,
        TotalActual: b.totalActual,
        Variance: b.totalVariance,
        VariancePercentage: b.totalBudgeted > 0 ? ((b.totalVariance / b.totalBudgeted) * 100).toFixed(2) + '%' : '0%',
      }));

      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budgets_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting budgets:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Budget Management">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading budgets...</p>
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
      title="Budget Management"
      requiredRoles={['admin', 'owner']}
      headerActions={
        <div className="flex items-center space-x-2">
          {canExport && (
            <Button variant="outline" onClick={handleExportBudgets}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {canCreateBudgets && (
            <Button onClick={() => router.push('/financials/budgets/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
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

        {/* Budget Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Budgets</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-sm text-gray-600">Active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
              <p className="text-sm text-gray-600">Draft</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${stats.variancePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.variancePercentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Avg Variance</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  ${stats.totalBudgeted.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-1">Total Budgeted</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  ${stats.totalActual.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-1">Total Actual</p>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${(stats.totalActual - stats.totalBudgeted) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${Math.abs(stats.totalActual - stats.totalBudgeted).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {(stats.totalActual - stats.totalBudgeted) >= 0 ? 'Over Budget' : 'Under Budget'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budgets Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Budgets
            </CardTitle>
            <CardDescription>
              {user.role === 'admin' 
                ? 'View and manage all property budgets'
                : 'View and manage budgets for your properties'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active ({stats.active})
                </TabsTrigger>
                <TabsTrigger value="draft">
                  Draft ({stats.draft})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({stats.completed})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4">
                <BudgetList
                  budgets={budgets}
                  loading={loading}
                  userRole={user.role}
                  canEdit={canCreateBudgets}
                  onRefresh={loadBudgets}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}