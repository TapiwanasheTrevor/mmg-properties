'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Building, 
  Users, 
  DollarSign, 
  Target,
  AlertCircle,
  CheckCircle,
  Crown,
  Globe,
  Zap,
  Award
} from 'lucide-react';

import { 
  mockPlatformMetrics,
  mockPropertyPerformance,
  mockFinancialSummary,
  mockZimbabweMetrics,
  mockRevenueChartData
} from '@/lib/data/mock-reports-data';

export default function ExecutiveOverview() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Calculate platform-wide KPIs
  const totalPortfolioValue = mockPropertyPerformance.reduce(
    (sum, property) => sum + (property.monthlyRevenue * 12 / 0.08), 0
  );
  
  const averageROI = mockPropertyPerformance.reduce(
    (sum, property) => sum + property.roiPercentage, 0
  ) / mockPropertyPerformance.length;

  const platformHealthScore = Math.round(
    (mockPlatformMetrics.occupancyRate + 
     (mockFinancialSummary.grossMargin * 100) + 
     (averageROI * 10)) / 3
  );

  return (
    <div className="space-y-6">
      {/* Executive Summary Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Executive Dashboard</h2>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Platform Overview
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              ${mockFinancialSummary.totalIncome.toLocaleString()}
            </div>
            <div className="text-sm opacity-90">Total Annual Revenue</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">{mockPlatformMetrics.totalProperties}</div>
            <div className="text-sm opacity-90">Total Properties</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">{mockPlatformMetrics.totalUnits}</div>
            <div className="text-sm opacity-90">Total Units</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">{mockPlatformMetrics.occupancyRate}%</div>
            <div className="text-sm opacity-90">Occupancy Rate</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-2xl font-bold">{platformHealthScore}%</div>
            <div className="text-sm opacity-90">Platform Health</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="market">Market Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Strategic Goals Progress</span>
                </CardTitle>
                <CardDescription>Track progress against annual targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Revenue Target</span>
                    <span>85% Complete</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    $2.25M of $2.65M annual target
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Occupancy Target</span>
                    <span>91% Complete</span>
                  </div>
                  <Progress value={91} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    91% current vs 93% target occupancy
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Portfolio Expansion</span>
                    <span>68% Complete</span>
                  </div>
                  <Progress value={68} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    25 of 37 target properties acquired
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Top Performing Properties</span>
                </CardTitle>
                <CardDescription>Properties exceeding performance benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPropertyPerformance
                    .sort((a, b) => b.roiPercentage - a.roiPercentage)
                    .slice(0, 3)
                    .map((property, index) => (
                    <div key={property.propertyId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium">{property.propertyName}</div>
                          <div className="text-sm text-muted-foreground">
                            {property.occupancyRate}% Occupancy
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {property.roiPercentage}% ROI
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${property.monthlyRevenue.toLocaleString()}/mo
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>Executive Alerts</span>
              </CardTitle>
              <CardDescription>Items requiring executive attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Market Rent Analysis Needed</div>
                    <div className="text-sm text-muted-foreground">
                      3 properties showing below-market rent. Potential $15K annual revenue opportunity.
                    </div>
                  </div>
                  <Badge variant="secondary">High Priority</Badge>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Q3 Targets Exceeded</div>
                    <div className="text-sm text-muted-foreground">
                      Platform revenue exceeded Q3 targets by 12.5%. Consider expanding operations.
                    </div>
                  </div>
                  <Badge variant="secondary">Success</Badge>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Tenant Satisfaction Rising</div>
                    <div className="text-sm text-muted-foreground">
                      Average tenant satisfaction up 0.3 points to 4.2/5. Maintenance improvements paying off.
                    </div>
                  </div>
                  <Badge variant="secondary">Positive</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
                <CardDescription>Overall financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${mockFinancialSummary.netIncome.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mb-4">Net Income YTD</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Gross Margin</span>
                    <span className="font-medium">{(mockFinancialSummary.grossMargin * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Operating Ratio</span>
                    <span className="font-medium">
                      {((mockFinancialSummary.operatingExpenses / mockFinancialSummary.totalIncome) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cash Flow</span>
                    <span className="font-medium text-green-600">
                      ${mockFinancialSummary.cashFlow.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value</CardTitle>
                <CardDescription>Total asset valuation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  ${totalPortfolioValue.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mb-4">Estimated Portfolio Value</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average ROI</span>
                    <span className="font-medium">{averageROI.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cap Rate</span>
                    <span className="font-medium">8.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Appreciation YoY</span>
                    <span className="font-medium text-green-600">+15.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Platform expansion indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  +{mockPlatformMetrics.monthlyGrowth}%
                </div>
                <p className="text-sm text-muted-foreground mb-4">Monthly Growth Rate</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>New Properties</span>
                    <span className="font-medium">+2 this month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Revenue Growth</span>
                    <span className="font-medium text-green-600">+18.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Market Share</span>
                    <span className="font-medium">12.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          {/* Operations content would go here */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Operational Excellence</span>
              </CardTitle>
              <CardDescription>Platform operational performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">96.5%</div>
                  <div className="text-sm text-muted-foreground">Compliance Score</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">4.2 days</div>
                  <div className="text-sm text-muted-foreground">Avg. Resolution Time</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">94%</div>
                  <div className="text-sm text-muted-foreground">Tenant Satisfaction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          {/* Zimbabwe Market Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Zimbabwe Market Intelligence</span>
              </CardTitle>
              <CardDescription>Local market insights and competitive analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Currency Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>USD Transactions</span>
                      <span className="font-medium">{mockZimbabweMetrics.usdVsZwlRatio.usdTransactions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ZWL Transactions</span>
                      <span className="font-medium">{mockZimbabweMetrics.usdVsZwlRatio.zwlTransactions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Exchange Rate</span>
                      <span className="font-medium">
                        1 USD = {mockZimbabweMetrics.usdVsZwlRatio.exchangeRate.toLocaleString()} ZWL
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Market Position</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Above Market Rate</span>
                      <span className="font-medium text-green-600">
                        {mockZimbabweMetrics.localMarketData.competitorAnalysis.aboveMarket}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>At Market Rate</span>
                      <span className="font-medium">
                        {mockZimbabweMetrics.localMarketData.competitorAnalysis.atMarket}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Below Market Rate</span>
                      <span className="font-medium text-amber-600">
                        {mockZimbabweMetrics.localMarketData.competitorAnalysis.belowMarket}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}