'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, PieChart, FileBarChart } from 'lucide-react';
import { mockFinancialSummary } from '@/lib/data/mock-reports-data';

interface FinancialReportsProps {
  userRole: string;
}

export default function FinancialReports({ userRole }: FinancialReportsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Financial Reports</h3>
        <Badge variant="secondary">
          {userRole === 'admin' ? 'Platform-Wide' : 'Property Portfolio'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Income Statement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Revenue</span>
                <span className="font-medium">${mockFinancialSummary.totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Operating Expenses</span>
                <span className="font-medium">${mockFinancialSummary.operatingExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Net Income</span>
                <span className="text-green-600">${mockFinancialSummary.netIncome.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Cash Flow</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">
              ${mockFinancialSummary.cashFlow.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Positive cash flow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Gross Margin</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {(mockFinancialSummary.grossMargin * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Above industry average</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}