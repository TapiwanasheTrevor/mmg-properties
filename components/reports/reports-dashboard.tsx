'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Building, 
  Users, 
  FileBarChart,
  Download,
  Calendar,
  Filter,
  Eye,
  Settings
} from 'lucide-react';

import RoleBasedNavigation from './role-based-navigation';
import ExecutiveOverview from './executive/executive-overview';
import FinancialReports from './financial/financial-reports';
import PropertyAnalytics from './property/property-analytics';
import TenantReports from './tenant/tenant-reports';
import OperationalReports from './operational/operational-reports';
import PersonalReports from './personal/personal-reports';
import ReportMetricsCards from './shared/report-metrics-cards';
import ChartComponents from './shared/chart-components';
import ExportUtilities from './shared/export-utilities';

import { getMetricsForRole } from '@/lib/data/mock-reports-data';
import { ReportMetric } from '@/lib/types/reports';

export default function ReportsDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const roleMetrics = getMetricsForRole(user.role || 'tenant');
      setMetrics(roleMetrics);
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Platform Administrator';
      case 'owner': return 'Property Owner';
      case 'agent': return 'Property Agent';
      case 'tenant': return 'Tenant';
      default: return 'User';
    }
  };

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case 'admin': 
        return 'Complete platform analytics and performance insights across all properties and operations.';
      case 'owner': 
        return 'Comprehensive reports for your property portfolio including financial performance and ROI analysis.';
      case 'agent': 
        return 'Management reports for your assigned properties including tenant performance and operational metrics.';
      case 'tenant': 
        return 'Your personal rental information including payment history and lease details.';
      default: 
        return 'Access your relevant reports and analytics.';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <Badge variant="secondary" className="text-sm">
              {getRoleDisplayName(user?.role || 'user')}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {getWelcomeMessage(user?.role || 'user')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <ExportUtilities />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <ReportMetricsCards metrics={metrics} />

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Role-Based Navigation */}
        <RoleBasedNavigation 
          userRole={user?.role || 'tenant'}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {/* Overview Tab - Available to All Roles */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartComponents
              title="Revenue Trend"
              type="line"
              data="revenue"
              userRole={user?.role || 'tenant'}
            />
            <ChartComponents
              title="Occupancy Rate"
              type="area"
              data="occupancy"
              userRole={user?.role || 'tenant'}
            />
          </div>
          
          {(user?.role === 'admin' || user?.role === 'owner') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartComponents
                title="Expense Breakdown"
                type="pie"
                data="expenses"
                userRole={user?.role}
              />
              <ChartComponents
                title="Property Performance"
                type="bar"
                data="properties"
                userRole={user?.role}
              />
              <ChartComponents
                title="Tenant Demographics"
                type="donut"
                data="demographics"
                userRole={user?.role}
              />
            </div>
          )}
        </TabsContent>

        {/* Executive Tab - Admin Only */}
        {user?.role === 'admin' && (
          <TabsContent value="executive">
            <ExecutiveOverview />
          </TabsContent>
        )}

        {/* Financial Tab - Admin, Owner */}
        {(user?.role === 'admin' || user?.role === 'owner') && (
          <TabsContent value="financial">
            <FinancialReports userRole={user.role} />
          </TabsContent>
        )}

        {/* Property Tab - Admin, Owner, Agent */}
        {(user?.role === 'admin' || user?.role === 'owner' || user?.role === 'agent') && (
          <TabsContent value="properties">
            <PropertyAnalytics userRole={user.role} />
          </TabsContent>
        )}

        {/* Tenant Tab - Admin, Owner, Agent */}
        {(user?.role === 'admin' || user?.role === 'owner' || user?.role === 'agent') && (
          <TabsContent value="tenants">
            <TenantReports userRole={user.role} />
          </TabsContent>
        )}

        {/* Operational Tab - Admin, Agent */}
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <TabsContent value="operational">
            <OperationalReports userRole={user.role} />
          </TabsContent>
        )}

        {/* Personal Tab - Tenant Only */}
        {user?.role === 'tenant' && (
          <TabsContent value="personal">
            <PersonalReports userId={user.id} />
          </TabsContent>
        )}
      </Tabs>

      {/* Quick Actions Footer */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Need more detailed analysis?
              </h3>
              <p className="text-blue-700 text-sm">
                {user?.role === 'admin' ? 
                  'Access advanced analytics, custom report builder, and automated report scheduling.' :
                  user?.role === 'owner' ?
                  'Request custom property performance reports and market analysis.' :
                  user?.role === 'agent' ?
                  'Get detailed operational reports for your managed properties.' :
                  'Request additional reports from your property manager.'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                <Eye className="w-4 h-4 mr-2" />
                View All Reports
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                {user?.role === 'admin' ? 'Advanced Analytics' : 
                 user?.role === 'owner' ? 'Custom Reports' :
                 user?.role === 'agent' ? 'Operational Tools' : 'Request Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}