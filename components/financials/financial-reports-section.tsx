'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Eye,
  Plus,
  Calendar,
  Building,
  DollarSign,
  Users,
  Calculator,
  Percent,
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { UserRole } from '@/lib/types';
import { Currency, CURRENCY_SYMBOLS } from '@/lib/types/financials';
import { mockProperties, mockFinancialMetrics } from '@/lib/data/mock-financial-data';

interface FinancialReportsSectionProps {
  currency: Currency;
  userRole: UserRole;
  permissions: {
    canViewReports: boolean;
    canExportData: boolean;
  };
  selectedProperty: string;
  dateRange: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'income_statement' | 'cash_flow' | 'rent_roll' | 'expense_report' | 'tax_report' | 'profitability';
  category: 'financial' | 'operational' | 'tax' | 'analytics';
  requiredRole: UserRole[];
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'income-statement',
    name: 'Income Statement',
    description: 'Revenue and expenses for specified period',
    icon: <BarChart3 className="w-5 h-5" />,
    type: 'income_statement',
    category: 'financial',
    requiredRole: ['admin', 'owner'],
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow Statement',
    description: 'Cash inflows and outflows analysis',
    icon: <TrendingUp className="w-5 h-5" />,
    type: 'cash_flow',
    category: 'financial',
    requiredRole: ['admin', 'owner'],
  },
  {
    id: 'rent-roll',
    name: 'Rent Roll Report',
    description: 'Detailed rent and tenant information',
    icon: <Building className="w-5 h-5" />,
    type: 'rent_roll',
    category: 'operational',
    requiredRole: ['admin', 'owner', 'agent'],
  },
  {
    id: 'expense-report',
    name: 'Expense Analysis',
    description: 'Breakdown of all expenses by category',
    icon: <PieChart className="w-5 h-5" />,
    type: 'expense_report',
    category: 'financial',
    requiredRole: ['admin', 'owner'],
  },
  {
    id: 'tax-report',
    name: 'Tax Preparation Report',
    description: 'VAT, withholding tax, and deductions summary',
    icon: <Calculator className="w-5 h-5" />,
    type: 'tax_report',
    category: 'tax',
    requiredRole: ['admin', 'owner'],
  },
  {
    id: 'profitability',
    name: 'Property Profitability',
    description: 'ROI and profit analysis by property',
    icon: <DollarSign className="w-5 h-5" />,
    type: 'profitability',
    category: 'analytics',
    requiredRole: ['admin', 'owner'],
  },
];

export default function FinancialReportsSection({
  currency,
  userRole,
  permissions,
  selectedProperty,
  dateRange,
}: FinancialReportsSectionProps) {
  const [selectedReportType, setSelectedReportType] = useState<string>('');
  const [reportDateRange, setReportDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [reportProperty, setReportProperty] = useState<string>(selectedProperty);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const formatCurrency = (amount: number) => {
    return `${CURRENCY_SYMBOLS[currency]}${amount.toLocaleString()}`;
  };

  // Filter reports based on user role
  const availableReports = reportTemplates.filter(report =>
    report.requiredRole.includes(userRole)
  );

  const groupedReports = availableReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, ReportTemplate[]>);

  const handleGenerateReport = async (reportType: string) => {
    if (!permissions.canViewReports) return;

    setGeneratingReport(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would call the API
      console.log('Generating report:', {
        type: reportType,
        property: reportProperty,
        dateRange: reportDateRange,
        currency,
      });
      
      // Show success and provide download link
      alert('Report generated successfully! Download would start automatically.');
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
      setShowReportDialog(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <BarChart3 className="w-4 h-4" />;
      case 'operational':
        return <Building className="w-4 h-4" />;
      case 'tax':
        return <Calculator className="w-4 h-4" />;
      case 'analytics':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      financial: 'bg-blue-100 text-blue-800',
      operational: 'bg-green-100 text-green-800',
      tax: 'bg-purple-100 text-purple-800',
      analytics: 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!permissions.canViewReports) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              You don't have permission to view financial reports.
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
          <h2 className="text-2xl font-bold tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground">
            Generate comprehensive financial reports and analytics
          </p>
        </div>
        
        <Button onClick={() => setShowReportDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate New Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Available Reports</p>
                <p className="text-2xl font-bold text-blue-600">
                  {availableReports.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Current Month Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(mockFinancialMetrics.totalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Net Profit Margin</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mockFinancialMetrics.totalIncome > 0 
                    ? ((mockFinancialMetrics.netIncome / mockFinancialMetrics.totalIncome) * 100).toFixed(1)
                    : '0.0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Percent className="h-4 w-4 text-teal-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold text-teal-600">
                  {mockFinancialMetrics.collectionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      {Object.entries(groupedReports).map(([category, reports]) => (
        <Card key={category}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              {getCategoryIcon(category)}
              <CardTitle className="capitalize">{category} Reports</CardTitle>
              <Badge className={getCategoryColor(category)}>
                {reports.length} available
              </Badge>
            </div>
            <CardDescription>
              {category === 'financial' && 'Income statements, cash flow, and financial performance reports'}
              {category === 'operational' && 'Property operations and tenant management reports'}
              {category === 'tax' && 'Tax compliance and preparation reports for Zimbabwe'}
              {category === 'analytics' && 'Performance analytics and business intelligence reports'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {report.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{report.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {report.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedReportType(report.id);
                              setShowReportDialog(true);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Generate
                          </Button>
                          {permissions.canExportData && (
                            <Button variant="outline" size="sm">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Zimbabwe-Specific Tax Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Zimbabwe Tax Compliance</span>
          </CardTitle>
          <CardDescription>
            Specialized reports for Zimbabwe tax requirements and regulations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">VAT Return Summary</h4>
              <p className="text-sm text-gray-600 mb-3">
                VAT collected and paid summary for ZIMRA submission
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>VAT Rate:</span>
                  <span className="font-medium">14.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT Collected:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(2890)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT Paid:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(456)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Withholding Tax Summary</h4>
              <p className="text-sm text-gray-600 mb-3">
                Withholding tax deducted on various transactions
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Rent (5%):</span>
                  <span className="font-medium">{formatCurrency(400)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Services (10%):</span>
                  <span className="font-medium">{formatCurrency(120)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(520)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Financial Report</DialogTitle>
            <DialogDescription>
              Configure and generate your financial report
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Report Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Report Type
              </label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {availableReports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      <div className="flex items-center space-x-2">
                        {report.icon}
                        <span>{report.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Property
              </label>
              <Select value={reportProperty} onValueChange={setReportProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {mockProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Date Range
              </label>
              <DatePickerWithRange
                date={reportDateRange}
                setDate={setReportDateRange}
              />
            </div>

            {/* Currency */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Currency
              </label>
              <Select value={currency} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="ZWL">ZWL (Z$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-4">
              <Button
                onClick={() => handleGenerateReport(selectedReportType)}
                disabled={!selectedReportType || generatingReport}
                className="flex-1"
              >
                {generatingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowReportDialog(false)}
                disabled={generatingReport}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}