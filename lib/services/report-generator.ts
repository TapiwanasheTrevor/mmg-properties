import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auditHelpers } from '@/lib/security/audit-logger';
import {
  getPortfolioOverview,
  getFinancialMetrics,
  getTenantAnalytics,
  getMaintenanceAnalytics,
  exportAnalyticsToCSV
} from './analytics';
import { sendEmailNotification } from './email-templates';

export interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  reportType: 'portfolio' | 'financial' | 'tenant' | 'maintenance' | 'comprehensive';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: {
    email: string;
    name: string;
    role: string;
  }[];
  settings: {
    includeCharts: boolean;
    includeRawData: boolean;
    dateRange: 'last_month' | 'last_quarter' | 'last_year' | 'ytd';
    format: 'pdf' | 'csv' | 'both';
    filters?: {
      propertyIds?: string[];
      categories?: string[];
      minAmount?: number;
      maxAmount?: number;
    };
  };
  schedule: {
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // HH:MM format
    timezone: string;
  };
  lastRun?: Timestamp;
  nextRun: Timestamp;
  isActive: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GeneratedReport {
  id: string;
  scheduledReportId?: string;
  name: string;
  reportType: string;
  generatedAt: Timestamp;
  generatedBy: string;
  generatedByName: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  data: {
    summary: Record<string, any>;
    details: Record<string, any>;
    charts?: string[]; // Base64 encoded chart images
  };
  fileUrls: {
    pdf?: string;
    csv?: string;
  };
  recipients: string[];
  status: 'generating' | 'completed' | 'failed' | 'sent';
  errorMessage?: string;
  metadata: {
    recordCount: number;
    fileSize: number;
    processingTime: number;
  };
}

const scheduledReportsCollection = collection(db, 'scheduled_reports');
const generatedReportsCollection = collection(db, 'generated_reports');

// Create scheduled report
export const createScheduledReport = async (
  reportData: Omit<ScheduledReport, 'id' | 'lastRun' | 'nextRun' | 'createdAt' | 'updatedAt'>,
  userId: string,
  userName: string
): Promise<string> => {
  try {
    const nextRun = calculateNextRun(reportData.frequency, reportData.schedule);
    
    const scheduleData: Omit<ScheduledReport, 'id'> = {
      ...reportData,
      nextRun: Timestamp.fromDate(nextRun),
      createdBy: userId,
      createdByName: userName,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    
    const docRef = await addDoc(scheduledReportsCollection, scheduleData);
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'scheduled_report', {
      action: 'create',
      reportId: docRef.id,
      reportName: reportData.name,
      frequency: reportData.frequency
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating scheduled report:', error);
    throw error;
  }
};

// Get scheduled reports
export const getScheduledReports = async (userId?: string): Promise<ScheduledReport[]> => {
  try {
    let q = query(scheduledReportsCollection, orderBy('createdAt', 'desc'));
    
    if (userId) {
      q = query(q, where('createdBy', '==', userId));
    }
    
    const querySnapshot = await getDocs(q);
    const reports: ScheduledReport[] = [];
    
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as ScheduledReport);
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting scheduled reports:', error);
    throw error;
  }
};

// Update scheduled report
export const updateScheduledReport = async (
  reportId: string,
  updates: Partial<ScheduledReport>,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'scheduled_reports', reportId);
    
    // Recalculate next run if schedule changed
    if (updates.frequency || updates.schedule) {
      const currentDoc = await getDoc(docRef);
      if (currentDoc.exists()) {
        const currentData = currentDoc.data() as ScheduledReport;
        const frequency = updates.frequency || currentData.frequency;
        const schedule = updates.schedule || currentData.schedule;
        updates.nextRun = Timestamp.fromDate(calculateNextRun(frequency, schedule));
      }
    }
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'scheduled_report', {
      action: 'update',
      reportId,
      updates
    });
  } catch (error) {
    console.error('Error updating scheduled report:', error);
    throw error;
  }
};

// Delete scheduled report
export const deleteScheduledReport = async (reportId: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'scheduled_reports', reportId);
    await deleteDoc(docRef);
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'scheduled_report', {
      action: 'delete',
      reportId
    });
  } catch (error) {
    console.error('Error deleting scheduled report:', error);
    throw error;
  }
};

// Generate report manually
export const generateReport = async (
  reportType: 'portfolio' | 'financial' | 'tenant' | 'maintenance' | 'comprehensive',
  options: {
    name: string;
    dateRange: { start: Date; end: Date };
    includeCharts: boolean;
    includeRawData: boolean;
    format: 'pdf' | 'csv' | 'both';
    recipients?: string[];
    filters?: any;
  },
  userId: string,
  userName: string
): Promise<string> => {
  try {
    const startTime = Date.now();
    
    // Create initial report record
    const reportData: Omit<GeneratedReport, 'id'> = {
      name: options.name,
      reportType,
      generatedAt: serverTimestamp() as Timestamp,
      generatedBy: userId,
      generatedByName: userName,
      dateRange: options.dateRange,
      data: { summary: {}, details: {} },
      fileUrls: {},
      recipients: options.recipients || [],
      status: 'generating',
      metadata: {
        recordCount: 0,
        fileSize: 0,
        processingTime: 0,
      },
    };
    
    const docRef = await addDoc(generatedReportsCollection, reportData);
    
    try {
      // Generate report data based on type
      let reportResults: any = {};
      
      switch (reportType) {
        case 'portfolio':
          reportResults = await getPortfolioOverview();
          break;
        case 'financial':
          reportResults = await getFinancialMetrics(options.dateRange);
          break;
        case 'tenant':
          reportResults = await getTenantAnalytics();
          break;
        case 'maintenance':
          reportResults = await getMaintenanceAnalytics();
          break;
        case 'comprehensive':
          reportResults = await generateComprehensiveReport(options.dateRange);
          break;
      }
      
      // Process and format data
      const processedData = processReportData(reportResults, reportType, options);
      
      // Generate files
      const fileUrls: any = {};
      
      if (options.format === 'csv' || options.format === 'both') {
        fileUrls.csv = await generateCSVReport(processedData, reportType);
      }
      
      if (options.format === 'pdf' || options.format === 'both') {
        fileUrls.pdf = await generatePDFReport(processedData, reportType, options.includeCharts);
      }
      
      const processingTime = Date.now() - startTime;
      
      // Update report with results
      await updateDoc(docRef, {
        data: processedData,
        fileUrls,
        status: 'completed',
        metadata: {
          recordCount: calculateRecordCount(processedData),
          fileSize: await calculateFileSize(fileUrls),
          processingTime,
        },
        updatedAt: serverTimestamp(),
      });
      
      // Send to recipients if specified
      if (options.recipients && options.recipients.length > 0) {
        await sendReportToRecipients(docRef.id, options.recipients);
        await updateDoc(docRef, { status: 'sent' });
      }
      
      // Log audit event
      await auditHelpers.logDataExport(userId, '', 'generated_report', {
        action: 'generate',
        reportId: docRef.id,
        reportType,
        recordCount: calculateRecordCount(processedData),
        processingTime
      });
      
      return docRef.id;
    } catch (error) {
      // Update report with error
      await updateDoc(docRef, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: serverTimestamp(),
      });
      throw error;
    }
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

// Generate comprehensive report
const generateComprehensiveReport = async (dateRange: { start: Date; end: Date }) => {
  const [portfolio, financial, tenant, maintenance] = await Promise.all([
    getPortfolioOverview(),
    getFinancialMetrics(dateRange),
    getTenantAnalytics(),
    getMaintenanceAnalytics()
  ]);
  
  return {
    portfolio,
    financial,
    tenant,
    maintenance,
    summary: {
      totalProperties: portfolio.totalProperties,
      totalUnits: portfolio.totalUnits,
      occupancyRate: portfolio.overallOccupancyRate,
      totalRevenue: financial.totalRevenue,
      netIncome: financial.netIncome,
      activeTenants: tenant.activeTenants,
      maintenanceRequests: maintenance.totalRequests,
      generatedAt: new Date().toISOString(),
    }
  };
};

// Process report data for different formats
const processReportData = (rawData: any, reportType: string, options: any) => {
  const summary: Record<string, any> = {};
  const details: Record<string, any> = {};
  
  switch (reportType) {
    case 'portfolio':
      summary.totalProperties = rawData.totalProperties;
      summary.overallOccupancyRate = rawData.overallOccupancyRate;
      summary.portfolioROI = rawData.portfolioROI;
      summary.netOperatingIncome = rawData.netOperatingIncome;
      details.propertyPerformance = rawData.propertyPerformance;
      break;
      
    case 'financial':
      summary.totalRevenue = rawData.totalRevenue;
      summary.totalExpenses = rawData.totalExpenses;
      summary.netIncome = rawData.netIncome;
      summary.profitMargin = rawData.profitMargin;
      details.monthlyBreakdown = rawData.monthlyBreakdown;
      break;
      
    case 'tenant':
      summary.totalTenants = rawData.totalTenants;
      summary.renewalRate = rawData.renewalRate;
      summary.averageTenantStay = rawData.averageTenantStay;
      summary.tenantSatisfactionScore = rawData.tenantSatisfactionScore;
      details.demographicBreakdown = rawData.demographicBreakdown;
      break;
      
    case 'maintenance':
      summary.totalRequests = rawData.totalRequests;
      summary.averageResolutionTime = rawData.averageResolutionTime;
      summary.totalCosts = rawData.totalCosts;
      summary.completionRate = (rawData.completedRequests / rawData.totalRequests) * 100;
      details.requestsByCategory = rawData.requestsByCategory;
      details.monthlyTrends = rawData.monthlyTrends;
      break;
      
    case 'comprehensive':
      Object.assign(summary, rawData.summary);
      Object.assign(details, {
        portfolio: rawData.portfolio,
        financial: rawData.financial,
        tenant: rawData.tenant,
        maintenance: rawData.maintenance,
      });
      break;
  }
  
  return { summary, details };
};

// Generate CSV report (simplified - in production would use proper CSV generation)
const generateCSVReport = async (data: any, reportType: string): Promise<string> => {
  // Simulate file generation and return a document ID or URL
  // In production, this would generate actual CSV files and upload to storage
  return `csv_${reportType}_${Date.now()}`;
};

// Generate PDF report (simplified - in production would use proper PDF generation)
const generatePDFReport = async (data: any, reportType: string, includeCharts: boolean): Promise<string> => {
  // Simulate file generation and return a document ID or URL
  // In production, this would generate actual PDF files with charts and upload to storage
  return `pdf_${reportType}_${Date.now()}`;
};

// Calculate next run time based on frequency and schedule
const calculateNextRun = (frequency: string, schedule: any): Date => {
  const now = new Date();
  const nextRun = new Date();
  
  switch (frequency) {
    case 'daily':
      nextRun.setDate(now.getDate() + 1);
      break;
      
    case 'weekly':
      const daysUntilTarget = (schedule.dayOfWeek - now.getDay() + 7) % 7;
      nextRun.setDate(now.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
      break;
      
    case 'monthly':
      nextRun.setMonth(now.getMonth() + 1);
      nextRun.setDate(schedule.dayOfMonth);
      if (nextRun < now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      break;
      
    case 'quarterly':
      nextRun.setMonth(now.getMonth() + 3);
      nextRun.setDate(schedule.dayOfMonth || 1);
      break;
  }
  
  // Set time
  const [hours, minutes] = schedule.time.split(':');
  nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  return nextRun;
};

// Get reports due for generation
export const getReportsDueForGeneration = async (): Promise<ScheduledReport[]> => {
  try {
    const now = Timestamp.now();
    
    const q = query(
      scheduledReportsCollection,
      where('isActive', '==', true),
      where('nextRun', '<=', now)
    );
    
    const querySnapshot = await getDocs(q);
    const reports: ScheduledReport[] = [];
    
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as ScheduledReport);
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting reports due for generation:', error);
    throw error;
  }
};

// Process scheduled reports (to be called by a background job)
export const processScheduledReports = async (): Promise<void> => {
  try {
    const dueReports = await getReportsDueForGeneration();
    
    for (const report of dueReports) {
      try {
        // Calculate date range based on frequency
        const dateRange = calculateDateRangeForReport(report.frequency, report.settings.dateRange);
        
        // Generate the report
        await generateReport(
          report.reportType,
          {
            name: `${report.name} - ${new Date().toLocaleDateString()}`,
            dateRange,
            includeCharts: report.settings.includeCharts,
            includeRawData: report.settings.includeRawData,
            format: report.settings.format,
            recipients: report.recipients.map(r => r.email),
            filters: report.settings.filters,
          },
          report.createdBy,
          'System'
        );
        
        // Update next run time
        const nextRun = calculateNextRun(report.frequency, report.schedule);
        await updateScheduledReport(
          report.id,
          {
            lastRun: Timestamp.now(),
            nextRun: Timestamp.fromDate(nextRun),
          },
          'system'
        );
        
        console.log(`Generated scheduled report: ${report.name}`);
      } catch (error) {
        console.error(`Error processing scheduled report ${report.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error processing scheduled reports:', error);
    throw error;
  }
};

// Calculate date range for report based on settings
const calculateDateRangeForReport = (frequency: string, dateRange: string) => {
  const end = new Date();
  const start = new Date();
  
  switch (dateRange) {
    case 'last_month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'last_quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'last_year':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case 'ytd':
      start.setMonth(0, 1); // January 1st
      break;
  }
  
  return { start, end };
};

// Send report to recipients
const sendReportToRecipients = async (reportId: string, recipients: string[]): Promise<void> => {
  // In production, this would send emails with report attachments
  console.log(`Sending report ${reportId} to recipients:`, recipients);
  
  // Simulate email sending
  for (const recipient of recipients) {
    try {
      // This would use the email service to send the report
      console.log(`Report sent to: ${recipient}`);
    } catch (error) {
      console.error(`Failed to send report to ${recipient}:`, error);
    }
  }
};

// Helper functions
const calculateRecordCount = (data: any): number => {
  let count = 0;
  
  if (data.details) {
    Object.values(data.details).forEach((value: any) => {
      if (Array.isArray(value)) {
        count += value.length;
      } else if (typeof value === 'object' && value !== null) {
        count += Object.keys(value).length;
      }
    });
  }
  
  return count;
};

const calculateFileSize = async (fileUrls: any): Promise<number> => {
  // In production, this would calculate actual file sizes
  return Math.floor(Math.random() * 1000000) + 100000; // Mock file size
};

// Get generated reports
export const getGeneratedReports = async (
  userId?: string,
  reportType?: string,
  limit?: number
): Promise<GeneratedReport[]> => {
  try {
    let q = query(generatedReportsCollection, orderBy('generatedAt', 'desc'));
    
    if (userId) {
      q = query(q, where('generatedBy', '==', userId));
    }
    
    if (reportType) {
      q = query(q, where('reportType', '==', reportType));
    }
    
    if (limit) {
      q = query(q, limit(limit));
    }
    
    const querySnapshot = await getDocs(q);
    const reports: GeneratedReport[] = [];
    
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as GeneratedReport);
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting generated reports:', error);
    throw error;
  }
};

// Get report statistics
export const getReportStatistics = async (userId?: string) => {
  try {
    const [scheduledReports, generatedReports] = await Promise.all([
      getScheduledReports(userId),
      getGeneratedReports(userId, undefined, 100)
    ]);
    
    const stats = {
      totalScheduled: scheduledReports.length,
      activeScheduled: scheduledReports.filter(r => r.isActive).length,
      totalGenerated: generatedReports.length,
      recentlyGenerated: generatedReports.filter(r => {
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return r.generatedAt.toDate() > dayAgo;
      }).length,
      byType: generatedReports.reduce((acc, report) => {
        acc[report.reportType] = (acc[report.reportType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: generatedReports.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting report statistics:', error);
    throw error;
  }
};