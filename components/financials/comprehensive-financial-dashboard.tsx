'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  Calculator,
  CreditCard,
  Building,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Plus,
  Filter,
  Search,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { UserRole } from '@/lib/types';
import { Currency, CURRENCY_SYMBOLS } from '@/lib/types/financials';
import {
  mockTransactions,
  mockFinancialMetrics,
  mockRentCollections,
  mockReconciliationRecords,
  mockProperties,
  mockExpenseCategories,
} from '@/lib/data/mock-financial-data';
import FinancialMetricsCards from './financial-metrics-cards';
import TransactionManagement from './transaction-management';
import RentCollectionTracker from './rent-collection-tracker';
import FinancialReportsSection from './financial-reports-section';
import ReconciliationTools from './reconciliation-tools';
import BudgetManagement from './budget-management';

interface ComprehensiveFinancialDashboardProps {
  userRole: UserRole;
  permissions: {
    canViewAllProperties: boolean;
    canProcessTransactions: boolean;
    canReconcile: boolean;
    canViewReports: boolean;
    canManageBudgets: boolean;
    canExportData: boolean;
  };
  userId: string;
}

export default function ComprehensiveFinancialDashboard({
  userRole,
  permissions,
  userId,
}: ComprehensiveFinancialDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
  const [dateRange, setDateRange] = useState<string>('current_month');

  // State for dashboard data
  const [metrics, setMetrics] = useState(mockFinancialMetrics);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [rentCollections, setRentCollections] = useState(mockRentCollections);
  const [reconciliationRecords, setReconciliationRecords] = useState(mockReconciliationRecords);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [selectedProperty, selectedCurrency, dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // In real implementation, these would be API calls
      // For now, we'll use mock data with filters applied
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading

      // Filter data based on selections
      let filteredTransactions = [...mockTransactions];
      let filteredRentCollections = [...mockRentCollections];

      if (selectedProperty !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.propertyId === selectedProperty);
        filteredRentCollections = filteredRentCollections.filter(r => r.propertyId === selectedProperty);
      }

      if (selectedCurrency && selectedCurrency !== 'USD') {
        // In real implementation, apply currency conversion
        filteredTransactions = filteredTransactions.filter(t => t.currency === selectedCurrency);
      }

      setTransactions(filteredTransactions);
      setRentCollections(filteredRentCollections);
      
      // Update metrics based on filtered data
      const updatedMetrics = calculateMetrics(filteredTransactions, filteredRentCollections);
      setMetrics(updatedMetrics);

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (transactionData: any[], rentData: any[]) => {
    // Calculate metrics from filtered data
    const totalIncome = transactionData
      .filter(t => t.amount > 0 && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactionData
      .filter(t => t.amount < 0 && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const rentCollected = rentData
      .reduce((sum, r) => sum + r.amountPaid, 0);

    const rentDue = rentData
      .reduce((sum, r) => sum + r.rentAmount, 0);

    return {
      ...mockFinancialMetrics,
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      rentDue,
      rentCollected,
      collectionRate: rentDue > 0 ? (rentCollected / rentDue) * 100 : 0,
    };
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleExportData = () => {
    if (!permissions.canExportData) return;
    
    // In real implementation, trigger data export
    console.log('Exporting financial data...');
    // Show success notification
  };

  if (loading && !metrics) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
          <p className="text-muted-foreground">
            Comprehensive financial management for MMG Property Consultancy
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          
          {permissions.canExportData && (
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          
          <Badge variant="secondary" className="capitalize">
            {userRole} Access
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {mockProperties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as Currency)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="ZWL">ZWL (Z$)</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_month">Current Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
            <SelectItem value="last_6_months">Last 6 Months</SelectItem>
            <SelectItem value="current_year">Current Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Financial Metrics Overview */}
      <FinancialMetricsCards 
        metrics={metrics} 
        currency={selectedCurrency}
        loading={loading}
      />

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">
            Transactions ({transactions.length})
          </TabsTrigger>
          <TabsTrigger value="collections">
            Rent Collection
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          {permissions.canReconcile && (
            <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          )}
          {permissions.canManageBudgets && (
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Monthly Performance Trend
                </CardTitle>
                <CardDescription>
                  Income vs expenses over the last 4 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.monthlyTrends.map((trend, index) => (
                    <div key={trend.month} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{format(new Date(trend.month + '-01'), 'MMMM yyyy')}</div>
                        <div className="text-sm text-gray-500">
                          Collection Rate: {trend.collectionRate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <span className="text-green-600">
                            +{CURRENCY_SYMBOLS[selectedCurrency]}{trend.income.toLocaleString()}
                          </span>
                          {' / '}
                          <span className="text-red-600">
                            -{CURRENCY_SYMBOLS[selectedCurrency]}{trend.expenses.toLocaleString()}
                          </span>
                        </div>
                        <div className={`font-medium ${trend.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Net: {CURRENCY_SYMBOLS[selectedCurrency]}{trend.net.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Properties */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Property Performance
                </CardTitle>
                <CardDescription>
                  Net income and ROI by property
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.topProperties.map((property, index) => (
                    <div key={property.propertyId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{property.propertyName}</div>
                          <div className="text-sm text-gray-500">
                            ROI: {property.roi.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {CURRENCY_SYMBOLS[selectedCurrency]}{property.netIncome.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Net Income</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Expense Breakdown
                </CardTitle>
                <CardDescription>
                  Expenses by category this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.expenseByCategory.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ 
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                        }}></div>
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {CURRENCY_SYMBOLS[selectedCurrency]}{category.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {category.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Collection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Collection Status
                </CardTitle>
                <CardDescription>
                  Current rent collection status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">Current</span>
                    </div>
                    <div className="font-bold text-green-600">
                      {CURRENCY_SYMBOLS[selectedCurrency]}{metrics.collectionStatus.current.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Overdue</span>
                    </div>
                    <div className="font-bold text-yellow-600">
                      {CURRENCY_SYMBOLS[selectedCurrency]}{metrics.collectionStatus.overdue.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-900">In Arrears</span>
                    </div>
                    <div className="font-bold text-red-600">
                      {CURRENCY_SYMBOLS[selectedCurrency]}{metrics.collectionStatus.inArrears.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionManagement
            transactions={transactions}
            currency={selectedCurrency}
            userRole={userRole}
            permissions={permissions}
            onTransactionUpdate={(updatedTransaction) => {
              setTransactions(prev => 
                prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
              );
            }}
          />
        </TabsContent>

        <TabsContent value="collections">
          <RentCollectionTracker
            rentCollections={rentCollections}
            currency={selectedCurrency}
            userRole={userRole}
            permissions={permissions}
            onCollectionUpdate={(updatedCollection) => {
              setRentCollections(prev =>
                prev.map(r => r.id === updatedCollection.id ? updatedCollection : r)
              );
            }}
          />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReportsSection
            currency={selectedCurrency}
            userRole={userRole}
            permissions={permissions}
            selectedProperty={selectedProperty}
            dateRange={dateRange}
          />
        </TabsContent>

        {permissions.canReconcile && (
          <TabsContent value="reconciliation">
            <ReconciliationTools
              reconciliationRecords={reconciliationRecords}
              transactions={transactions}
              currency={selectedCurrency}
              userRole={userRole}
              permissions={permissions}
              onReconciliationUpdate={(updatedRecord) => {
                setReconciliationRecords(prev =>
                  prev.map(r => r.id === updatedRecord.id ? updatedRecord : r)
                );
              }}
            />
          </TabsContent>
        )}

        {permissions.canManageBudgets && (
          <TabsContent value="budgets">
            <BudgetManagement
              currency={selectedCurrency}
              userRole={userRole}
              permissions={permissions}
              selectedProperty={selectedProperty}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}