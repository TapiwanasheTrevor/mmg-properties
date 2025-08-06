import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, TrendingUp, TrendingDown, DollarSign, Calendar, Building2, Users, Wrench } from "lucide-react"

export function FinancialReports() {
  const monthlyData = [
    { month: "Jan 2023", income: 45231, expenses: 8420, profit: 36811 },
    { month: "Feb 2023", income: 47890, expenses: 9200, profit: 38690 },
    { month: "Mar 2023", income: 46750, expenses: 7800, profit: 38950 },
    { month: "Apr 2023", income: 48200, expenses: 12300, profit: 35900 },
    { month: "May 2023", income: 49100, expenses: 8900, profit: 40200 },
    { month: "Jun 2023", income: 50200, expenses: 9500, profit: 40700 },
  ]

  const propertyPerformance = [
    { name: "Sunset Apartments", income: 18500, expenses: 3200, profit: 15300, occupancy: 95 },
    { name: "Downtown Complex", income: 15200, expenses: 2800, profit: 12400, occupancy: 88 },
    { name: "Garden View", income: 8900, expenses: 1500, profit: 7400, occupancy: 92 },
    { name: "Riverside Homes", income: 7600, expenses: 2100, profit: 5500, occupancy: 75 },
  ]

  const expenseBreakdown = [
    { category: "Maintenance", amount: 5200, percentage: 32 },
    { category: "Property Management", amount: 3800, percentage: 23 },
    { category: "Insurance", amount: 2400, percentage: 15 },
    { category: "Utilities", amount: 1900, percentage: 12 },
    { category: "Marketing", amount: 1200, percentage: 7 },
    { category: "Legal & Professional", amount: 800, percentage: 5 },
    { category: "Other", amount: 1000, percentage: 6 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground">Track income, expenses, and profitability</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="2023">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$287,373</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5% from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$56,120</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              -3.2% from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">$231,253</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +18.7% from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">80.5%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +4.2% from last year
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Income, expenses, and profit trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{month.month}</span>
                    <span className="text-sm text-muted-foreground">${month.profit.toLocaleString()} profit</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Income: ${month.income.toLocaleString()}</span>
                      <span className="text-red-600">Expenses: ${month.expenses.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(month.profit / month.income) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>Revenue and profitability by property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyPerformance.map((property, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{property.name}</h4>
                      <p className="text-sm text-muted-foreground">{property.occupancy}% occupied</p>
                    </div>
                    <Badge variant={property.profit > 10000 ? "default" : "secondary"}>
                      ${property.profit.toLocaleString()} profit
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Income: ${property.income.toLocaleString()}</span>
                      <span className="text-red-600">Expenses: ${property.expenses.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(property.profit / property.income) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Where your money is being spent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {expenseBreakdown.map((expense, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }} />
                    <span className="font-medium">{expense.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${expense.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{expense.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">$56K</div>
                    <div className="text-sm text-muted-foreground">Total Expenses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Report Actions</CardTitle>
          <CardDescription>Generate and export detailed reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Building2 className="w-6 h-6 mb-2" />
              Property Report
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Users className="w-6 h-6 mb-2" />
              Tenant Report
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <DollarSign className="w-6 h-6 mb-2" />
              Financial Summary
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Calendar className="w-6 h-6 mb-2" />
              Tax Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
