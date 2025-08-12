export interface ReportMetric {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'currency' | 'percentage' | 'number' | 'text';
  icon?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: string;
  color?: string;
}

export interface ReportFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'property' | 'tenant';
  options?: { value: string; label: string }[];
  defaultValue?: string | string[];
}

export interface ReportSection {
  id: string;
  title: string;
  description?: string;
  type: 'metrics' | 'chart' | 'table' | 'custom';
  allowedRoles: string[];
  data?: any;
  loading?: boolean;
  error?: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: 'executive' | 'financial' | 'property' | 'tenant' | 'operational' | 'personal';
  allowedRoles: string[];
  sections: ReportSection[];
  filters: ReportFilter[];
  exportFormats?: ('pdf' | 'excel' | 'csv')[];
  scheduling?: boolean;
}

export interface PlatformMetrics {
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  occupancyRate: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeMaintenanceRequests: number;
  averageRentPerUnit: number;
}

export interface PropertyPerformance {
  propertyId: string;
  propertyName: string;
  occupancyRate: number;
  monthlyRevenue: number;
  expenseRatio: number;
  netOperatingIncome: number;
  roiPercentage: number;
  tenantSatisfaction: number;
  maintenanceCost: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  grossMargin: number;
  operatingExpenses: number;
  maintenanceExpenses: number;
  taxExpenses: number;
  cashFlow: number;
}

export interface TenantAnalytics {
  totalTenants: number;
  newTenants: number;
  tenantTurnover: number;
  averageLeaseLength: number;
  onTimePaymentRate: number;
  maintenanceRequestsPerTenant: number;
  tenantSatisfactionScore: number;
  renewalRate: number;
}

export interface OperationalMetrics {
  maintenanceRequests: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    averageResolutionTime: number;
  };
  serviceProviders: {
    total: number;
    averageRating: number;
    responseTime: number;
  };
  complianceScore: number;
  energyEfficiency: number;
}

export interface ZimbabweSpecificMetrics {
  usdVsZwlRatio: {
    usdTransactions: number;
    zwlTransactions: number;
    exchangeRate: number;
  };
  mobileMoneyUsage: {
    ecocashTransactions: number;
    onemoneyTransactions: number;
    totalMobileTransactions: number;
  };
  taxCompliance: {
    vatCollected: number;
    withholdingTaxDeducted: number;
    zimraFilingStatus: 'compliant' | 'pending' | 'overdue';
  };
  localMarketData: {
    averageRentPerSqm: number;
    marketGrowthRate: number;
    competitorAnalysis: {
      belowMarket: number;
      atMarket: number;
      aboveMarket: number;
    };
  };
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  dateRange?: { from: Date; to: Date };
  includeCharts?: boolean;
  includeRawData?: boolean;
  recipientEmails?: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    enabled: boolean;
    nextRun?: Date;
  };
}

export interface ReportDashboardProps {
  userRole: string;
  userId: string;
  permissions?: string[];
}