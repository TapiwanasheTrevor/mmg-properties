'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  CreditCard,
  AlertTriangle,
  Building,
  Users,
  Percent,
} from 'lucide-react';
import { FinancialMetrics, Currency, CURRENCY_SYMBOLS } from '@/lib/types/financials';

interface FinancialMetricsCardsProps {
  metrics: FinancialMetrics;
  currency: Currency;
  loading?: boolean;
}

export default function FinancialMetricsCards({
  metrics,
  currency,
  loading = false,
}: FinancialMetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return `${CURRENCY_SYMBOLS[currency]}${Math.abs(amount).toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <div className="ml-2">
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.totalIncome)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(metrics.totalExpenses)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Income */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-muted-foreground">Net Income</p>
              <p className={`text-2xl font-bold ${
                metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(metrics.netIncome)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Rate */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Percent className="h-4 w-4 text-purple-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-muted-foreground">Collection Rate</p>
              <p className={`text-2xl font-bold ${
                metrics.collectionRate >= 90 ? 'text-green-600' : 
                metrics.collectionRate >= 75 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatPercentage(metrics.collectionRate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rent Due */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 text-indigo-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-muted-foreground">Rent Due</p>
              <p className="text-2xl font-bold text-indigo-600">
                {formatCurrency(metrics.rentDue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rent Collected */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-muted-foreground">Rent Collected</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(metrics.rentCollected)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Amount */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <AlertTriangle className={`h-4 w-4 ${
              metrics.outstandingAmount > 0 ? 'text-yellow-600' : 'text-gray-400'
            }`} />
            <div className="ml-2">
              <p className="text-xs font-medium text-muted-foreground">Outstanding</p>
              <p className={`text-2xl font-bold ${
                metrics.outstandingAmount > 0 ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {formatCurrency(metrics.outstandingAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Occupancy Rate */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Building className="h-4 w-4 text-teal-600" />
            <div className="ml-2">
              <p className="text-xs font-medium text-muted-foreground">Occupancy Rate</p>
              <p className={`text-2xl font-bold ${
                metrics.occupancyRate >= 90 ? 'text-green-600' : 
                metrics.occupancyRate >= 75 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatPercentage(metrics.occupancyRate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}