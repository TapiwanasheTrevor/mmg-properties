'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users,
  UserPlus,
  UserMinus,
  Clock,
  Star,
  Heart,
  TrendingUp,
  TrendingDown,
  Home,
  DollarSign,
  Wrench,
  Download,
  RefreshCw,
  AlertCircle,
  Activity,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Cell,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import { TenantAnalytics, LeaseAnalytics, getTenantAnalytics, getLeaseAnalytics, exportAnalyticsToCSV } from '@/lib/services/analytics';

export default function TenantAnalyticsComponent() {
  const [tenantData, setTenantData] = useState<TenantAnalytics | null>(null);
  const [leaseData, setLeaseData] = useState<LeaseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tenantAnalytics, leaseAnalytics] = await Promise.all([
        getTenantAnalytics(),
        getLeaseAnalytics()
      ]);
      
      setTenantData(tenantAnalytics);
      setLeaseData(leaseAnalytics);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const handleExportData = () => {
    if (!tenantData || !leaseData) return;
    
    const exportData = [
      {
        'Metric': 'Total Tenants',
        'Value': tenantData.totalTenants,
        'Type': 'Count',
      },
      {
        'Metric': 'Active Tenants',
        'Value': tenantData.activeTenants,
        'Type': 'Count',
      },
      {
        'Metric': 'New Tenants',
        'Value': tenantData.newTenants,
        'Type': 'Count',
      },
      {
        'Metric': 'Average Tenant Stay (months)',
        'Value': tenantData.averageTenantStay,
        'Type': 'Duration',
      },
      {
        'Metric': 'Renewal Rate (%)',
        'Value': tenantData.renewalRate,
        'Type': 'Percentage',
      },
      {
        'Metric': 'Average Rent',
        'Value': tenantData.averageRent,
        'Type': 'Currency',
      },
      {
        'Metric': 'On-time Payment Rate (%)',
        'Value': tenantData.onTimePaymentRate,
        'Type': 'Percentage',
      },
      {
        'Metric': 'Tenant Satisfaction Score',
        'Value': tenantData.tenantSatisfactionScore,
        'Type': 'Rating',
      },
    ];
    
    exportAnalyticsToCSV(exportData, 'tenant-analytics');
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

  const getPerformanceColor = (value: number, threshold: { good: number; warning: number }) => {
    if (value >= threshold.good) return 'text-green-600';
    if (value >= threshold.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (value: number, threshold: { good: number; warning: number }) => {
    if (value >= threshold.good) return 'default';
    if (value >= threshold.warning) return 'secondary';
    return 'destructive';
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

  if (!tenantData || !leaseData) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tenant Data</h3>
        <p className="text-gray-600">No tenant analytics data available to display.</p>
      </div>
    );
  }

  // Prepare chart data
  const ageGroupData = Object.entries(tenantData.demographicBreakdown.ageGroups).map(([group, count]) => ({
    name: group,
    value: count,
  }));

  const tenancyDurationData = Object.entries(tenantData.demographicBreakdown.tenancyDuration).map(([duration, count]) => ({
    name: duration,
    value: count,
  }));

  const unitTypeData = Object.entries(tenantData.demographicBreakdown.unitTypes).map(([type, count]) => ({
    name: type.replace('_', ' '),
    value: count,
  }));

  const leaseExpirationData = leaseData.monthlyExpirations.slice(0, 6).map(month => ({
    month: new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    expiring: month.expiringCount,
    renewals: month.renewalCount,
    terminations: month.terminationCount,
  }));

  const satisfactionData = [
    { name: 'Tenant Satisfaction', value: tenantData.tenantSatisfactionScore, fill: '#2563eb' },
  ];

  const paymentPerformanceData = [
    { name: 'On-time Payments', value: tenantData.onTimePaymentRate, fill: '#10b981' },
    { name: 'Late Payments', value: 100 - tenantData.onTimePaymentRate, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenant & Lease Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive tenant performance and lease management insights
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tenant Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
                <p className="text-2xl font-bold">{tenantData.totalTenants}</p>
                <p className="text-xs text-muted-foreground">
                  {tenantData.activeTenants} active
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Tenants</p>
                <p className="text-2xl font-bold text-green-600">{tenantData.newTenants}</p>
                <p className="text-xs text-muted-foreground">
                  {tenantData.departedTenants} departed
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Tenant Stay</p>
                <p className="text-2xl font-bold">{tenantData.averageTenantStay.toFixed(1)} months</p>
                <Badge variant={getPerformanceBadge(tenantData.averageTenantStay, { good: 18, warning: 12 })}>
                  {tenantData.averageTenantStay >= 18 ? 'Excellent' : tenantData.averageTenantStay >= 12 ? 'Good' : 'Needs Attention'}
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
                <p className="text-sm font-medium text-muted-foreground">Satisfaction Score</p>
                <p className="text-2xl font-bold">{tenantData.tenantSatisfactionScore.toFixed(1)}/5.0</p>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-3 w-3 ${star <= tenantData.tenantSatisfactionScore ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial and Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rent</p>
                <p className="text-xl font-bold">{formatCurrency(tenantData.averageRent)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On-time Payment Rate</p>
                <p className={`text-xl font-bold ${getPerformanceColor(tenantData.onTimePaymentRate, { good: 95, warning: 85 })}`}>
                  {formatPercentage(tenantData.onTimePaymentRate)}
                </p>
              </div>
              <Badge variant={getPerformanceBadge(tenantData.onTimePaymentRate, { good: 95, warning: 85 })}>
                {tenantData.onTimePaymentRate >= 95 ? 'Excellent' : tenantData.onTimePaymentRate >= 85 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maintenance Requests</p>
                <p className="text-xl font-bold">{tenantData.maintenanceRequestsPerTenant.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">per tenant</p>
              </div>
              <Wrench className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lease Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Leases</p>
                <p className="text-2xl font-bold">{leaseData.activeLeases}</p>
                <p className="text-xs text-muted-foreground">
                  of {leaseData.totalLeases} total
                </p>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Renewal Rate</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(tenantData.renewalRate, { good: 80, warning: 70 })}`}>
                  {formatPercentage(tenantData.renewalRate)}
                </p>
                <Badge variant={getPerformanceBadge(tenantData.renewalRate, { good: 80, warning: 70 })}>
                  {tenantData.renewalRate >= 80 ? 'Excellent' : tenantData.renewalRate >= 70 ? 'Good' : 'Needs Attention'}
                </Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{leaseData.expiring30Days}</p>
                <p className="text-xs text-muted-foreground">
                  next 30 days
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Lease Duration</p>
                <p className="text-2xl font-bold">{leaseData.averageLeaseDuration.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">months</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Demographics - Age Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5" />
              Tenant Age Groups
            </CardTitle>
            <CardDescription>Distribution of tenants by age range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={ageGroupData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {ageGroupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tenancy Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Tenancy Duration
            </CardTitle>
            <CardDescription>How long tenants have been staying</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tenancyDurationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Performance and Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5" />
              Payment Performance
            </CardTitle>
            <CardDescription>On-time vs late payment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={paymentPerformanceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {paymentPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tenant Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Tenant Satisfaction
            </CardTitle>
            <CardDescription>Overall satisfaction rating out of 5.0</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={satisfactionData}>
                <RadialBar 
                  dataKey="value" 
                  cornerRadius={10} 
                  fill="#2563eb"
                  max={5}
                />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold">
                  {tenantData.tenantSatisfactionScore.toFixed(1)}/5.0
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lease Expiration Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="mr-2 h-5 w-5" />
            Lease Expiration Trends
          </CardTitle>
          <CardDescription>Upcoming lease expirations and expected outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={leaseExpirationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="expiring"
                stackId="1"
                stroke="#fbbf24"
                fill="#fbbf24"
                fillOpacity={0.6}
                name="Expiring"
              />
              <Area
                type="monotone"
                dataKey="renewals"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Expected Renewals"
              />
              <Area
                type="monotone"
                dataKey="terminations"
                stackId="3"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Expected Terminations"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Unit Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="mr-2 h-5 w-5" />
            Unit Type Distribution
          </CardTitle>
          <CardDescription>Tenant distribution across different unit types</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={unitTypeData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="name" type="category" fontSize={12} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lease Expiration Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Lease Expirations</CardTitle>
          <CardDescription>Schedule of leases expiring in the next 90 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Next 30 Days</p>
              <p className="text-2xl font-bold text-orange-600">{leaseData.expiring30Days}</p>
              <p className="text-xs text-muted-foreground">leases expiring</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">31-60 Days</p>
              <p className="text-2xl font-bold text-yellow-600">{leaseData.expiring60Days}</p>
              <p className="text-xs text-muted-foreground">leases expiring</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">61-90 Days</p>
              <p className="text-2xl font-bold text-blue-600">{leaseData.expiring90Days}</p>
              <p className="text-xs text-muted-foreground">leases expiring</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-green-800">Renewal Performance</p>
                <p className="text-sm text-muted-foreground">
                  {leaseData.renewedLeases} renewals vs {leaseData.terminatedLeases} terminations
                </p>
              </div>
              <Badge variant="default" className="bg-green-600">
                {formatPercentage(leaseData.renewalRate)} renewal rate
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}