'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building,
  Home,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Activity,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { PortfolioOverview, getPortfolioOverview, exportAnalyticsToCSV } from '@/lib/services/analytics';

export default function PortfolioOverviewComponent() {
  const [portfolio, setPortfolio] = useState<PortfolioOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPortfolioOverview();
      setPortfolio(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPortfolioData();
    setRefreshing(false);
  };

  const handleExportData = () => {
    if (!portfolio) return;
    
    const exportData = portfolio.propertyPerformance.map(property => ({
      'Property Name': property.propertyName,
      'Total Units': property.totalUnits,
      'Occupied Units': property.occupiedUnits,
      'Occupancy Rate (%)': property.occupancyRate.toFixed(2),
      'Monthly Rent Roll': property.totalRentRoll,
      'Average Rent': property.averageRent,
      'Total Revenue': property.totalRevenue,
      'Total Expenses': property.totalExpenses,
      'Net Income': property.netIncome,
      'ROI (%)': property.roi.toFixed(2),
      'Maintenance Costs': property.maintenanceCosts,
      'Maintenance Requests': property.maintenanceRequests,
    }));
    
    exportAnalyticsToCSV(exportData, 'portfolio-overview');
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

  const getPerformanceColor = (roi: number) => {
    if (roi >= 15) return 'text-green-600';
    if (roi >= 10) return 'text-blue-600';
    if (roi >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 95) return 'bg-green-100 text-green-800';
    if (rate >= 85) return 'bg-blue-100 text-blue-800';
    if (rate >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Chart colors
  const COLORS = ['#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#65a30d', '#0891b2'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
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

  if (!portfolio) {
    return (
      <div className="text-center py-8">
        <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portfolio Data</h3>
        <p className="text-gray-600">No portfolio data available to display.</p>
      </div>
    );
  }

  // Prepare chart data
  const propertyPerformanceData = portfolio.propertyPerformance.map(property => ({
    name: property.propertyName.substring(0, 15) + (property.propertyName.length > 15 ? '...' : ''),
    occupancy: property.occupancyRate,
    roi: property.roi,
    netIncome: property.netIncome,
    revenue: property.totalRevenue,
  }));

  const occupancyDistributionData = [
    { name: '90-100%', value: portfolio.propertyPerformance.filter(p => p.occupancyRate >= 90).length },
    { name: '80-89%', value: portfolio.propertyPerformance.filter(p => p.occupancyRate >= 80 && p.occupancyRate < 90).length },
    { name: '70-79%', value: portfolio.propertyPerformance.filter(p => p.occupancyRate >= 70 && p.occupancyRate < 80).length },
    { name: '60-69%', value: portfolio.propertyPerformance.filter(p => p.occupancyRate >= 60 && p.occupancyRate < 70).length },
    { name: '<60%', value: portfolio.propertyPerformance.filter(p => p.occupancyRate < 60).length },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portfolio Overview</h2>
          <p className="text-muted-foreground">
            Comprehensive view of your property portfolio performance
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

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{portfolio.totalProperties}</p>
              </div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold">{formatCurrency(portfolio.totalPortfolioValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(portfolio.overallOccupancyRate)}</p>
                <p className="text-xs text-muted-foreground">
                  {portfolio.occupiedUnits} of {portfolio.totalUnits} units
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
                <p className="text-sm font-medium text-muted-foreground">Portfolio ROI</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(portfolio.portfolioROI)}`}>
                  {formatPercentage(portfolio.portfolioROI)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(portfolio.totalMonthlyRevenue)}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(portfolio.totalMonthlyExpenses)}
                </p>
              </div>
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Operating Income</p>
                <p className={`text-xl font-bold ${portfolio.netOperatingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(portfolio.netOperatingIncome)}
                </p>
              </div>
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Property Performance
            </CardTitle>
            <CardDescription>Occupancy rate and ROI by property</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={propertyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'occupancy' || name === 'roi') {
                      return [`${value}%`, name === 'occupancy' ? 'Occupancy Rate' : 'ROI'];
                    }
                    return [formatCurrency(value as number), name === 'netIncome' ? 'Net Income' : 'Revenue'];
                  }}
                />
                <Bar dataKey="occupancy" fill="#2563eb" name="occupancy" />
                <Bar dataKey="roi" fill="#7c3aed" name="roi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Occupancy Distribution
            </CardTitle>
            <CardDescription>Properties by occupancy rate ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  dataKey="value"
                  data={occupancyDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {occupancyDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top and Bottom Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <TrendingUp className="mr-2 h-5 w-5" />
              Top Performing Properties
            </CardTitle>
            <CardDescription>Properties with highest ROI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.topPerformingProperties.map((property, index) => (
                <div key={property.propertyId} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-green-700">#{index + 1}</span>
                      <h4 className="font-medium">{property.propertyName}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {property.occupiedUnits}/{property.totalUnits} units occupied
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatPercentage(property.roi)}</p>
                    <Badge className={getOccupancyColor(property.occupancyRate)}>
                      {formatPercentage(property.occupancyRate)} occupied
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Underperforming Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <TrendingDown className="mr-2 h-5 w-5" />
              Properties Needing Attention
            </CardTitle>
            <CardDescription>Properties with lower performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.underperformingProperties.map((property, index) => (
                <div key={property.propertyId} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <h4 className="font-medium">{property.propertyName}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {property.occupiedUnits}/{property.totalUnits} units occupied
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{formatPercentage(property.roi)}</p>
                    <Badge className={getOccupancyColor(property.occupancyRate)}>
                      {formatPercentage(property.occupancyRate)} occupied
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Performance Details</CardTitle>
          <CardDescription>Detailed performance metrics for all properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Property</th>
                  <th className="text-right p-2">Units</th>
                  <th className="text-right p-2">Occupancy</th>
                  <th className="text-right p-2">Rent Roll</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Expenses</th>
                  <th className="text-right p-2">Net Income</th>
                  <th className="text-right p-2">ROI</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.propertyPerformance.map((property) => (
                  <tr key={property.propertyId} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{property.propertyName}</p>
                        <p className="text-xs text-muted-foreground">
                          {property.maintenanceRequests} maintenance requests
                        </p>
                      </div>
                    </td>
                    <td className="text-right p-2">
                      {property.occupiedUnits}/{property.totalUnits}
                    </td>
                    <td className="text-right p-2">
                      <Badge className={getOccupancyColor(property.occupancyRate)}>
                        {formatPercentage(property.occupancyRate)}
                      </Badge>
                    </td>
                    <td className="text-right p-2">{formatCurrency(property.totalRentRoll)}</td>
                    <td className="text-right p-2">{formatCurrency(property.totalRevenue)}</td>
                    <td className="text-right p-2">{formatCurrency(property.totalExpenses)}</td>
                    <td className="text-right p-2">
                      <span className={property.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(property.netIncome)}
                      </span>
                    </td>
                    <td className="text-right p-2">
                      <span className={getPerformanceColor(property.roi)}>
                        {formatPercentage(property.roi)}
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