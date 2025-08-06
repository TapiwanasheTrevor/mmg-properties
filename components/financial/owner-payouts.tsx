'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp,
  Calendar,
  Building,
  User,
  Download,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  Calculator,
  FileText
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Property, Transaction } from '@/lib/types';
import { getProperties } from '@/lib/services/properties';
import { getTransactions, getFinancialSummary } from '@/lib/services/transactions';

interface OwnerPayout {
  ownerId: string;
  ownerName: string;
  propertyId: string;
  propertyName: string;
  period: {
    from: Date;
    to: Date;
  };
  income: {
    rentPayments: number;
    deposits: number;
    total: number;
  };
  expenses: {
    maintenance: number;
    management: number;
    other: number;
    total: number;
  };
  fees: {
    mmgCommission: number;
    agentCommission: number;
    total: number;
  };
  netPayout: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  transactions: Transaction[];
  lastPayoutDate?: Date;
}

interface OwnerPayoutsProps {
  propertyId?: string;
  ownerId?: string;
}

export default function OwnerPayouts({ propertyId, ownerId }: OwnerPayoutsProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [payouts, setPayouts] = useState<OwnerPayout[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>(propertyId || 'all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current_month');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    calculatePayouts();
  }, [selectedProperty, selectedPeriod]);

  const loadInitialData = async () => {
    try {
      const propertiesResult = await getProperties();
      setProperties(propertiesResult.properties);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePayouts = async () => {
    setCalculating(true);
    setError('');

    try {
      const { dateFrom, dateTo } = getDateRange(selectedPeriod);
      const payoutsList: OwnerPayout[] = [];

      // Get properties to calculate payouts for
      const targetProperties = selectedProperty === 'all' 
        ? properties 
        : properties.filter(p => p.id === selectedProperty);

      for (const property of targetProperties) {
        // Get financial summary for this property
        const summary = await getFinancialSummary(property.id, dateFrom, dateTo);
        
        // Get detailed transactions
        const transactionsResult = await getTransactions({
          propertyId: property.id,
          dateFrom,
          dateTo,
          pageSize: 1000,
        });

        // Calculate owner payout
        const income = {
          rentPayments: summary.rentPayments,
          deposits: summary.deposits,
          total: summary.totalIncome,
        };

        const expenses = {
          maintenance: summary.maintenanceCosts,
          management: 0, // Would be calculated based on management fees
          other: summary.serviceFees,
          total: summary.totalExpenses,
        };

        // Calculate fees (MMG takes 15% commission by default)
        const mmgCommissionRate = 0.15;
        const mmgCommission = income.total * mmgCommissionRate;
        const agentCommission = 0; // Would be calculated if agent involved

        const fees = {
          mmgCommission,
          agentCommission,
          total: mmgCommission + agentCommission,
        };

        // Net payout = Income - Expenses - Fees
        const netPayout = income.total - expenses.total - fees.total;

        payoutsList.push({
          ownerId: property.ownerId || 'unknown',
          ownerName: property.owner?.name || 'Unknown Owner',
          propertyId: property.id,
          propertyName: property.name,
          period: { from: dateFrom, to: dateTo },
          income,
          expenses,
          fees,
          netPayout,
          currency: 'USD', // Default currency
          status: 'pending',
          transactions: transactionsResult.transactions,
          lastPayoutDate: undefined, // Would come from payout history
        });
      }

      setPayouts(payoutsList);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setCalculating(false);
    }
  };

  const getDateRange = (period: string) => {
    const now = new Date();
    
    switch (period) {
      case 'current_month':
        return {
          dateFrom: startOfMonth(now),
          dateTo: endOfMonth(now),
        };
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        return {
          dateFrom: startOfMonth(lastMonth),
          dateTo: endOfMonth(lastMonth),
        };
      case 'last_3_months':
        return {
          dateFrom: subMonths(now, 3),
          dateTo: now,
        };
      default:
        return {
          dateFrom: startOfMonth(now),
          dateTo: endOfMonth(now),
        };
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbol = currency === 'USD' ? '$' : 'Z$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      disputed: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      paid: CheckCircle,
      disputed: AlertCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const approvePayout = async (payout: OwnerPayout) => {
    // In a real implementation, this would update the payout status
    setSuccess(`Payout approved for ${payout.propertyName}`);
    
    // Update local state
    setPayouts(prev => prev.map(p => 
      p.propertyId === payout.propertyId 
        ? { ...p, status: 'approved' as const }
        : p
    ));
  };

  const generatePayoutReport = (payout: OwnerPayout) => {
    // Generate a detailed payout report
    const reportContent = `
OWNER PAYOUT STATEMENT
${payout.propertyName}
Period: ${format(payout.period.from, 'PPP')} - ${format(payout.period.to, 'PPP')}

INCOME:
Rent Payments: ${formatCurrency(payout.income.rentPayments, payout.currency)}
Deposits: ${formatCurrency(payout.income.deposits, payout.currency)}
Total Income: ${formatCurrency(payout.income.total, payout.currency)}

EXPENSES:
Maintenance: ${formatCurrency(payout.expenses.maintenance, payout.currency)}
Management Fees: ${formatCurrency(payout.expenses.management, payout.currency)}
Other Expenses: ${formatCurrency(payout.expenses.other, payout.currency)}
Total Expenses: ${formatCurrency(payout.expenses.total, payout.currency)}

FEES:
MMG Commission (15%): ${formatCurrency(payout.fees.mmgCommission, payout.currency)}
Agent Commission: ${formatCurrency(payout.fees.agentCommission, payout.currency)}
Total Fees: ${formatCurrency(payout.fees.total, payout.currency)}

NET PAYOUT: ${formatCurrency(payout.netPayout, payout.currency)}

Generated: ${format(new Date(), 'PPP p')}
MMG Property Consultancy
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout-${payout.propertyName.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const totalPayouts = payouts.reduce((sum, payout) => sum + payout.netPayout, 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending').length;
  const approvedPayouts = payouts.filter(p => p.status === 'approved').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Owner Payouts</h2>
          <p className="text-muted-foreground">
            Calculate and manage owner payout distributions
          </p>
        </div>
        <Button onClick={calculatePayouts} disabled={calculating}>
          {calculating ? (
            <>
              <Calculator className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Recalculate
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_month">Current Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="last_3_months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Total Payouts</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPayouts)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingPayouts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedPayouts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts List */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Calculations</CardTitle>
          <CardDescription>
            Detailed breakdown of owner payouts for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payouts calculated</h3>
              <p className="text-gray-600 mb-4">
                No payout data available for the selected criteria.
              </p>
              <Button onClick={calculatePayouts}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Payouts
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {payouts.map((payout) => (
                <div key={`${payout.propertyId}-${payout.period.from.getTime()}`} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{payout.propertyName}</h3>
                        <Badge className={getStatusColor(payout.status)}>
                          {getStatusIcon(payout.status)}
                          <span className="ml-1 capitalize">{payout.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Owner: {payout.ownerName} • 
                        Period: {format(payout.period.from, 'MMM dd')} - {format(payout.period.to, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Net Payout</p>
                      <p className={`text-2xl font-bold ${
                        payout.netPayout >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(payout.netPayout, payout.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Income */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-green-700">Income</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Rent Payments</span>
                          <span className="font-medium">
                            {formatCurrency(payout.income.rentPayments, payout.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Deposits</span>
                          <span className="font-medium">
                            {formatCurrency(payout.income.deposits, payout.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold border-t pt-2">
                          <span>Total Income</span>
                          <span className="text-green-600">
                            {formatCurrency(payout.income.total, payout.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expenses */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-red-700">Expenses</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Maintenance</span>
                          <span className="font-medium">
                            {formatCurrency(payout.expenses.maintenance, payout.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Management</span>
                          <span className="font-medium">
                            {formatCurrency(payout.expenses.management, payout.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Other</span>
                          <span className="font-medium">
                            {formatCurrency(payout.expenses.other, payout.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold border-t pt-2">
                          <span>Total Expenses</span>
                          <span className="text-red-600">
                            {formatCurrency(payout.expenses.total, payout.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fees */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-blue-700">Fees</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>MMG Commission (15%)</span>
                          <span className="font-medium">
                            {formatCurrency(payout.fees.mmgCommission, payout.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Agent Commission</span>
                          <span className="font-medium">
                            {formatCurrency(payout.fees.agentCommission, payout.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold border-t pt-2">
                          <span>Total Fees</span>
                          <span className="text-blue-600">
                            {formatCurrency(payout.fees.total, payout.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => generatePayoutReport(payout)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download Report
                    </Button>
                    
                    {payout.status === 'pending' && (
                      <Button 
                        size="sm"
                        onClick={() => approvePayout(payout)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve Payout
                      </Button>
                    )}
                    
                    {payout.status === 'approved' && (
                      <Button size="sm">
                        <Send className="w-4 h-4 mr-1" />
                        Send Payment
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
