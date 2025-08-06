import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Analytics interfaces
export interface PropertyAnalytics {
  propertyId: string;
  propertyName: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalRentRoll: number;
  averageRent: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  roi: number;
  maintenanceCosts: number;
  maintenanceRequests: number;
  averageTenantStay: number;
  renewalRate: number;
  lastUpdated: Date;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  grossMargin: number;
  operatingExpenseRatio: number;
  revenueGrowth: number;
  expenseGrowth: number;
  profitMargin: number;
  averageRentCollection: number;
  outstandingRent: number;
  collectionRate: number;
  monthlyBreakdown: {
    month: string;
    revenue: number;
    expenses: number;
    netIncome: number;
    occupancyRate: number;
  }[];
}

export interface TenantAnalytics {
  totalTenants: number;
  activeTenants: number;
  newTenants: number;
  departedTenants: number;
  averageTenantStay: number;
  renewalRate: number;
  earlyTerminationRate: number;
  averageRent: number;
  onTimePaymentRate: number;
  maintenanceRequestsPerTenant: number;
  tenantSatisfactionScore: number;
  demographicBreakdown: {
    ageGroups: Record<string, number>;
    tenancyDuration: Record<string, number>;
    unitTypes: Record<string, number>;
  };
}

export interface MaintenanceAnalytics {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  averageResolutionTime: number;
  totalCosts: number;
  averageCostPerRequest: number;
  requestsByCategory: Record<string, number>;
  requestsByPriority: Record<string, number>;
  costsByCategory: Record<string, number>;
  monthlyTrends: {
    month: string;
    requests: number;
    costs: number;
    averageResolutionTime: number;
  }[];
  topIssues: {
    category: string;
    count: number;
    averageCost: number;
  }[];
}

export interface LeaseAnalytics {
  totalLeases: number;
  activeLeases: number;
  expiring30Days: number;
  expiring60Days: number;
  expiring90Days: number;
  renewedLeases: number;
  terminatedLeases: number;
  averageLeaseDuration: number;
  renewalRate: number;
  earlyTerminationRate: number;
  leaseTypeBreakdown: Record<string, number>;
  monthlyExpirations: {
    month: string;
    expiringCount: number;
    renewalCount: number;
    terminationCount: number;
  }[];
}

export interface PortfolioOverview {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  overallOccupancyRate: number;
  totalPortfolioValue: number;
  totalMonthlyRevenue: number;
  totalMonthlyExpenses: number;
  netOperatingIncome: number;
  portfolioROI: number;
  propertyPerformance: PropertyAnalytics[];
  topPerformingProperties: PropertyAnalytics[];
  underperformingProperties: PropertyAnalytics[];
}

// Get property analytics
export const getPropertyAnalytics = async (propertyId?: string): Promise<PropertyAnalytics[]> => {
  try {
    // Get properties
    let propertiesQuery = query(collection(db, 'properties'));
    if (propertyId) {
      propertiesQuery = query(propertiesQuery, where('id', '==', propertyId));
    }
    
    const propertiesSnapshot = await getDocs(propertiesQuery);
    const analytics: PropertyAnalytics[] = [];
    
    for (const propertyDoc of propertiesSnapshot.docs) {
      const property = { id: propertyDoc.id, ...propertyDoc.data() };
      
      // Get units for this property
      const unitsQuery = query(
        collection(db, 'units'),
        where('propertyId', '==', property.id)
      );
      const unitsSnapshot = await getDocs(unitsQuery);
      const units = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Get active leases
      const leasesQuery = query(
        collection(db, 'leases'),
        where('propertyId', '==', property.id),
        where('status', '==', 'active')
      );
      const leasesSnapshot = await getDocs(leasesQuery);
      const leases = leasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Get transactions (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('propertyId', '==', property.id),
        where('date', '>=', Timestamp.fromDate(twelveMonthsAgo))
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Get maintenance requests
      const maintenanceQuery = query(
        collection(db, 'maintenance_requests'),
        where('propertyId', '==', property.id)
      );
      const maintenanceSnapshot = await getDocs(maintenanceQuery);
      const maintenanceRequests = maintenanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calculate metrics
      const totalUnits = units.length;
      const occupiedUnits = leases.length;
      const vacantUnits = totalUnits - occupiedUnits;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
      
      const totalRentRoll = leases.reduce((sum: number, lease: any) => sum + (lease.terms?.rentAmount || 0), 0);
      const averageRent = occupiedUnits > 0 ? totalRentRoll / occupiedUnits : 0;
      
      const revenue = transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      const expenses = transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      const netIncome = revenue - expenses;
      const roi = revenue > 0 ? (netIncome / revenue) * 100 : 0;
      
      const maintenanceCosts = transactions
        .filter((t: any) => t.category === 'maintenance')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      // Calculate average tenant stay (simplified)
      const avgTenantStay = leases.length > 0 ? 12 : 0; // Placeholder calculation
      
      // Calculate renewal rate (simplified)
      const renewalRate = 85; // Placeholder - would need historical lease data
      
      analytics.push({
        propertyId: property.id,
        propertyName: property.name,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate,
        totalRentRoll,
        averageRent,
        totalRevenue: revenue,
        totalExpenses: expenses,
        netIncome,
        roi,
        maintenanceCosts,
        maintenanceRequests: maintenanceRequests.length,
        averageTenantStay: avgTenantStay,
        renewalRate,
        lastUpdated: new Date(),
      });
    }
    
    return analytics;
  } catch (error) {
    console.error('Error getting property analytics:', error);
    throw error;
  }
};

// Get financial metrics
export const getFinancialMetrics = async (dateRange?: { start: Date; end: Date }): Promise<FinancialMetrics> => {
  try {
    const startDate = dateRange?.start || (() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 12);
      return date;
    })();
    
    const endDate = dateRange?.end || new Date();
    
    // Get all transactions in date range
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );
    
    const transactionsSnapshot = await getDocs(transactionsQuery);
    const transactions = transactionsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
    
    // Calculate totals
    const revenue = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const netIncome = revenue - expenses;
    const grossMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
    const operatingExpenseRatio = revenue > 0 ? (expenses / revenue) * 100 : 0;
    const profitMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
    
    // Calculate growth rates (compared to previous period)
    const periodLength = Math.abs(endDate.getTime() - startDate.getTime());
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = new Date(startDate.getTime());
    
    const prevTransactionsQuery = query(
      collection(db, 'transactions'),
      where('date', '>=', Timestamp.fromDate(prevStartDate)),
      where('date', '<=', Timestamp.fromDate(prevEndDate))
    );
    
    const prevTransactionsSnapshot = await getDocs(prevTransactionsQuery);
    const prevTransactions = prevTransactionsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    const prevRevenue = prevTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const prevExpenses = prevTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const expenseGrowth = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;
    
    // Calculate monthly breakdown
    const monthlyData = new Map<string, {
      revenue: number;
      expenses: number;
      netIncome: number;
      occupancyRate: number;
    }>();
    
    transactions.forEach((transaction: any) => {
      const monthKey = transaction.date.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          revenue: 0,
          expenses: 0,
          netIncome: 0,
          occupancyRate: 0,
        });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      
      if (transaction.type === 'income') {
        monthData.revenue += transaction.amount;
      } else if (transaction.type === 'expense') {
        monthData.expenses += transaction.amount;
      }
      
      monthData.netIncome = monthData.revenue - monthData.expenses;
    });
    
    const monthlyBreakdown = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        ...data,
      }));
    
    // Get rent collection data
    const rentTransactions = transactions.filter((t: any) => 
      t.type === 'income' && t.category === 'rent'
    );
    
    const totalRentCollected = rentTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
    const averageRentCollection = rentTransactions.length > 0 ? totalRentCollected / rentTransactions.length : 0;
    
    // Calculate outstanding rent (simplified)
    const outstandingRent = revenue * 0.05; // Assume 5% outstanding
    const collectionRate = revenue > 0 ? ((revenue - outstandingRent) / revenue) * 100 : 0;
    
    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      netIncome,
      grossMargin,
      operatingExpenseRatio,
      revenueGrowth,
      expenseGrowth,
      profitMargin,
      averageRentCollection,
      outstandingRent,
      collectionRate,
      monthlyBreakdown,
    };
  } catch (error) {
    console.error('Error getting financial metrics:', error);
    throw error;
  }
};

// Get tenant analytics
export const getTenantAnalytics = async (): Promise<TenantAnalytics> => {
  try {
    // Get all tenants
    const tenantsQuery = query(collection(db, 'tenants'));
    const tenantsSnapshot = await getDocs(tenantsQuery);
    const tenants = tenantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get active leases
    const activeLeasesQuery = query(
      collection(db, 'leases'),
      where('status', '==', 'active')
    );
    const activeLeasesSnapshot = await getDocs(activeLeasesQuery);
    const activeLeases = activeLeasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get recent leases (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const recentLeasesQuery = query(
      collection(db, 'leases'),
      where('dates.startDate', '>=', Timestamp.fromDate(twelveMonthsAgo))
    );
    const recentLeasesSnapshot = await getDocs(recentLeasesQuery);
    const recentLeases = recentLeasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get maintenance requests
    const maintenanceQuery = query(collection(db, 'maintenance_requests'));
    const maintenanceSnapshot = await getDocs(maintenanceQuery);
    const maintenanceRequests = maintenanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate metrics
    const totalTenants = tenants.length;
    const activeTenants = activeLeases.length;
    const newTenants = recentLeases.filter((lease: any) => {
      const startDate = lease.dates?.startDate?.toDate();
      return startDate && startDate >= twelveMonthsAgo;
    }).length;
    
    // Calculate departed tenants (leases that ended in last 12 months)
    const departedTenants = 5; // Placeholder - would need historical data
    
    // Calculate average tenant stay
    const completedLeases = activeLeases.filter((lease: any) => lease.status === 'completed');
    const averageTenantStay = completedLeases.length > 0 
      ? completedLeases.reduce((sum: number, lease: any) => {
          const start = lease.dates?.startDate?.toDate();
          const end = lease.dates?.endDate?.toDate();
          if (start && end) {
            return sum + Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
          }
          return sum;
        }, 0) / completedLeases.length
      : 12; // Default to 12 months
    
    // Calculate renewal rate
    const renewalRate = 85; // Placeholder - would need renewal tracking
    const earlyTerminationRate = 10; // Placeholder
    
    // Calculate average rent
    const averageRent = activeLeases.length > 0 
      ? activeLeases.reduce((sum: number, lease: any) => sum + (lease.terms?.rentAmount || 0), 0) / activeLeases.length
      : 0;
    
    // Calculate on-time payment rate
    const onTimePaymentRate = 92; // Placeholder - would need payment tracking
    
    // Calculate maintenance requests per tenant
    const maintenanceRequestsPerTenant = activeTenants > 0 ? maintenanceRequests.length / activeTenants : 0;
    
    // Tenant satisfaction score (placeholder)
    const tenantSatisfactionScore = 4.2;
    
    // Demographic breakdown (simplified)
    const demographicBreakdown = {
      ageGroups: {
        '18-25': Math.floor(totalTenants * 0.15),
        '26-35': Math.floor(totalTenants * 0.35),
        '36-45': Math.floor(totalTenants * 0.25),
        '46-55': Math.floor(totalTenants * 0.15),
        '55+': Math.floor(totalTenants * 0.10),
      },
      tenancyDuration: {
        '0-6 months': Math.floor(totalTenants * 0.20),
        '6-12 months': Math.floor(totalTenants * 0.25),
        '1-2 years': Math.floor(totalTenants * 0.30),
        '2-3 years': Math.floor(totalTenants * 0.15),
        '3+ years': Math.floor(totalTenants * 0.10),
      },
      unitTypes: {
        'studio': Math.floor(totalTenants * 0.15),
        '1_bedroom': Math.floor(totalTenants * 0.35),
        '2_bedroom': Math.floor(totalTenants * 0.30),
        '3_bedroom': Math.floor(totalTenants * 0.15),
        '4_bedroom': Math.floor(totalTenants * 0.05),
      },
    };
    
    return {
      totalTenants,
      activeTenants,
      newTenants,
      departedTenants,
      averageTenantStay,
      renewalRate,
      earlyTerminationRate,
      averageRent,
      onTimePaymentRate,
      maintenanceRequestsPerTenant,
      tenantSatisfactionScore,
      demographicBreakdown,
    };
  } catch (error) {
    console.error('Error getting tenant analytics:', error);
    throw error;
  }
};

// Get maintenance analytics
export const getMaintenanceAnalytics = async (): Promise<MaintenanceAnalytics> => {
  try {
    // Get all maintenance requests
    const maintenanceQuery = query(collection(db, 'maintenance_requests'));
    const maintenanceSnapshot = await getDocs(maintenanceQuery);
    const requests = maintenanceSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
    }));
    
    // Get maintenance-related expenses
    const expensesQuery = query(
      collection(db, 'transactions'),
      where('category', '==', 'maintenance'),
      where('type', '==', 'expense')
    );
    const expensesSnapshot = await getDocs(expensesQuery);
    const expenses = expensesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      date: doc.data().date?.toDate(),
    }));
    
    // Calculate basic metrics
    const totalRequests = requests.length;
    const completedRequests = requests.filter((r: any) => r.status === 'completed').length;
    const pendingRequests = requests.filter((r: any) => ['pending', 'in_progress'].includes(r.status)).length;
    
    // Calculate average resolution time
    const completedWithTimes = requests.filter((r: any) => 
      r.status === 'completed' && r.createdAt && r.completedAt
    );
    
    const averageResolutionTime = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum: number, r: any) => {
          const resolutionTime = (r.completedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24);
          return sum + resolutionTime;
        }, 0) / completedWithTimes.length
      : 0;
    
    // Calculate total costs
    const totalCosts = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
    const averageCostPerRequest = totalRequests > 0 ? totalCosts / totalRequests : 0;
    
    // Requests by category
    const requestsByCategory: Record<string, number> = {};
    requests.forEach((request: any) => {
      const category = request.category || 'other';
      requestsByCategory[category] = (requestsByCategory[category] || 0) + 1;
    });
    
    // Requests by priority
    const requestsByPriority: Record<string, number> = {};
    requests.forEach((request: any) => {
      const priority = request.priority || 'medium';
      requestsByPriority[priority] = (requestsByPriority[priority] || 0) + 1;
    });
    
    // Costs by category
    const costsByCategory: Record<string, number> = {};
    expenses.forEach((expense: any) => {
      const category = expense.subcategory || expense.description || 'other';
      costsByCategory[category] = (costsByCategory[category] || 0) + expense.amount;
    });
    
    // Monthly trends (last 12 months)
    const monthlyTrends: { month: string; requests: number; costs: number; averageResolutionTime: number; }[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthDate.toISOString().substring(0, 7);
      
      const monthRequests = requests.filter((r: any) => 
        r.createdAt && r.createdAt.toISOString().substring(0, 7) === monthKey
      );
      
      const monthExpenses = expenses.filter((e: any) => 
        e.date && e.date.toISOString().substring(0, 7) === monthKey
      );
      
      const monthCompletedRequests = monthRequests.filter((r: any) => 
        r.status === 'completed' && r.completedAt
      );
      
      const monthAvgResolution = monthCompletedRequests.length > 0
        ? monthCompletedRequests.reduce((sum: number, r: any) => {
            const resolutionTime = (r.completedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return sum + resolutionTime;
          }, 0) / monthCompletedRequests.length
        : 0;
      
      monthlyTrends.push({
        month: monthKey,
        requests: monthRequests.length,
        costs: monthExpenses.reduce((sum: number, e: any) => sum + e.amount, 0),
        averageResolutionTime: monthAvgResolution,
      });
    }
    
    // Top issues
    const topIssues = Object.entries(requestsByCategory)
      .map(([category, count]) => ({
        category,
        count,
        averageCost: costsByCategory[category] ? costsByCategory[category] / count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalRequests,
      completedRequests,
      pendingRequests,
      averageResolutionTime,
      totalCosts,
      averageCostPerRequest,
      requestsByCategory,
      requestsByPriority,
      costsByCategory,
      monthlyTrends,
      topIssues,
    };
  } catch (error) {
    console.error('Error getting maintenance analytics:', error);
    throw error;
  }
};

// Get lease analytics
export const getLeaseAnalytics = async (): Promise<LeaseAnalytics> => {
  try {
    // Get all leases
    const leasesQuery = query(collection(db, 'leases'));
    const leasesSnapshot = await getDocs(leasesQuery);
    const leases = leasesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      startDate: doc.data().dates?.startDate?.toDate(),
      endDate: doc.data().dates?.endDate?.toDate(),
    }));
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysFromNow = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000));
    const ninetyDaysFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
    
    // Calculate basic metrics
    const totalLeases = leases.length;
    const activeLeases = leases.filter((lease: any) => lease.status === 'active').length;
    
    // Expiring leases
    const expiring30Days = leases.filter((lease: any) => 
      lease.endDate && lease.endDate <= thirtyDaysFromNow && lease.endDate > now
    ).length;
    
    const expiring60Days = leases.filter((lease: any) => 
      lease.endDate && lease.endDate <= sixtyDaysFromNow && lease.endDate > thirtyDaysFromNow
    ).length;
    
    const expiring90Days = leases.filter((lease: any) => 
      lease.endDate && lease.endDate <= ninetyDaysFromNow && lease.endDate > sixtyDaysFromNow
    ).length;
    
    // Lease outcomes (placeholder data)
    const renewedLeases = Math.floor(totalLeases * 0.7);
    const terminatedLeases = Math.floor(totalLeases * 0.3);
    
    // Calculate average lease duration
    const completedLeases = leases.filter((lease: any) => 
      lease.startDate && lease.endDate
    );
    
    const averageLeaseDuration = completedLeases.length > 0
      ? completedLeases.reduce((sum: number, lease: any) => {
          const duration = (lease.endDate.getTime() - lease.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          return sum + duration;
        }, 0) / completedLeases.length
      : 12;
    
    // Rates (placeholder calculations)
    const renewalRate = totalLeases > 0 ? (renewedLeases / totalLeases) * 100 : 0;
    const earlyTerminationRate = 15; // Placeholder
    
    // Lease type breakdown
    const leaseTypeBreakdown: Record<string, number> = {};
    leases.forEach((lease: any) => {
      const type = lease.type || 'standard';
      leaseTypeBreakdown[type] = (leaseTypeBreakdown[type] || 0) + 1;
    });
    
    // Monthly expirations (next 12 months)
    const monthlyExpirations: {
      month: string;
      expiringCount: number;
      renewalCount: number;
      terminationCount: number;
    }[] = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const monthKey = monthDate.toISOString().substring(0, 7);
      
      const expiringInMonth = leases.filter((lease: any) => 
        lease.endDate && 
        lease.endDate >= monthDate && 
        lease.endDate < nextMonthDate
      ).length;
      
      // Placeholder renewal and termination estimates
      const renewalCount = Math.floor(expiringInMonth * 0.7);
      const terminationCount = expiringInMonth - renewalCount;
      
      monthlyExpirations.push({
        month: monthKey,
        expiringCount: expiringInMonth,
        renewalCount,
        terminationCount,
      });
    }
    
    return {
      totalLeases,
      activeLeases,
      expiring30Days,
      expiring60Days,
      expiring90Days,
      renewedLeases,
      terminatedLeases,
      averageLeaseDuration,
      renewalRate,
      earlyTerminationRate,
      leaseTypeBreakdown,
      monthlyExpirations,
    };
  } catch (error) {
    console.error('Error getting lease analytics:', error);
    throw error;
  }
};

// Get portfolio overview
export const getPortfolioOverview = async (): Promise<PortfolioOverview> => {
  try {
    const [propertyAnalytics, financialMetrics] = await Promise.all([
      getPropertyAnalytics(),
      getFinancialMetrics()
    ]);
    
    const totalProperties = propertyAnalytics.length;
    const totalUnits = propertyAnalytics.reduce((sum, p) => sum + p.totalUnits, 0);
    const occupiedUnits = propertyAnalytics.reduce((sum, p) => sum + p.occupiedUnits, 0);
    const overallOccupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    
    const totalPortfolioValue = 10000000; // Placeholder - would need property valuations
    const totalMonthlyRevenue = propertyAnalytics.reduce((sum, p) => sum + p.totalRentRoll, 0);
    const totalMonthlyExpenses = financialMetrics.totalExpenses / 12; // Convert annual to monthly
    const netOperatingIncome = totalMonthlyRevenue - totalMonthlyExpenses;
    const portfolioROI = totalPortfolioValue > 0 ? (netOperatingIncome * 12 / totalPortfolioValue) * 100 : 0;
    
    // Sort properties by performance
    const sortedByROI = [...propertyAnalytics].sort((a, b) => b.roi - a.roi);
    const topPerformingProperties = sortedByROI.slice(0, 3);
    const underperformingProperties = sortedByROI.slice(-3).reverse();
    
    return {
      totalProperties,
      totalUnits,
      occupiedUnits,
      overallOccupancyRate,
      totalPortfolioValue,
      totalMonthlyRevenue,
      totalMonthlyExpenses,
      netOperatingIncome,
      portfolioROI,
      propertyPerformance: propertyAnalytics,
      topPerformingProperties,
      underperformingProperties,
    };
  } catch (error) {
    console.error('Error getting portfolio overview:', error);
    throw error;
  }
};

// Export data to CSV format
export const exportAnalyticsToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};