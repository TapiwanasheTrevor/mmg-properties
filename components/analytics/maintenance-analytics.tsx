'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wrench,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart,
  Download,
  RefreshCw,
  AlertCircle,
  Activity,
  Calendar,
  Target
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
import { MaintenanceAnalytics, getMaintenanceAnalytics, exportAnalyticsToCSV } from '@/lib/services/analytics';

export default function MaintenanceAnalyticsComponent() {
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('12_months');

  useEffect(() => {
    loadMaintenanceData();
  }, [timeframe]);

  const loadMaintenanceData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMaintenanceAnalytics();
      setMaintenanceData(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMaintenanceData();
    setRefreshing(false);
  };

  const handleExportData = () => {
    if (!maintenanceData) return;
    
    const exportData = [
      {
        'Metric': 'Total Requests',
        'Value': maintenanceData.totalRequests,
        'Type': 'Count',
      },
      {
        'Metric': 'Completed Requests',
        'Value': maintenanceData.completedRequests,
        'Type': 'Count',
      },
      {
        'Metric': 'Pending Requests',
        'Value': maintenanceData.pendingRequests,
        'Type': 'Count',
      },
      {
        'Metric': 'Average Resolution Time (days)',
        'Value': maintenanceData.averageResolutionTime,
        'Type': 'Duration',
      },
      {
        'Metric': 'Total Costs',
        'Value': maintenanceData.totalCosts,
        'Type': 'Currency',
      },
      {
        'Metric': 'Average Cost Per Request',
        'Value': maintenanceData.averageCostPerRequest,
        'Type': 'Currency',
      },
    ];
    
    exportAnalyticsToCSV(exportData, 'maintenance-analytics');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDays = (days: number) => {
    return `${days.toFixed(1)} days`;
  };

  const getCompletionRate = () => {
    if (!maintenanceData || maintenanceData.totalRequests === 0) return 0;
    return (maintenanceData.completedRequests / maintenanceData.totalRequests) * 100;
  };

  const getPerformanceColor = (value: number, type: 'resolution' | 'completion') => {
    if (type === 'resolution') {
      if (value <= 3) return 'text-green-600';
      if (value <= 7) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value >= 90) return 'text-green-600';
      if (value >= 75) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  const getPerformanceBadge = (value: number, type: 'resolution' | 'completion') => {
    if (type === 'resolution') {
      if (value <= 3) return 'default';
      if (value <= 7) return 'secondary';
      return 'destructive';
    } else {
      if (value >= 90) return 'default';
      if (value >= 75) return 'secondary';
      return 'destructive';
    }
  };

  // Chart colors
  const COLORS = ['#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#65a30d', '#0891b2', '#8b5cf6', '#f59e0b'];

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

  if (!maintenanceData) {
    return (
      <div className="text-center py-8">
        <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Maintenance Data</h3>
        <p className="text-gray-600">No maintenance analytics data available to display.</p>
      </div>
    );
  }

  // Prepare chart data
  const categoryData = Object.entries(maintenanceData.requestsByCategory).map(([category, count]) => ({
    name: category.replace('_', ' ').toUpperCase(),
    requests: count,
    costs: maintenanceData.costsByCategory[category] || 0,
  }));

  const priorityData = Object.entries(maintenanceData.requestsByPriority).map(([priority, count]) => ({
    name: priority.toUpperCase(),
    value: count,
  }));

  const monthlyTrendData = maintenanceData.monthlyTrends.map(month => ({
    month: new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    requests: month.requests,
    costs: month.costs,
    avgResolution: month.averageResolutionTime,
  }));

  const costDistributionData = Object.entries(maintenanceData.costsByCategory).map(([category, cost]) => ({
    name: category.replace('_', ' ').toUpperCase(),
    value: cost,
  }));

  const completionRate = getCompletionRate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive maintenance cost analysis and performance trends
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{maintenanceData.totalRequests}</p>
                <p className="text-xs text-muted-foreground">
                  {maintenanceData.completedRequests} completed
                </p>
              </div>
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(maintenanceData.averageResolutionTime, 'resolution')}`}>
                  {formatDays(maintenanceData.averageResolutionTime)}
                </p>
                <Badge variant={getPerformanceBadge(maintenanceData.averageResolutionTime, 'resolution')}>
                  {maintenanceData.averageResolutionTime <= 3 ? 'Excellent' : maintenanceData.averageResolutionTime <= 7 ? 'Good' : 'Needs Attention'}
                </Badge>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Costs</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(maintenanceData.totalCosts)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(maintenanceData.averageCostPerRequest)} avg per request
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(completionRate, 'completion')}`}>
                  {completionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {maintenanceData.pendingRequests} pending
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-xl font-bold text-green-600">{maintenanceData.completedRequests}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-orange-600">{maintenanceData.pendingRequests}</p>
              </div>
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-xl font-bold text-red-600">
                  {(maintenanceData.requestsByPriority.urgent || 0) + (maintenanceData.requestsByPriority.high || 0)}
                </p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="mr-2 h-5 w-5" />
              Monthly Maintenance Trends
            </CardTitle>
            <CardDescription>Requests and costs over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis 
                  yAxisId="left"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'costs') {
                      return [formatCurrency(value as number), 'Costs'];
                    }
                    if (name === 'avgResolution') {
                      return [formatDays(value as number), 'Avg Resolution'];
                    }
                    return [value, 'Requests'];
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="requests" 
                  fill="#2563eb" 
                  name="requests"
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="costs" 
                  stroke="#dc2626" 
                  fill="#dc2626" 
                  fillOpacity={0.3}
                  name="costs"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="avgResolution" 
                  stroke="#7c3aed" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="avgResolution"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Requests by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5" />
              Requests by Priority
            </CardTitle>
            <CardDescription>Distribution of maintenance requests by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Requests by Category
            </CardTitle>
            <CardDescription>Maintenance requests and costs by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="left"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'costs') {
                      return [formatCurrency(value as number), 'Total Costs'];
                    }
                    return [value, 'Requests'];
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="requests" 
                  fill="#2563eb" 
                  name="requests"
                />
                <Bar 
                  yAxisId="right"
                  dataKey="costs" 
                  fill="#dc2626" 
                  name="costs"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5" />
              Cost Distribution
            </CardTitle>
            <CardDescription>Maintenance costs breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={costDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {costDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Top Maintenance Issues
          </CardTitle>
          <CardDescription>Most frequent maintenance categories and their costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceData.topIssues.map((issue, index) => (
              <div key={issue.category} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{issue.category.replace('_', ' ').toUpperCase()}</h4>
                    <p className="text-sm text-muted-foreground">
                      {issue.count} requests • {formatCurrency(issue.averageCost)} average cost
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{formatCurrency(issue.averageCost * issue.count)}</p>
                  <p className="text-xs text-muted-foreground">total cost</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Breakdown</CardTitle>
          <CardDescription>Detailed monthly maintenance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-right p-2">Requests</th>
                  <th className="text-right p-2">Total Costs</th>
                  <th className="text-right p-2">Avg Cost/Request</th>
                  <th className="text-right p-2">Avg Resolution</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrendData.map((month) => (
                  <tr key={month.month} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{month.month}</td>
                    <td className="text-right p-2">{month.requests}</td>
                    <td className="text-right p-2 text-red-600">{formatCurrency(month.costs)}</td>
                    <td className="text-right p-2">
                      {month.requests > 0 ? formatCurrency(month.costs / month.requests) : '-'}
                    </td>
                    <td className="text-right p-2">
                      <span className={getPerformanceColor(month.avgResolution, 'resolution')}>
                        {formatDays(month.avgResolution)}
                      </span>
                    </td>
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