'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  Edit,
  Eye,
  Download,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { UserRole } from '@/lib/types';
import { Budget, Currency, CURRENCY_SYMBOLS } from '@/lib/types/financials';
import { mockBudgets, mockExpenseCategories, mockProperties } from '@/lib/data/mock-financial-data';

interface BudgetManagementProps {
  currency: Currency;
  userRole: UserRole;
  permissions: {
    canManageBudgets: boolean;
    canExportData: boolean;
  };
  selectedProperty: string;
}

export default function BudgetManagement({
  currency,
  userRole,
  permissions,
  selectedProperty,
}: BudgetManagementProps) {
  const [budgets] = useState<Budget[]>(mockBudgets);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showNewBudgetDialog, setShowNewBudgetDialog] = useState(false);
  const [showBudgetDetails, setShowBudgetDetails] = useState(false);

  const formatCurrency = (amount: number) => {
    return `${CURRENCY_SYMBOLS[currency]}${Math.abs(amount).toLocaleString()}`;
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance === 0) return 'text-gray-600';
    return variance > 0 ? 'text-red-600' : 'text-green-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance === 0) return <Target className="w-4 h-4" />;
    return variance > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getBudgetStatus = (budget: Budget) => {
    const today = new Date();
    const endDate = budget.endDate.toDate ? budget.endDate.toDate() : new Date(budget.endDate);
    
    if (budget.status === 'completed') return 'completed';
    if (budget.status === 'cancelled') return 'cancelled';
    if (endDate < today) return 'expired';
    
    return 'active';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      expired: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const calculateBudgetPerformance = (budget: Budget) => {
    const totalBudgeted = budget.totalBudgeted;
    const totalActual = budget.totalActual;
    const utilizationRate = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;
    
    return {
      utilizationRate,
      isOverBudget: totalActual > totalBudgeted,
      remainingBudget: totalBudgeted - totalActual,
      variance: totalActual - totalBudgeted,
      variancePercentage: totalBudgeted > 0 ? ((totalActual - totalBudgeted) / totalBudgeted) * 100 : 0,
    };
  };

  // Filter budgets based on selected property
  const filteredBudgets = budgets.filter(budget => 
    selectedProperty === 'all' || budget.propertyId === selectedProperty
  );

  // Calculate overall budget statistics
  const budgetStats = {
    total: filteredBudgets.length,
    active: filteredBudgets.filter(b => getBudgetStatus(b) === 'active').length,
    completed: filteredBudgets.filter(b => getBudgetStatus(b) === 'completed').length,
    overBudget: filteredBudgets.filter(b => calculateBudgetPerformance(b).isOverBudget).length,
    totalBudgeted: filteredBudgets.reduce((sum, b) => sum + b.totalBudgeted, 0),
    totalActual: filteredBudgets.reduce((sum, b) => sum + b.totalActual, 0),
  };

  const overallPerformance = calculateBudgetPerformance({
    totalBudgeted: budgetStats.totalBudgeted,
    totalActual: budgetStats.totalActual,
  } as Budget);

  if (!permissions.canManageBudgets) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              You don't have permission to manage budgets.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budget Management</h2>
          <p className="text-muted-foreground">
            Create, monitor, and analyze budgets for your properties
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {permissions.canExportData && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Budgets
            </Button>
          )}
          <Button onClick={() => setShowNewBudgetDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Budget
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Total Budgets</p>
                <p className="text-2xl font-bold text-blue-600">
                  {budgetStats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {budgetStats.active}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Total Budgeted</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(budgetStats.totalBudgeted)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Utilization</p>
                <p className={`text-2xl font-bold ${
                  overallPerformance.utilizationRate <= 100 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {overallPerformance.utilizationRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budgets List */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>
            Current budgets and their performance across your properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBudgets.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets found</h3>
              <p className="text-gray-600 mb-4">
                Create your first budget to start tracking expenses and performance.
              </p>
              <Button onClick={() => setShowNewBudgetDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBudgets.map((budget) => {
                const performance = calculateBudgetPerformance(budget);
                const status = getBudgetStatus(budget);
                const property = mockProperties.find(p => p.id === budget.propertyId);
                
                return (
                  <div
                    key={budget.id}
                    className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {/* Budget Header */}
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{budget.name}</h3>
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                          <Badge variant="outline">
                            {budget.period}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {property?.name} • {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                        </p>

                        {budget.description && (
                          <p className="text-sm text-gray-700 mb-3">{budget.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBudget(budget);
                            setShowBudgetDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>

                    {/* Budget Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-xs font-medium text-gray-600">Total Budgeted</span>
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(budget.totalBudgeted)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-gray-600">Actual Spent</span>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(budget.totalActual)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-gray-600">Remaining</span>
                        <p className={`text-lg font-bold ${
                          performance.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(performance.remainingBudget)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-xs font-medium text-gray-600">Variance</span>
                        <div className="flex items-center space-x-1">
                          {getVarianceIcon(performance.variance)}
                          <p className={`text-lg font-bold ${getVarianceColor(performance.variance)}`}>
                            {performance.variance >= 0 ? '+' : ''}
                            {formatCurrency(performance.variance)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Budget Utilization</span>
                        <span className={performance.utilizationRate > 100 ? 'text-red-600 font-bold' : ''}>
                          {performance.utilizationRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(performance.utilizationRate, 100)} 
                        className={`w-full ${performance.utilizationRate > 100 ? 'bg-red-100' : ''}`}
                      />
                      {performance.utilizationRate > 100 && (
                        <div className="flex items-center mt-1">
                          <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
                          <span className="text-xs text-red-600">Over budget by {(performance.utilizationRate - 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>

                    {/* Category Breakdown Preview */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Top Categories</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {Object.entries(budget.categories).slice(0, 3).map(([categoryId, data]) => {
                          const category = mockExpenseCategories.find(c => c.id === categoryId);
                          const utilizationRate = data.budgeted > 0 ? (data.actual / data.budgeted) * 100 : 0;
                          
                          return (
                            <div key={categoryId} className="bg-white border rounded p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium truncate">
                                  {category?.name || 'Unknown Category'}
                                </span>
                                <span className={`text-xs font-bold ${
                                  utilizationRate > 100 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {utilizationRate.toFixed(0)}%
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatCurrency(data.actual)} / {formatCurrency(data.budgeted)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Details Dialog */}
      {selectedBudget && showBudgetDetails && (
        <Dialog open={showBudgetDetails} onOpenChange={setShowBudgetDetails}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedBudget.name}</DialogTitle>
              <DialogDescription>
                Detailed budget breakdown and performance analysis
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Budget Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Total Budgeted</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedBudget.totalBudgeted)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Actual Spent</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedBudget.totalActual)}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 mb-1">Variance</p>
                  <p className={`text-2xl font-bold ${
                    selectedBudget.totalVariance >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {selectedBudget.totalVariance >= 0 ? '+' : ''}
                    {formatCurrency(selectedBudget.totalVariance)}
                  </p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div>
                <h4 className="font-medium mb-4">Category Breakdown</h4>
                <div className="space-y-3">
                  {Object.entries(selectedBudget.categories).map(([categoryId, data]) => {
                    const category = mockExpenseCategories.find(c => c.id === categoryId);
                    const utilizationRate = data.budgeted > 0 ? (data.actual / data.budgeted) * 100 : 0;
                    
                    return (
                      <div key={categoryId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">
                            {category?.name || 'Unknown Category'}
                          </h5>
                          <Badge className={utilizationRate > 100 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {utilizationRate.toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Budgeted:</span>
                            <p className="font-medium">{formatCurrency(data.budgeted)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Actual:</span>
                            <p className="font-medium">{formatCurrency(data.actual)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Variance:</span>
                            <p className={`font-medium ${
                              data.variance >= 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {data.variance >= 0 ? '+' : ''}{formatCurrency(data.variance)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Remaining:</span>
                            <p className={`font-medium ${
                              (data.budgeted - data.actual) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(data.budgeted - data.actual)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Progress value={Math.min(utilizationRate, 100)} className="w-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Budget Dialog */}
      <Dialog open={showNewBudgetDialog} onOpenChange={setShowNewBudgetDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
            <DialogDescription>
              Set up a new budget for monitoring expenses and performance
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-8">
            <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">
              Budget creation form would be implemented here with proper
              validation and category selection.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}