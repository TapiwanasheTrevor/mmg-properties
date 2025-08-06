'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Eye, 
  Calendar,
  CreditCard,
  AlertCircle,
  PieChart,
  BarChart3,
  FileText,
  Download,
  Clock,
  CheckCircle
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Transaction, Property } from '@/lib/types';
import { 
  getTransactions, 
  getFinancialSummary,
  getPendingTransactions,
  getOverdueRentPayments 
} from '@/lib/services/transactions';
import { getProperties } from '@/lib/services/properties';

export default function FinancialDashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current_month');
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [overduePayments, setOverduePayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [user, selectedProperty, selectedPeriod]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Calculate date range
      const { dateFrom, dateTo } = getDateRange(selectedPeriod);
      
      // Load data
      const [
        transactionsResult,
        propertiesResult,
        summaryData,
        pendingData,
        overdueData
      ] = await Promise.all([
        getTransactions({
          propertyId: selectedProperty === 'all' ? undefined : selectedProperty,
          dateFrom,
          dateTo,
          pageSize: 50,
        }),
        getProperties(),
        getFinancialSummary(
          selectedProperty === 'all' ? undefined : selectedProperty,
          dateFrom,
          dateTo
        ),
        getPendingTransactions(),
        getOverdueRentPayments(),
      ]);

      setTransactions(transactionsResult.transactions);
      setProperties(propertiesResult.properties);
      setSummary(summaryData);
      setPendingTransactions(pendingData);
      setOverduePayments(overdueData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (period: string) => {
    const now = new Date();
    
    switch (period) {
      case 'current_month':
        return {
          dateFrom: startOfMonth(now),
          dateTo: endOfMonth(now),
        };
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        return {
          dateFrom: startOfMonth(lastMonth),
          dateTo: endOfMonth(lastMonth),
        };
      case 'last_3_months':
        return {
          dateFrom: subMonths(now, 3),
          dateTo: now,
        };
      case 'last_6_months':
        return {
          dateFrom: subMonths(now, 6),
          dateTo: now,
        };
      case 'current_year':
        return {
          dateFrom: new Date(now.getFullYear(), 0, 1),
          dateTo: now,
        };
      default:
        return {
          dateFrom: startOfMonth(now),
          dateTo: endOfMonth(now),
        };
    }
  };

  const getTransactionTypeColor = (type: string) => {
    const colors = {
      rent_payment: 'bg-green-100 text-green-800',
      deposit: 'bg-blue-100 text-blue-800',
      refund: 'bg-yellow-100 text-yellow-800',
      maintenance_cost: 'bg-red-100 text-red-800',
      service_fee: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbol = currency === 'USD' ? '$' : 'Z$';
    return `${symbol}${Math.abs(amount).toLocaleString()}`;
  };

  if (loading && !summary) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
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
        
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Track income, expenses, and financial performance
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/financial/reports">
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
          <Button asChild>
            <Link href="/financial/new">
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select period" />
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

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.totalExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Net Income</p>
                  <p className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.netIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{summary.transactionCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">
            Transactions ({transactions.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Income Breakdown</CardTitle>
                <CardDescription>Revenue by type</CardDescription>
              </CardHeader>
              <CardContent>
                {summary && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Rent Payments</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(summary.rentPayments)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Deposits</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(summary.deposits)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${summary.totalIncome > 0 ? (summary.rentPayments / summary.totalIncome) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Costs by category</CardDescription>
              </CardHeader>
              <CardContent>
                {summary && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Maintenance</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(summary.maintenanceCosts)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Service Fees</span>
                      <span className="font-bold text-orange-600">
                        {formatCurrency(summary.serviceFees)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ 
                          width: `${summary.totalExpenses > 0 ? (summary.maintenanceCosts / summary.totalExpenses) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-600 mb-4">
                    No transactions match your current filters.
                  </p>
                  <Button asChild>
                    <Link href="/financial/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Record Payment
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getTransactionTypeColor(transaction.type)}>
                              {transaction.type.replace('_', ' ')}
                            </Badge>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium mb-1">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {transaction.description}
                          </p>
                          
                          <div className="flex items-center text-xs text-muted-foreground space-x-4">
                            <span>
                              {format(transaction.createdAt.toDate(), 'MMM dd, yyyy HH:mm')}
                            </span>
                            <span>Ref: {transaction.reference}</span>
                            <span className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/financial/transactions/${transaction.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending">
          <div className="space-y-6">
            {/* Pending Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Transactions</CardTitle>
                <CardDescription>
                  Transactions awaiting processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending transactions</h3>
                    <p className="text-gray-600">All transactions are up to date.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingTransactions.map((transaction) => (
                      <div key={transaction.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                              <Badge className={getTransactionTypeColor(transaction.type)}>
                                {transaction.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <h4 className="font-medium mb-1">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {transaction.description}
                            </p>
                            
                            <div className="text-xs text-muted-foreground">
                              Created {format(transaction.createdAt.toDate(), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/financial/transactions/${transaction.id}`}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button size="sm">
                              Process
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overdue Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Overdue Rent Payments</CardTitle>
                <CardDescription>
                  Rent payments that are past due
                </CardDescription>
              </CardHeader>
              <CardContent>
                {overduePayments.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No overdue payments</h3>
                    <p className="text-gray-600">All rent payments are current.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {overduePayments.map((payment, index) => (
                      <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className="bg-red-100 text-red-800">
                                {payment.daysOverdue} days overdue
                              </Badge>
                            </div>
                            
                            <h4 className="font-medium mb-1">
                              Tenant: {payment.tenant}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Amount Due: {formatCurrency(payment.amountDue)}
                            </p>
                            
                            <div className="text-xs text-muted-foreground">
                              Unit: {payment.unit} • Property: {payment.property}
                            </div>
                          </div>
                          
                          <Button variant="outline" size="sm">
                            Send Reminder
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
                <CardDescription>Income vs expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                    <p>Chart visualization would go here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Transaction breakdown by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="mx-auto h-12 w-12 mb-4" />
                    <p>Pie chart visualization would go here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}