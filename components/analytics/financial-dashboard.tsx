'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart,
  Download,
  RefreshCw,
  AlertCircle,
  Target,
  CreditCard,
  Wallet,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  ComposedChart,
} from 'recharts';
import { FinancialMetrics, getFinancialMetrics, exportAnalyticsToCSV } from '@/lib/services/analytics';

export default function FinancialDashboard() {
  const [financials, setFinancials] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('12_months');

  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '3_months':
        start.setMonth(start.getMonth() - 3);
        break;
      case '6_months':
        start.setMonth(start.getMonth() - 6);
        break;
      case '12_months':
        start.setMonth(start.getMonth() - 12);
        break;
      case '24_months':
        start.setMonth(start.getMonth() - 24);
        break;
      default:
        start.setMonth(start.getMonth() - 12);
    }
    
    return { start, end };
  };

  const loadFinancialData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFinancialMetrics(getDateRange());
      setFinancials(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFinancialData();
    setRefreshing(false);
  };

  const handleExportData = () => {
    if (!financials) return;
    
    const exportData = [
      {
        'Metric': 'Total Revenue',
        'Amount': financials.totalRevenue,
        'Growth': financials.revenueGrowth,
      },
      {
        'Metric': 'Total Expenses',
        'Amount': financials.totalExpenses,
        'Growth': financials.expenseGrowth,
      },
      {
        'Metric': 'Net Income',
        'Amount': financials.netIncome,
        'Growth': 0,
      },
      {
        'Metric': 'Gross Margin',
        'Amount': financials.grossMargin,
        'Growth': 0,
      },
      {
        'Metric': 'Operating Expense Ratio',
        'Amount': financials.operatingExpenseRatio,
        'Growth': 0,
      },
      {
        'Metric': 'Collection Rate',
        'Amount': financials.collectionRate,
        'Growth': 0,
      },
    ];
    
    exportAnalyticsToCSV(exportData, 'financial-metrics');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return TrendingUp;
    if (growth < 0) return TrendingDown;
    return Activity;
  };

  // Chart colors
  const COLORS = ['#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#65a30d', '#0891b2'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!financials) {
    return (
      <div className="text-center py-8">
        <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Financial Data</h3>
        <p className="text-gray-600">No financial data available for the selected period.</p>
      </div>
    );
  }

  // Prepare chart data
  const monthlyTrendData = financials.monthlyBreakdown.map(month => ({
    ...month,
    month: new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    profitMargin: month.revenue > 0 ? ((month.netIncome / month.revenue) * 100) : 0,
  }));

  const revenueExpenseData = [
    { name: 'Revenue', value: financials.totalRevenue, color: '#2563eb' },
    { name: 'Expenses', value: financials.totalExpenses, color: '#dc2626' },
  ];

  const marginData = [
    { name: 'Gross Margin', value: financials.grossMargin },
    { name: 'Profit Margin', value: financials.profitMargin },
    { name: 'Operating Expense Ratio', value: financials.operatingExpenseRatio },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive financial performance metrics and trends
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3_months">3 Months</SelectItem>
              <SelectItem value="6_months">6 Months</SelectItem>
              <SelectItem value="12_months">12 Months</SelectItem>
              <SelectItem value="24_months">24 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(financials.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  {React.createElement(getGrowthIcon(financials.revenueGrowth), {
                    className: `h-3 w-3 mr-1 ${getGrowthColor(financials.revenueGrowth)}`,
                  })}
                  <span className={`text-xs ${getGrowthColor(financials.revenueGrowth)}`}>
                    {formatPercentage(Math.abs(financials.revenueGrowth))} vs prev period
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(financials.totalExpenses)}</p>
                <div className="flex items-center mt-1">
                  {React.createElement(getGrowthIcon(financials.expenseGrowth), {
                    className: `h-3 w-3 mr-1 ${getGrowthColor(financials.expenseGrowth)}`,
                  })}
                  <span className={`text-xs ${getGrowthColor(financials.expenseGrowth)}`}>
                    {formatPercentage(Math.abs(financials.expenseGrowth))} vs prev period
                  </span>
                </div>
              </div>
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Income</p>
                <p className={`text-2xl font-bold ${financials.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financials.netIncome)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(financials.profitMargin)} profit margin
                </p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(financials.collectionRate)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(financials.outstandingRent)} outstanding
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Margin</p>
                <p className="text-xl font-bold">{formatPercentage(financials.grossMargin)}</p>
              </div>
              <Badge variant={financials.grossMargin >= 70 ? 'default' : financials.grossMargin >= 50 ? 'secondary' : 'destructive'}>
                {financials.grossMargin >= 70 ? 'Excellent' : financials.grossMargin >= 50 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operating Expense Ratio</p>
                <p className="text-xl font-bold">{formatPercentage(financials.operatingExpenseRatio)}</p>
              </div>
              <Badge variant={financials.operatingExpenseRatio <= 30 ? 'default' : financials.operatingExpenseRatio <= 50 ? 'secondary' : 'destructive'}>
                {financials.operatingExpenseRatio <= 30 ? 'Excellent' : financials.operatingExpenseRatio <= 50 ? 'Good' : 'High'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rent Collection</p>
                <p className="text-xl font-bold">{formatCurrency(financials.averageRentCollection)}</p>
              </div>
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="mr-2 h-5 w-5" />
              Revenue & Expenses Trend
            </CardTitle>
            <CardDescription>Monthly financial performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'profitMargin') {
                      return [`${value}%`, 'Profit Margin'];
                    }
                    return [formatCurrency(value as number), name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Net Income'];
                  }}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#2563eb" 
                  fill="#2563eb" 
                  fillOpacity={0.6}
                  name="revenue"
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2" 
                  stroke="#dc2626" 
                  fill="#dc2626" 
                  fillOpacity={0.6}
                  name="expenses"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="profitMargin" 
                  stroke="#7c3aed" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="profitMargin"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue vs Expenses Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5" />
              Revenue vs Expenses
            </CardTitle>
            <CardDescription>Total financial breakdown for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={revenueExpenseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {revenueExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold">
                Net Income: 
                <span className={`ml-2 ${financials.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financials.netIncome)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Ratios Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Financial Ratios
          </CardTitle>
          <CardDescription>Key financial performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marginData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis 
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
              />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Breakdown</CardTitle>
          <CardDescription>Detailed monthly performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Expenses</th>
                  <th className="text-right p-2">Net Income</th>
                  <th className="text-right p-2">Profit Margin</th>
                  <th className="text-right p-2">Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrendData.map((month) => (
                  <tr key={month.month} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{month.month}</td>
                    <td className="text-right p-2 text-green-600">{formatCurrency(month.revenue)}</td>
                    <td className="text-right p-2 text-red-600">{formatCurrency(month.expenses)}</td>
                    <td className="text-right p-2">
                      <span className={month.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(month.netIncome)}
                      </span>
                    </td>
                    <td className="text-right p-2">{formatPercentage(month.profitMargin)}</td>
                    <td className="text-right p-2">{formatPercentage(month.occupancyRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}