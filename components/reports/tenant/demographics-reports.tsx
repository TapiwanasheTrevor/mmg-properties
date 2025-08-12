'use client';

import { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CreditCard,
  Star,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  FileText,
  Phone
} from 'lucide-react';

interface TenantReportsProps {
  user: User;
}

export function TenantReports({ user }: TenantReportsProps) {
  // Tenant data based on user role
  const getTenantData = (userRole: string) => {
    if (userRole === 'admin') {
      return {
        totalTenants: 285,
        activeTenants: 267,
        newTenants: 12,
        leavingTenants: 8,
        scope: 'All Tenants'
      };
    } else if (userRole === 'owner') {
      return {
        totalTenants: 78,
        activeTenants: 74,
        newTenants: 3,
        leavingTenants: 2,
        scope: 'Your Properties'
      };
    } else {
      return {
        totalTenants: 63,
        activeTenants: 61,
        newTenants: 4,
        leavingTenants: 1,
        scope: 'Managed Properties'
      };
    }
  };

  const tenantData = getTenantData(user.role);

  // Demographics breakdown
  const demographics = {
    ageGroups: [
      { range: '18-25', count: 45, percentage: 15.8 },
      { range: '26-35', count: 128, percentage: 44.9 },
      { range: '36-45', count: 78, percentage: 27.4 },
      { range: '46-55', count: 24, percentage: 8.4 },
      { range: '55+', count: 10, percentage: 3.5 }
    ],
    occupations: [
      { type: 'Corporate Professional', count: 156, percentage: 54.7 },
      { type: 'Entrepreneur', count: 45, percentage: 15.8 },
      { type: 'Civil Servant', count: 38, percentage: 13.3 },
      { type: 'Healthcare Worker', count: 22, percentage: 7.7 },
      { type: 'Education', count: 16, percentage: 5.6 },
      { type: 'Other', count: 8, percentage: 2.8 }
    ],
    familySize: [
      { size: '1 (Single)', count: 89, percentage: 31.2 },
      { size: '2 (Couple)', count: 112, percentage: 39.3 },
      { size: '3-4 (Small Family)', count: 64, percentage: 22.5 },
      { size: '5+ (Large Family)', count: 20, percentage: 7.0 }
    ],
    incomeRanges: [
      { range: '$2,000 - $3,000', count: 68, percentage: 23.9 },
      { range: '$3,001 - $5,000', count: 124, percentage: 43.5 },
      { range: '$5,001 - $7,500', count: 64, percentage: 22.5 },
      { range: '$7,501+', count: 29, percentage: 10.2 }
    ]
  };

  // Payment performance data
  const paymentPerformance = {
    onTimePayments: 268,
    latePayments: 17,
    totalPayments: 285,
    onTimeRate: 94.0,
    averageDaysLate: 8.5,
    totalOutstanding: 28400,
    paymentMethods: [
      { method: 'Mobile Money', count: 156, percentage: 54.7 },
      { method: 'Bank Transfer', count: 89, percentage: 31.2 },
      { method: 'Cash', count: 31, percentage: 10.9 },
      { method: 'Other', count: 9, percentage: 3.2 }
    ],
    riskCategories: [
      { category: 'Low Risk', count: 234, percentage: 82.1, color: 'text-green-600' },
      { category: 'Medium Risk', count: 38, percentage: 13.3, color: 'text-yellow-600' },
      { category: 'High Risk', count: 13, percentage: 4.6, color: 'text-red-600' }
    ]
  };

  // Lease management data
  const leaseManagement = {
    totalLeases: 285,
    activeLeases: 267,
    expiringThisMonth: 12,
    expiringNext3Months: 34,
    renewalRate: 78.5,
    averageTenancy: 2.3, // years
    tenancyDistribution: [
      { duration: '< 6 months', count: 28, percentage: 9.8 },
      { duration: '6-12 months', count: 45, percentage: 15.8 },
      { duration: '1-2 years', count: 112, percentage: 39.3 },
      { duration: '2-3 years', count: 67, percentage: 23.5 },
      { duration: '3+ years', count: 33, percentage: 11.6 }
    ],
    leaseTypes: [
      { type: 'Fixed Term (12 months)', count: 178, percentage: 62.5 },
      { type: 'Fixed Term (24 months)', count: 67, percentage: 23.5 },
      { type: 'Month-to-Month', count: 28, percentage: 9.8 },
      { type: 'Corporate Lease', count: 12, percentage: 4.2 }
    ]
  };

  // Satisfaction and feedback data
  const satisfactionData = {
    overallSatisfaction: 4.2,
    responseRate: 68.4,
    totalResponses: 195,
    categories: [
      { category: 'Property Condition', rating: 4.3, responses: 189 },
      { category: 'Maintenance Response', rating: 4.1, responses: 185 },
      { category: 'Communication', rating: 4.4, responses: 192 },
      { category: 'Value for Money', rating: 4.0, responses: 188 },
      { category: 'Neighborhood', rating: 4.5, responses: 194 }
    ],
    netPromoterScore: 67,
    complaintsResolved: 94.2,
    averageResolutionTime: 3.2 // days
  };

  // Tenant behavior patterns
  const behaviorPatterns = {
    maintenanceRequests: {
      total: 142,
      perTenant: 0.5,
      categories: [
        { type: 'Plumbing', count: 45, percentage: 31.7 },
        { type: 'Electrical', count: 28, percentage: 19.7 },
        { type: 'HVAC', count: 23, percentage: 16.2 },
        { type: 'Appliances', count: 19, percentage: 13.4 },
        { type: 'Other', count: 27, percentage: 19.0 }
      ]
    },
    communicationPreferences: [
      { method: 'Email', count: 167, percentage: 58.6 },
      { method: 'SMS/WhatsApp', count: 89, percentage: 31.2 },
      { method: 'Phone Call', count: 20, percentage: 7.0 },
      { method: 'In-Person', count: 9, percentage: 3.2 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-purple-500" />
            <span>Tenant Analytics</span>
          </h2>
          <p className="text-muted-foreground">{tenantData.scope} - Demographics, behavior, and performance insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tenants</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="new">New Tenants</SelectItem>
              <SelectItem value="expiring">Expiring Leases</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenantData.totalTenants}</div>
            <p className="text-xs text-muted-foreground">
              {tenantData.activeTenants} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paymentPerformance.onTimeRate}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {satisfactionData.overallSatisfaction}/5
            </div>
            <p className="text-xs text-muted-foreground">
              {satisfactionData.responseRate}% response rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewal Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {leaseManagement.renewalRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Avg {leaseManagement.averageTenancy} years tenancy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="demographics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="leases">Leases</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
        </TabsList>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Age Distribution</CardTitle>
                <CardDescription>Tenant age groups breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demographics.ageGroups.map((group, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{group.range} years</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${group.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {group.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Occupations</CardTitle>
                <CardDescription>Professional backgrounds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demographics.occupations.map((occupation, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{occupation.type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${occupation.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {occupation.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Family Size</CardTitle>
                <CardDescription>Household composition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demographics.familySize.map((size, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{size.size}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${size.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {size.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Income Ranges</CardTitle>
                <CardDescription>Monthly income distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demographics.incomeRanges.map((income, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{income.range}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${income.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {income.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Performance</CardTitle>
                <CardDescription>On-time payment analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {paymentPerformance.onTimeRate}%
                    </div>
                    <p className="text-sm text-muted-foreground">On-Time Payment Rate</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        {paymentPerformance.onTimePayments}
                      </div>
                      <div className="text-xs text-muted-foreground">On Time</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">
                        {paymentPerformance.latePayments}
                      </div>
                      <div className="text-xs text-muted-foreground">Late</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-orange-600">
                        {paymentPerformance.averageDaysLate}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Days Late</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Total Outstanding:</span>
                      <span className="text-lg font-bold text-red-600">
                        ${paymentPerformance.totalOutstanding.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
                <CardDescription>Preferred payment channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentPerformance.paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{method.method}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${method.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {method.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Risk Assessment</CardTitle>
                <CardDescription>Tenant payment risk categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {paymentPerformance.riskCategories.map((risk, index) => (
                    <div key={index} className={`p-4 border rounded-lg text-center ${
                      risk.category === 'Low Risk' ? 'bg-green-50 border-green-200' :
                      risk.category === 'Medium Risk' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className={`text-2xl font-bold ${risk.color} mb-2`}>
                        {risk.count}
                      </div>
                      <div className="text-sm font-medium mb-1">{risk.category}</div>
                      <div className="text-xs text-muted-foreground">{risk.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leases Tab */}
        <TabsContent value="leases" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lease Expiration Tracking</CardTitle>
                <CardDescription>Upcoming expirations and renewals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {leaseManagement.expiringThisMonth}
                      </div>
                      <p className="text-sm text-orange-700">This Month</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {leaseManagement.expiringNext3Months}
                      </div>
                      <p className="text-sm text-yellow-700">Next 3 Months</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Renewal Rate:</span>
                      <span className="text-xl font-bold text-green-600">
                        {leaseManagement.renewalRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Average Tenancy:</span>
                      <span className="font-medium">{leaseManagement.averageTenancy} years</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tenancy Duration</CardTitle>
                <CardDescription>Length of tenant relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaseManagement.tenancyDistribution.map((duration, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{duration.duration}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${duration.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {duration.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Lease Types</CardTitle>
                <CardDescription>Distribution of lease agreements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {leaseManagement.leaseTypes.map((type, index) => (
                    <div key={index} className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-semibold">{type.count}</div>
                      <div className="text-sm font-medium mb-1">{type.type}</div>
                      <div className="text-xs text-muted-foreground">{type.percentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Satisfaction Tab */}
        <TabsContent value="satisfaction" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Satisfaction</CardTitle>
                <CardDescription>Tenant satisfaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {satisfactionData.overallSatisfaction}/5
                    </div>
                    <p className="text-sm text-muted-foreground">Overall Rating</p>
                    <div className="text-sm text-muted-foreground mt-1">
                      Based on {satisfactionData.totalResponses} responses ({satisfactionData.responseRate}% rate)
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {satisfactionData.categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= category.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {category.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Quality</CardTitle>
                <CardDescription>Response and resolution metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {satisfactionData.netPromoterScore}
                    </div>
                    <p className="text-sm text-green-700">Net Promoter Score</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Complaints Resolved:</span>
                      <span className="font-medium text-green-600">
                        {satisfactionData.complaintsResolved}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Avg Resolution Time:</span>
                      <span className="font-medium">
                        {satisfactionData.averageResolutionTime} days
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Maintenance Requests</CardTitle>
                <CardDescription>Request patterns and categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {behaviorPatterns.maintenanceRequests.total}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Requests ({behaviorPatterns.maintenanceRequests.perTenant} per tenant)
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {behaviorPatterns.maintenanceRequests.categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.type}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {category.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Communication Preferences</CardTitle>
                <CardDescription>Preferred contact methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {behaviorPatterns.communicationPreferences.map((pref, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {pref.method === 'Email' && <FileText className="w-4 h-4 text-blue-600" />}
                        {pref.method === 'SMS/WhatsApp' && <Phone className="w-4 h-4 text-green-600" />}
                        {pref.method === 'Phone Call' && <Phone className="w-4 h-4 text-orange-600" />}
                        {pref.method === 'In-Person' && <Users className="w-4 h-4 text-purple-600" />}
                        <span className="text-sm font-medium">{pref.method}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{pref.count}</div>
                        <div className="text-xs text-muted-foreground">{pref.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}