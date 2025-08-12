'use client';

import { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Users,
  DollarSign,
  Home,
  MapPin,
  BarChart3,
  Target,
  Clock,
  AlertCircle
} from 'lucide-react';

interface PropertyAnalyticsProps {
  user: User;
}

export function PropertyAnalytics({ user }: PropertyAnalyticsProps) {
  // Property data based on user role
  const getPropertyData = (userRole: string) => {
    if (userRole === 'admin') {
      return {
        totalProperties: 47,
        totalUnits: 312,
        averageOccupancy: 91.3,
        averageRent: 1850,
        scope: 'All Properties'
      };
    } else if (userRole === 'owner') {
      return {
        totalProperties: 12,
        totalUnits: 89,
        averageOccupancy: 88.7,
        averageRent: 1920,
        scope: 'Your Properties'
      };
    } else {
      return {
        totalProperties: 8,
        totalUnits: 67,
        averageOccupancy: 94.2,
        averageRent: 1780,
        scope: 'Managed Properties'
      };
    }
  };

  const propertyData = getPropertyData(user.role);

  // Individual property performance
  const propertyPerformance = [
    {
      id: '1',
      name: 'Sunset Apartments Complex',
      location: 'Harare CBD',
      type: 'Residential',
      units: 45,
      occupiedUnits: 43,
      occupancyRate: 95.6,
      monthlyRevenue: 85000,
      averageRent: 1980,
      maintenanceRequests: 12,
      tenantSatisfaction: 4.8,
      marketValue: 2850000,
      performance: 'excellent',
      trends: {
        occupancy: '+2.1%',
        rent: '+5.8%',
        revenue: '+8.2%'
      }
    },
    {
      id: '2',
      name: 'Garden View Residences',
      location: 'Borrowdale',
      type: 'Residential',
      units: 32,
      occupiedUnits: 28,
      occupancyRate: 87.5,
      monthlyRevenue: 67200,
      averageRent: 2400,
      maintenanceRequests: 8,
      tenantSatisfaction: 4.6,
      marketValue: 3200000,
      performance: 'good',
      trends: {
        occupancy: '+1.5%',
        rent: '+3.2%',
        revenue: '+4.1%'
      }
    },
    {
      id: '3',
      name: 'Downtown Commercial Center',
      location: 'Harare CBD',
      type: 'Commercial',
      units: 28,
      occupiedUnits: 26,
      occupancyRate: 92.9,
      monthlyRevenue: 124000,
      averageRent: 4770,
      maintenanceRequests: 15,
      tenantSatisfaction: 4.2,
      marketValue: 5100000,
      performance: 'good',
      trends: {
        occupancy: '-0.8%',
        rent: '+2.1%',
        revenue: '+1.8%'
      }
    },
    {
      id: '4',
      name: 'Riverside Homes',
      location: 'Mount Pleasant',
      type: 'Residential',
      units: 18,
      occupiedUnits: 15,
      occupancyRate: 83.3,
      monthlyRevenue: 32400,
      averageRent: 2160,
      maintenanceRequests: 6,
      tenantSatisfaction: 4.4,
      marketValue: 1850000,
      performance: 'average',
      trends: {
        occupancy: '-2.3%',
        rent: '+1.8%',
        revenue: '-1.2%'
      }
    }
  ];

  // Occupancy analysis
  const occupancyAnalysis = {
    currentMonth: 91.3,
    previousMonth: 89.7,
    yearAverage: 88.5,
    benchmarkComparison: {
      industryAverage: 85.2,
      localMarket: 82.8,
      topQuartile: 94.5
    },
    vacancy: {
      totalVacant: 27,
      averageDaysVacant: 18,
      leasingPipeline: 12,
      showingScheduled: 8
    }
  };

  // Rental performance
  const rentalPerformance = {
    averageRent: 1850,
    marketRate: 1920,
    rentGrowth: {
      monthlyGrowth: 2.1,
      yearlyGrowth: 8.5,
      fiveYearCAGR: 6.2
    },
    rentRoll: {
      scheduledRent: 578400,
      collectedRent: 562800,
      collectionRate: 97.3
    }
  };

  // Market analysis
  const marketAnalysis = {
    propertyValues: {
      totalValue: 18500000,
      averagePerUnit: 59295,
      appreciationRate: 7.8
    },
    comparableProperties: [
      { name: 'Central Plaza', avgRent: 2100, occupancy: 88.2, location: 'CBD' },
      { name: 'Heritage Court', avgRent: 1750, occupancy: 92.1, location: 'Borrowdale' },
      { name: 'Park View', avgRent: 1950, occupancy: 85.4, location: 'Mount Pleasant' }
    ],
    marketTrends: {
      demandIndex: 112,  // 100 = baseline
      supplyIndex: 95,
      priceGrowthRate: 6.8,
      forecast: 'positive'
    }
  };

  const getPerformanceBadge = (performance: string) => {
    const variants = {
      excellent: 'default',
      good: 'secondary',
      average: 'outline',
      poor: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[performance as keyof typeof variants] || 'outline'} className="capitalize">
        {performance}
      </Badge>
    );
  };

  const getTrendIcon = (trend: string) => {
    if (trend.startsWith('+')) {
      return <TrendingUp className="w-3 h-3 text-green-600" />;
    } else if (trend.startsWith('-')) {
      return <TrendingDown className="w-3 h-3 text-red-600" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-blue-500" />
            <span>Property Analytics</span>
          </h2>
          <p className="text-muted-foreground">{propertyData.scope} - Performance metrics and market analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="residential">Residential Only</SelectItem>
              <SelectItem value="commercial">Commercial Only</SelectItem>
              <SelectItem value="mixed">Mixed Use</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyData.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {propertyData.totalUnits} total units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {propertyData.averageOccupancy}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +1.6% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${propertyData.averageRent}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +3.2% year over year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${(marketAnalysis.propertyValues.totalValue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{marketAnalysis.propertyValues.appreciationRate}% appreciation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="rental">Rental Analysis</TabsTrigger>
          <TabsTrigger value="market">Market Comparison</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4 mt-6">
          <div className="space-y-4">
            {propertyPerformance.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Home className="w-5 h-5" />
                        <span>{property.name}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{property.location} • {property.type}</span>
                      </CardDescription>
                    </div>
                    {getPerformanceBadge(property.performance)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Occupancy</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {property.occupancyRate}%
                      </div>
                      <div className="text-xs flex items-center">
                        {getTrendIcon(property.trends.occupancy)}
                        <span className={property.trends.occupancy.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                          {property.trends.occupancy}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Units</div>
                      <div className="text-lg font-semibold">
                        {property.occupiedUnits}/{property.units}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {property.units - property.occupiedUnits} vacant
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Revenue</div>
                      <div className="text-lg font-semibold text-green-600">
                        ${property.monthlyRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs flex items-center">
                        {getTrendIcon(property.trends.revenue)}
                        <span className={property.trends.revenue.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                          {property.trends.revenue}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Avg Rent</div>
                      <div className="text-lg font-semibold">
                        ${property.averageRent}
                      </div>
                      <div className="text-xs flex items-center">
                        {getTrendIcon(property.trends.rent)}
                        <span className={property.trends.rent.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                          {property.trends.rent}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Maintenance</div>
                      <div className="text-lg font-semibold text-orange-600">
                        {property.maintenanceRequests}
                      </div>
                      <div className="text-xs text-muted-foreground">requests</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Satisfaction</div>
                      <div className="text-lg font-semibold text-purple-600">
                        {property.tenantSatisfaction}/5
                      </div>
                      <div className="text-xs text-muted-foreground">tenant rating</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Value</div>
                      <div className="text-lg font-semibold">
                        ${(property.marketValue / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-xs text-muted-foreground">market value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Occupancy Tab */}
        <TabsContent value="occupancy" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Occupancy Overview</CardTitle>
                <CardDescription>Current occupancy rates and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {occupancyAnalysis.currentMonth}%
                    </div>
                    <p className="text-sm text-muted-foreground">Current Month</p>
                    <div className="flex items-center justify-center mt-2">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                      <span className="text-sm text-green-600">
                        +{(occupancyAnalysis.currentMonth - occupancyAnalysis.previousMonth).toFixed(1)}% from last month
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Year Average:</span>
                      <span className="font-medium">{occupancyAnalysis.yearAverage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Industry Average:</span>
                      <span className="font-medium">{occupancyAnalysis.benchmarkComparison.industryAverage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Local Market:</span>
                      <span className="font-medium">{occupancyAnalysis.benchmarkComparison.localMarket}%</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Performance vs Market:</span>
                      <span className="font-bold text-green-600">
                        +{(occupancyAnalysis.currentMonth - occupancyAnalysis.benchmarkComparison.localMarket).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vacancy Analysis</CardTitle>
                <CardDescription>Vacant units and leasing pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {occupancyAnalysis.vacancy.totalVacant}
                      </div>
                      <p className="text-sm text-red-700">Vacant Units</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {occupancyAnalysis.vacancy.averageDaysVacant}
                      </div>
                      <p className="text-sm text-orange-700">Avg Days Vacant</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Leasing Pipeline:</span>
                      <Badge variant="outline">
                        {occupancyAnalysis.vacancy.leasingPipeline} prospects
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Showings Scheduled:</span>
                      <Badge variant="secondary">
                        {occupancyAnalysis.vacancy.showingScheduled} this week
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rental Analysis Tab */}
        <TabsContent value="rental" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rental Performance</CardTitle>
                <CardDescription>Rent rates and growth analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Rent:</span>
                    <span className="text-xl font-bold text-green-600">
                      ${rentalPerformance.averageRent}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Market Rate:</span>
                    <span className="font-medium">${rentalPerformance.marketRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Premium to Market:</span>
                    <span className={`font-medium ${rentalPerformance.averageRent < rentalPerformance.marketRate ? 'text-red-600' : 'text-green-600'}`}>
                      {rentalPerformance.averageRent < rentalPerformance.marketRate ? '-' : '+'}
                      ${Math.abs(rentalPerformance.averageRent - rentalPerformance.marketRate)}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-sm">Growth Rates:</h4>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly:</span>
                      <span className="text-green-600">+{rentalPerformance.rentGrowth.monthlyGrowth}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Yearly:</span>
                      <span className="text-green-600">+{rentalPerformance.rentGrowth.yearlyGrowth}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">5-Year CAGR:</span>
                      <span className="text-blue-600">{rentalPerformance.rentGrowth.fiveYearCAGR}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rent Roll Analysis</CardTitle>
                <CardDescription>Collection performance and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {rentalPerformance.rentRoll.collectionRate}%
                    </div>
                    <p className="text-sm text-muted-foreground">Collection Rate</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Scheduled Rent:</span>
                      <span className="font-medium">
                        ${rentalPerformance.rentRoll.scheduledRent.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Collected Rent:</span>
                      <span className="font-medium text-green-600">
                        ${rentalPerformance.rentRoll.collectedRent.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Outstanding:</span>
                      <span className="font-medium text-red-600">
                        ${(rentalPerformance.rentRoll.scheduledRent - rentalPerformance.rentRoll.collectedRent).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Market Comparison Tab */}
        <TabsContent value="market" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Valuation</CardTitle>
                <CardDescription>Current market value and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      ${(marketAnalysis.propertyValues.totalValue / 1000000).toFixed(1)}M
                    </div>
                    <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Average per Unit:</span>
                      <span className="font-medium">
                        ${marketAnalysis.propertyValues.averagePerUnit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Annual Appreciation:</span>
                      <span className="font-medium text-green-600">
                        +{marketAnalysis.propertyValues.appreciationRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Comparison</CardTitle>
                <CardDescription>Comparable properties analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketAnalysis.comparableProperties.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{comp.name}</h4>
                        <p className="text-xs text-muted-foreground">{comp.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">${comp.avgRent}/mo</div>
                        <div className="text-xs text-muted-foreground">{comp.occupancy}% occ</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-3">Market Indicators</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Demand Index:</span>
                      <Badge variant={marketAnalysis.marketTrends.demandIndex > 100 ? 'default' : 'secondary'}>
                        {marketAnalysis.marketTrends.demandIndex}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Supply Index:</span>
                      <Badge variant={marketAnalysis.marketTrends.supplyIndex < 100 ? 'default' : 'secondary'}>
                        {marketAnalysis.marketTrends.supplyIndex}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Price Growth:</span>
                      <span className="text-green-600">+{marketAnalysis.marketTrends.priceGrowthRate}%</span>
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