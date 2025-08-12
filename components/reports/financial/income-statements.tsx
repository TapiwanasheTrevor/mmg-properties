'use client';

import { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  Download,
  Calculator,
  Receipt,
  CreditCard,
  Wallet,
  Building2
} from 'lucide-react';

interface FinancialReportsSuiteProps {
  user: User;
}

export function FinancialReportsSuite({ user }: FinancialReportsSuiteProps) {
  // Financial data based on user role
  const getFinancialData = (userRole: string) => {
    if (userRole === 'admin') {
      return {
        totalRevenue: 2450000,
        totalExpenses: 425000,
        netProfit: 2025000,
        profitMargin: 82.7,
        properties: 47,
        scope: 'Platform-wide'
      };
    } else {
      return {
        totalRevenue: 485000,
        totalExpenses: 87000,
        netProfit: 398000,
        profitMargin: 82.1,
        properties: user.role === 'owner' ? 12 : 8,
        scope: user.role === 'owner' ? 'Your Properties' : 'Managed Properties'
      };
    }
  };

  const financialData = getFinancialData(user.role);

  // Income breakdown
  const incomeBreakdown = [
    { category: 'Rental Income', amount: 425000, percentage: 87.6, trend: '+5.2%' },
    { category: 'Late Fees', amount: 28000, percentage: 5.8, trend: '+12.1%' },
    { category: 'Application Fees', amount: 18500, percentage: 3.8, trend: '+8.7%' },
    { category: 'Pet Deposits', amount: 8900, percentage: 1.8, trend: '+3.2%' },
    { category: 'Other Income', amount: 4600, percentage: 0.9, trend: '-2.1%' }
  ];

  // Expense breakdown
  const expenseBreakdown = [
    { category: 'Maintenance & Repairs', amount: 32500, percentage: 37.4, trend: '+8.1%' },
    { category: 'Property Management', amount: 24200, percentage: 27.8, trend: '+2.3%' },
    { category: 'Insurance', amount: 12800, percentage: 14.7, trend: '+1.2%' },
    { category: 'Property Tax', amount: 8900, percentage: 10.2, trend: '+0.5%' },
    { category: 'Utilities', amount: 5400, percentage: 6.2, trend: '-1.8%' },
    { category: 'Legal & Professional', amount: 3200, percentage: 3.7, trend: '+15.2%' }
  ];

  // Monthly performance data
  const monthlyPerformance = [
    { month: 'Jan 2024', income: 45200, expenses: 8200, profit: 37000, margin: 81.8 },
    { month: 'Feb 2024', income: 47800, expenses: 7900, profit: 39900, margin: 83.5 },
    { month: 'Mar 2024', income: 46100, expenses: 9200, profit: 36900, margin: 80.0 },
    { month: 'Apr 2024', income: 48500, expenses: 8800, profit: 39700, margin: 81.9 },
    { month: 'May 2024', income: 49200, expenses: 7600, profit: 41600, margin: 84.6 },
    { month: 'Jun 2024', income: 50100, expenses: 8100, profit: 42000, margin: 83.8 }
  ];

  // Cash flow analysis
  const cashFlowAnalysis = {
    operatingCashFlow: 398000,
    investingCashFlow: -125000,
    financingCashFlow: -85000,
    netCashFlow: 188000,
    cashBalance: 456000,
    burnRate: 12500
  };

  // ROI calculations
  const roiMetrics = {
    totalInvestment: 2850000,
    annualReturn: 478000,
    roi: 16.8,
    cashOnCashReturn: 14.2,
    capRate: 8.9,
    irr: 18.5
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <span>Financial Reports</span>
          </h2>
          <p className="text-muted-foreground">{financialData.scope} - Income, expenses, and profitability analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <DatePickerWithRange />
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(financialData.totalRevenue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${(financialData.totalExpenses / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              -3.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${(financialData.netProfit / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +18.7% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {financialData.profitMargin}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across {financialData.properties} properties
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="profit-loss">P&L</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="roi">ROI & Metrics</TabsTrigger>
        </TabsList>

        {/* Income Statement Tab */}
        <TabsContent value="income" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Income Breakdown</CardTitle>
                <CardDescription>Revenue sources and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incomeBreakdown.map((income, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{income.category}</h4>
                        <p className="text-xs text-muted-foreground">{income.percentage}% of total</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          ${income.amount.toLocaleString()}
                        </div>
                        <div className={`text-xs ${income.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {income.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Income Trend</CardTitle>
                <CardDescription>Revenue performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyPerformance.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{month.month}</h4>
                        <p className="text-xs text-muted-foreground">
                          {month.margin}% profit margin
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          ${month.income.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          +{((month.income / 45000 - 1) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expense Categories</CardTitle>
                <CardDescription>Cost breakdown and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseBreakdown.map((expense, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{expense.category}</h4>
                        <p className="text-xs text-muted-foreground">{expense.percentage}% of total</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-600">
                          ${expense.amount.toLocaleString()}
                        </div>
                        <div className={`text-xs ${expense.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                          {expense.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expense Control Metrics</CardTitle>
                <CardDescription>Cost efficiency indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">Cost per Unit</span>
                      <span className="text-lg font-bold text-green-600">$285</span>
                    </div>
                    <p className="text-xs text-green-700">12% below market average</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800">Maintenance Ratio</span>
                      <span className="text-lg font-bold text-blue-600">6.7%</span>
                    </div>
                    <p className="text-xs text-blue-700">Of total revenue</p>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-purple-800">Operating Ratio</span>
                      <span className="text-lg font-bold text-purple-600">17.9%</span>
                    </div>
                    <p className="text-xs text-purple-700">Expenses to revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profit & Loss Tab */}
        <TabsContent value="profit-loss" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profit & Loss Statement</CardTitle>
              <CardDescription>Comprehensive financial performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-6">
                  {monthlyPerformance.map((month, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm mb-3">{month.month}</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Revenue:</span>
                          <span className="font-medium text-green-600">
                            ${month.income.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expenses:</span>
                          <span className="font-medium text-red-600">
                            ${month.expenses.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Net Profit:</span>
                            <span className="text-blue-600">
                              ${month.profit.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-center mt-1">
                            <Badge variant="outline" className="text-xs">
                              {month.margin}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cash-flow" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cash Flow Analysis</CardTitle>
                <CardDescription>Operating, investing, and financing activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="font-medium text-green-800">Operating Cash Flow</span>
                    <span className="text-lg font-bold text-green-600">
                      +${cashFlowAnalysis.operatingCashFlow.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="font-medium text-red-800">Investing Cash Flow</span>
                    <span className="text-lg font-bold text-red-600">
                      ${cashFlowAnalysis.investingCashFlow.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <span className="font-medium text-orange-800">Financing Cash Flow</span>
                    <span className="text-lg font-bold text-orange-600">
                      ${cashFlowAnalysis.financingCashFlow.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg border-2">
                    <span className="font-semibold text-blue-800">Net Cash Flow</span>
                    <span className="text-xl font-bold text-blue-600">
                      +${cashFlowAnalysis.netCashFlow.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cash Position</CardTitle>
                <CardDescription>Current balance and projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${cashFlowAnalysis.cashBalance.toLocaleString()}
                    </div>
                    <p className="text-sm text-blue-700">Current Cash Balance</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        ${cashFlowAnalysis.burnRate.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Monthly Burn Rate</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {Math.floor(cashFlowAnalysis.cashBalance / cashFlowAnalysis.burnRate)}mo
                      </div>
                      <p className="text-xs text-muted-foreground">Cash Runway</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ROI & Metrics Tab */}
        <TabsContent value="roi" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Return on Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{roiMetrics.roi}%</div>
                <p className="text-xs text-muted-foreground">Annual ROI</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cash-on-Cash Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{roiMetrics.cashOnCashReturn}%</div>
                <p className="text-xs text-muted-foreground">On invested capital</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cap Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{roiMetrics.capRate}%</div>
                <p className="text-xs text-muted-foreground">Capitalization rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Internal Rate of Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{roiMetrics.irr}%</div>
                <p className="text-xs text-muted-foreground">IRR projection</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Investment Analysis</CardTitle>
              <CardDescription>Detailed performance metrics and comparisons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Investment Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Investment:</span>
                      <span className="font-medium">${roiMetrics.totalInvestment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Annual Return:</span>
                      <span className="font-medium text-green-600">${roiMetrics.annualReturn.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">ROI Percentage:</span>
                      <span className="font-bold text-blue-600">{roiMetrics.roi}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Market Comparison</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">S&P 500 (10yr avg):</span>
                      <span className="font-medium">10.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Real Estate Index:</span>
                      <span className="font-medium">12.8%</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Your Performance:</span>
                      <span className="font-bold text-green-600">+{(roiMetrics.roi - 12.8).toFixed(1)}%</span>
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