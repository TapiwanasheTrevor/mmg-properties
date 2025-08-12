'use client';

import { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Users, 
  DollarSign,
  Activity,
  AlertCircle,
  Download,
  Filter,
  Calendar,
  Globe,
  Shield,
  BarChart3
} from 'lucide-react';

interface ExecutiveDashboardProps {
  user: User;
}

export function ExecutiveDashboard({ user }: ExecutiveDashboardProps) {
  // Platform-wide KPIs
  const platformKPIs = {
    totalProperties: 47,
    totalUnits: 312,
    totalTenants: 285,
    totalRevenue: 2450000,
    occupancyRate: 91.3,
    avgRentPerUnit: 1850,
    totalMaintenanceRequests: 142,
    activeUsers: 89,
    monthlyGrowth: 12.5,
    yearlyGrowth: 23.7
  };

  // Multi-property comparison data
  const propertyComparison = [
    {
      id: '1',
      name: 'Sunset Apartments Complex',
      location: 'Harare CBD',
      units: 45,
      occupancy: 95.6,
      monthlyRevenue: 425000,
      profitMargin: 78.2,
      maintenanceRequests: 12,
      performance: 'excellent'
    },
    {
      id: '2',
      name: 'Garden View Residences',
      location: 'Borrowdale',
      units: 32,
      occupancy: 87.5,
      monthlyRevenue: 380000,
      profitMargin: 72.1,
      maintenanceRequests: 8,
      performance: 'good'
    },
    {
      id: '3',
      name: 'Downtown Commercial Center',
      location: 'Harare CBD',
      units: 28,
      occupancy: 92.9,
      monthlyRevenue: 520000,
      profitMargin: 68.5,
      maintenanceRequests: 15,
      performance: 'good'
    },
    {
      id: '4',
      name: 'Riverside Homes',
      location: 'Mount Pleasant',
      units: 18,
      occupancy: 83.3,
      monthlyRevenue: 285000,
      profitMargin: 65.8,
      maintenanceRequests: 6,
      performance: 'average'
    }
  ];

  // User activity data
  const userActivity = [
    { role: 'admin', count: 3, active: 3, lastLogin: '2 minutes ago' },
    { role: 'owner', count: 15, active: 12, lastLogin: '5 hours ago' },
    { role: 'agent', count: 8, active: 7, lastLogin: '1 hour ago' },
    { role: 'tenant', count: 285, active: 198, lastLogin: '3 hours ago' }
  ];

  // System metrics
  const systemMetrics = {
    dataStorage: { used: 450, total: 1000, unit: 'GB' },
    apiCalls: { daily: 12500, monthly: 375000, limit: 500000 },
    responseTime: { avg: 120, p95: 450, unit: 'ms' },
    uptime: { current: 99.98, monthly: 99.95, yearly: 99.92 }
  };

  // Zimbabwe-specific metrics
  const zimbabweMetrics = {
    usdRevenue: 1470000,
    zwlRevenue: 3675000000,
    exchangeRate: 2500,
    mobileMoneyTransactions: 1240,
    bankTransfers: 890,
    cashPayments: 245
  };

  const getPerformanceBadge = (performance: string) => {
    const variants = {
      excellent: 'default',
      good: 'secondary',
      average: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[performance as keyof typeof variants] || 'outline'} className="capitalize">
        {performance}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
            <Shield className="w-6 h-6 text-red-500" />
            <span>Executive Dashboard</span>
          </h2>
          <p className="text-muted-foreground">Platform-wide analytics and performance insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Dashboard
          </Button>
        </div>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformKPIs.totalProperties}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{platformKPIs.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(platformKPIs.totalRevenue / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{platformKPIs.yearlyGrowth}% year over year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {platformKPIs.occupancyRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {platformKPIs.totalTenants} / {platformKPIs.totalUnits} units occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {platformKPIs.activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all user roles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="zimbabwe">Zimbabwe</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Properties</CardTitle>
                <CardDescription>Based on revenue and occupancy rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {propertyComparison.slice(0, 3).map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{property.name}</h4>
                        <p className="text-xs text-muted-foreground">{property.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          ${(property.monthlyRevenue / 1000).toFixed(0)}K/mo
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {property.occupancy}% occupied
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Platform usage and key events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New property added</p>
                      <p className="text-xs text-muted-foreground">Riverside Condos - 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment processed</p>
                      <p className="text-xs text-muted-foreground">$12,500 rent collection - 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Maintenance request</p>
                      <p className="text-xs text-muted-foreground">Unit 2B - plumbing issue - 6 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New tenant registered</p>
                      <p className="text-xs text-muted-foreground">Unit 5A - Garden View - 8 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Property Comparison</CardTitle>
              <CardDescription>Performance metrics across all properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {propertyComparison.map((property) => (
                  <div key={property.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{property.name}</h4>
                        <p className="text-sm text-muted-foreground">{property.location}</p>
                      </div>
                      {getPerformanceBadge(property.performance)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{property.units}</div>
                        <div className="text-muted-foreground">Units</div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-600">{property.occupancy}%</div>
                        <div className="text-muted-foreground">Occupied</div>
                      </div>
                      <div>
                        <div className="font-medium text-green-600">
                          ${(property.monthlyRevenue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-muted-foreground">Revenue</div>
                      </div>
                      <div>
                        <div className="font-medium text-purple-600">{property.profitMargin}%</div>
                        <div className="text-muted-foreground">Profit</div>
                      </div>
                      <div>
                        <div className="font-medium text-orange-600">{property.maintenanceRequests}</div>
                        <div className="text-muted-foreground">Requests</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Activity by Role</CardTitle>
                <CardDescription>Active users and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userActivity.map((activity) => (
                    <div key={activity.role} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">{activity.role}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.active} of {activity.count} active
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {Math.round((activity.active / activity.count) * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last: {activity.lastLogin}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth Trends</CardTitle>
                <CardDescription>New registrations and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">+23</div>
                    <div className="text-sm text-muted-foreground">New users this month</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">12</div>
                      <div className="text-xs text-muted-foreground">Owners</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">3</div>
                      <div className="text-xs text-muted-foreground">Agents</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">8</div>
                      <div className="text-xs text-muted-foreground">Tenants</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Storage Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {systemMetrics.dataStorage.used} / {systemMetrics.dataStorage.total} {systemMetrics.dataStorage.unit}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(systemMetrics.dataStorage.used / systemMetrics.dataStorage.total) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">API Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{systemMetrics.apiCalls.monthly.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {systemMetrics.apiCalls.daily.toLocaleString()} calls today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{systemMetrics.responseTime.avg}{systemMetrics.responseTime.unit}</div>
                <p className="text-xs text-muted-foreground">
                  P95: {systemMetrics.responseTime.p95}{systemMetrics.responseTime.unit}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">System Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">{systemMetrics.uptime.current}%</div>
                <p className="text-xs text-muted-foreground">
                  Monthly avg: {systemMetrics.uptime.monthly}%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Zimbabwe Tab */}
        <TabsContent value="zimbabwe" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Currency Analysis</span>
                </CardTitle>
                <CardDescription>USD vs ZWL revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">USD Revenue:</span>
                    <span className="text-lg font-bold text-green-600">
                      ${(zimbabweMetrics.usdRevenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">ZWL Revenue:</span>
                    <span className="text-lg font-bold text-blue-600">
                      Z${(zimbabweMetrics.zwlRevenue / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Exchange Rate:</span>
                    <span className="text-sm">1 USD = {zimbabweMetrics.exchangeRate.toLocaleString()} ZWL</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Transaction distribution by method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Mobile Money:</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{zimbabweMetrics.mobileMoneyTransactions}</div>
                      <div className="text-xs text-muted-foreground">52.6%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Bank Transfers:</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{zimbabweMetrics.bankTransfers}</div>
                      <div className="text-xs text-muted-foreground">37.8%</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cash Payments:</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{zimbabweMetrics.cashPayments}</div>
                      <div className="text-xs text-muted-foreground">10.4%</div>
                    </div>
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