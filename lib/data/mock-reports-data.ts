import { 
  PlatformMetrics, 
  PropertyPerformance, 
  FinancialSummary, 
  TenantAnalytics, 
  OperationalMetrics, 
  ZimbabweSpecificMetrics,
  ChartDataPoint,
  ReportMetric
} from '@/lib/types/reports';

export const mockPlatformMetrics: PlatformMetrics = {
  totalProperties: 25,
  totalUnits: 156,
  totalTenants: 142,
  occupancyRate: 91.0,
  totalRevenue: 187500,
  monthlyGrowth: 12.5,
  activeMaintenanceRequests: 23,
  averageRentPerUnit: 1350
};

export const mockPropertyPerformance: PropertyPerformance[] = [
  {
    propertyId: 'prop1',
    propertyName: 'Sunset Apartments',
    occupancyRate: 95.0,
    monthlyRevenue: 24500,
    expenseRatio: 0.35,
    netOperatingIncome: 15925,
    roiPercentage: 8.2,
    tenantSatisfaction: 4.3,
    maintenanceCost: 3200
  },
  {
    propertyId: 'prop2',
    propertyName: 'Downtown Complex',
    occupancyRate: 88.0,
    monthlyRevenue: 32100,
    expenseRatio: 0.42,
    netOperatingIncome: 18618,
    roiPercentage: 6.8,
    tenantSatisfaction: 4.1,
    maintenanceCost: 4800
  },
  {
    propertyId: 'prop3',
    propertyName: 'Garden View Condos',
    occupancyRate: 92.0,
    monthlyRevenue: 28750,
    expenseRatio: 0.38,
    netOperatingIncome: 17825,
    roiPercentage: 7.5,
    tenantSatisfaction: 4.5,
    maintenanceCost: 3900
  }
];

export const mockFinancialSummary: FinancialSummary = {
  totalIncome: 2250000,
  totalExpenses: 875000,
  netIncome: 1375000,
  grossMargin: 0.61,
  operatingExpenses: 675000,
  maintenanceExpenses: 125000,
  taxExpenses: 75000,
  cashFlow: 1250000
};

export const mockTenantAnalytics: TenantAnalytics = {
  totalTenants: 142,
  newTenants: 18,
  tenantTurnover: 0.12,
  averageLeaseLength: 14.5,
  onTimePaymentRate: 0.94,
  maintenanceRequestsPerTenant: 2.3,
  tenantSatisfactionScore: 4.2,
  renewalRate: 0.87
};

export const mockOperationalMetrics: OperationalMetrics = {
  maintenanceRequests: {
    total: 328,
    pending: 23,
    inProgress: 15,
    completed: 290,
    averageResolutionTime: 4.2
  },
  serviceProviders: {
    total: 15,
    averageRating: 4.1,
    responseTime: 24.5
  },
  complianceScore: 96.5,
  energyEfficiency: 78.2
};

export const mockZimbabweMetrics: ZimbabweSpecificMetrics = {
  usdVsZwlRatio: {
    usdTransactions: 892,
    zwlTransactions: 108,
    exchangeRate: 25800
  },
  mobileMoneyUsage: {
    ecocashTransactions: 445,
    onemoneyTransactions: 123,
    totalMobileTransactions: 568
  },
  taxCompliance: {
    vatCollected: 32625,
    withholdingTaxDeducted: 11250,
    zimraFilingStatus: 'compliant'
  },
  localMarketData: {
    averageRentPerSqm: 18.5,
    marketGrowthRate: 0.085,
    competitorAnalysis: {
      belowMarket: 15,
      atMarket: 65,
      aboveMarket: 20
    }
  }
};

export const mockRevenueChartData: ChartDataPoint[] = [
  { label: 'Jan', value: 165000, date: '2024-01-01' },
  { label: 'Feb', value: 172000, date: '2024-02-01' },
  { label: 'Mar', value: 168000, date: '2024-03-01' },
  { label: 'Apr', value: 178000, date: '2024-04-01' },
  { label: 'May', value: 185000, date: '2024-05-01' },
  { label: 'Jun', value: 192000, date: '2024-06-01' },
  { label: 'Jul', value: 187500, date: '2024-07-01' },
  { label: 'Aug', value: 195000, date: '2024-08-01' }
];

export const mockOccupancyChartData: ChartDataPoint[] = [
  { label: 'Jan', value: 88.5, date: '2024-01-01' },
  { label: 'Feb', value: 89.2, date: '2024-02-01' },
  { label: 'Mar', value: 87.8, date: '2024-03-01' },
  { label: 'Apr', value: 90.1, date: '2024-04-01' },
  { label: 'May', value: 91.5, date: '2024-05-01' },
  { label: 'Jun', value: 92.3, date: '2024-06-01' },
  { label: 'Jul', value: 91.0, date: '2024-07-01' },
  { label: 'Aug', value: 93.2, date: '2024-08-01' }
];

export const mockExpenseBreakdown: ChartDataPoint[] = [
  { label: 'Maintenance', value: 125000, category: 'operational', color: '#EF4444' },
  { label: 'Utilities', value: 85000, category: 'operational', color: '#F59E0B' },
  { label: 'Management', value: 95000, category: 'administrative', color: '#10B981' },
  { label: 'Insurance', value: 65000, category: 'administrative', color: '#3B82F6' },
  { label: 'Marketing', value: 35000, category: 'marketing', color: '#8B5CF6' },
  { label: 'Professional Services', value: 45000, category: 'professional', color: '#EC4899' },
  { label: 'Taxes', value: 75000, category: 'tax', color: '#6B7280' },
  { label: 'Other', value: 25000, category: 'other', color: '#14B8A6' }
];

export const mockPropertyComparisonData: ChartDataPoint[] = [
  { label: 'Sunset Apartments', value: 8.2, category: 'roi', color: '#10B981' },
  { label: 'Downtown Complex', value: 6.8, category: 'roi', color: '#3B82F6' },
  { label: 'Garden View Condos', value: 7.5, category: 'roi', color: '#8B5CF6' },
  { label: 'Riverside Towers', value: 9.1, category: 'roi', color: '#F59E0B' },
  { label: 'City Center Plaza', value: 5.9, category: 'roi', color: '#EF4444' }
];

export const mockTenantDemographics: ChartDataPoint[] = [
  { label: '18-25', value: 28, category: 'age', color: '#EF4444' },
  { label: '26-35', value: 45, category: 'age', color: '#F59E0B' },
  { label: '36-45', value: 38, category: 'age', color: '#10B981' },
  { label: '46-55', value: 22, category: 'age', color: '#3B82F6' },
  { label: '56+', value: 9, category: 'age', color: '#8B5CF6' }
];

export const mockMaintenanceByCategory: ChartDataPoint[] = [
  { label: 'Plumbing', value: 89, category: 'maintenance', color: '#3B82F6' },
  { label: 'Electrical', value: 67, category: 'maintenance', color: '#F59E0B' },
  { label: 'HVAC', value: 45, category: 'maintenance', color: '#10B981' },
  { label: 'Structural', value: 23, category: 'maintenance', color: '#EF4444' },
  { label: 'Appliances', value: 56, category: 'maintenance', color: '#8B5CF6' },
  { label: 'Other', value: 48, category: 'maintenance', color: '#6B7280' }
];

export const getMetricsForRole = (role: string): ReportMetric[] => {
  const baseMetrics: ReportMetric[] = [
    {
      id: 'occupancy',
      title: 'Occupancy Rate',
      value: mockPlatformMetrics.occupancyRate,
      previousValue: 89.2,
      change: 1.8,
      changeType: 'increase',
      format: 'percentage',
      icon: 'home'
    },
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: mockPlatformMetrics.totalRevenue,
      previousValue: 175000,
      change: 7.1,
      changeType: 'increase',
      format: 'currency',
      icon: 'dollar-sign'
    }
  ];

  switch (role) {
    case 'admin':
      return [
        ...baseMetrics,
        {
          id: 'properties',
          title: 'Total Properties',
          value: mockPlatformMetrics.totalProperties,
          previousValue: 23,
          change: 8.7,
          changeType: 'increase',
          format: 'number',
          icon: 'building'
        },
        {
          id: 'tenants',
          title: 'Total Tenants',
          value: mockPlatformMetrics.totalTenants,
          previousValue: 138,
          change: 2.9,
          changeType: 'increase',
          format: 'number',
          icon: 'users'
        },
        {
          id: 'maintenance',
          title: 'Active Maintenance',
          value: mockPlatformMetrics.activeMaintenanceRequests,
          previousValue: 31,
          change: -25.8,
          changeType: 'decrease',
          format: 'number',
          icon: 'wrench'
        }
      ];
    
    case 'owner':
      return [
        ...baseMetrics,
        {
          id: 'roi',
          title: 'Average ROI',
          value: 7.5,
          previousValue: 7.1,
          change: 5.6,
          changeType: 'increase',
          format: 'percentage',
          icon: 'trending-up'
        },
        {
          id: 'net-income',
          title: 'Net Income',
          value: mockFinancialSummary.netIncome,
          previousValue: 1275000,
          change: 7.8,
          changeType: 'increase',
          format: 'currency',
          icon: 'dollar-sign'
        }
      ];
    
    case 'agent':
      return [
        ...baseMetrics,
        {
          id: 'managed-units',
          title: 'Managed Units',
          value: 42,
          previousValue: 38,
          change: 10.5,
          changeType: 'increase',
          format: 'number',
          icon: 'key'
        },
        {
          id: 'collection-rate',
          title: 'Collection Rate',
          value: 94.5,
          previousValue: 92.1,
          change: 2.6,
          changeType: 'increase',
          format: 'percentage',
          icon: 'credit-card'
        }
      ];
    
    case 'tenant':
      return [
        {
          id: 'payment-status',
          title: 'Payment Status',
          value: 'Current',
          format: 'text',
          icon: 'check-circle'
        },
        {
          id: 'lease-remaining',
          title: 'Lease Remaining',
          value: '8 months',
          format: 'text',
          icon: 'calendar'
        },
        {
          id: 'maintenance-requests',
          title: 'Open Requests',
          value: 1,
          format: 'number',
          icon: 'tool'
        }
      ];
    
    default:
      return baseMetrics;
  }
};