'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3,
  DollarSign,
  Users,
  Wrench,
  Building,
  TrendingUp,
  PieChart,
  LineChart,
  Activity,
  FileText
} from 'lucide-react';
import PortfolioOverviewComponent from '@/components/analytics/portfolio-overview';
import FinancialDashboard from '@/components/analytics/financial-dashboard';
import TenantAnalyticsComponent from '@/components/analytics/tenant-analytics';
import MaintenanceAnalyticsComponent from '@/components/analytics/maintenance-analytics';
import ReportsManager from '@/components/analytics/reports-manager';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  // Check if user has access to analytics
  if (!['admin', 'owner', 'agent'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your property portfolio performance
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Real-time Data
        </Badge>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-colors ${activeTab === 'overview' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
          onClick={() => setActiveTab('overview')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Portfolio</p>
                <p className="text-lg font-bold">Overview</p>
              </div>
              <Building className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${activeTab === 'financial' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'}`}
          onClick={() => setActiveTab('financial')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Financial</p>
                <p className="text-lg font-bold">Performance</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${activeTab === 'tenants' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'}`}
          onClick={() => setActiveTab('tenants')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tenant &</p>
                <p className="text-lg font-bold">Leases</p>
              </div>
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${activeTab === 'maintenance' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-gray-50'}`}
          onClick={() => setActiveTab('maintenance')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                <p className="text-lg font-bold">Analytics</p>
              </div>
              <Wrench className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Financial</span>
          </TabsTrigger>
          <TabsTrigger value="tenants" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Tenants</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <PortfolioOverviewComponent />
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-6 mt-6">
          <FinancialDashboard />
        </TabsContent>
        
        <TabsContent value="tenants" className="space-y-6 mt-6">
          <TenantAnalyticsComponent />
        </TabsContent>
        
        <TabsContent value="maintenance" className="space-y-6 mt-6">
          <MaintenanceAnalyticsComponent />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6 mt-6">
          <ReportsManager />
        </TabsContent>
      </Tabs>

      {/* Analytics Features Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Analytics Features
          </CardTitle>
          <CardDescription>
            Comprehensive reporting and insights across all aspects of your property management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Portfolio Analytics</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Property performance comparison</li>
                <li>• Occupancy rate tracking</li>
                <li>• ROI analysis by property</li>
                <li>• Portfolio value assessment</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Financial Reporting</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Revenue vs expense analysis</li>
                <li>• Profit margin tracking</li>
                <li>• Cash flow monitoring</li>
                <li>• Collection rate metrics</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Tenant Insights</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tenant retention analysis</li>
                <li>• Lease renewal tracking</li>
                <li>• Demographic breakdowns</li>
                <li>• Satisfaction scoring</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}