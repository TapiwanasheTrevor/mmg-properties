import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// ============================================================================
// ENHANCED FINANCIAL TYPES FOR MMG PLATFORM
// ============================================================================

// Core Financial Types
export type Currency = 'USD' | 'ZWL';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'ecocash' | 'onemoney' | 'swipe' | 'rtgs' | 'nostro';
export type TransactionCategory = 
  | 'rent_payment' 
  | 'deposit' 
  | 'maintenance_cost' 
  | 'service_fee' 
  | 'utility_bill'
  | 'insurance'
  | 'tax_payment'
  | 'commission'
  | 'refund'
  | 'penalty'
  | 'other';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'reconciled';
export type ReconciliationStatus = 'pending' | 'reconciled' | 'discrepancy' | 'disputed';

// Enhanced Transaction Interface
export interface FinancialTransaction {
  id: string;
  type: TransactionCategory;
  amount: number;
  currency: Currency;
  exchangeRate?: number; // For USD-ZWL conversions
  description: string;
  
  // Property & Tenant Information
  propertyId: string;
  propertyName?: string;
  unitId?: string;
  unitNumber?: string;
  tenantId?: string;
  tenantName?: string;
  leaseId?: string;
  
  // Payment Information
  paymentMethod: PaymentMethod;
  reference: string;
  bankReference?: string;
  receiptNumber?: string;
  
  // Status & Processing
  status: TransactionStatus;
  reconciliationStatus?: ReconciliationStatus;
  isReconciled: boolean;
  
  // Allocation (Zimbabwe tax considerations)
  allocation: {
    ownerAmount: number;
    mmgCommission: number;
    agentCommission?: number;
    vatAmount?: number;
    withholdingTax?: number;
  };
  
  // Proof & Documentation
  attachments: string[];
  receiptUrl?: string;
  proofOfPayment?: string[];
  
  // Metadata
  createdBy: string;
  processedBy?: string;
  reconciledBy?: string;
  notes?: string;
  
  // Timestamps
  createdAt: Timestamp;
  processedAt?: Timestamp;
  reconciledAt?: Timestamp;
  updatedAt: Timestamp;
}

// Budget Management
export interface Budget {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Timestamp;
  endDate: Timestamp;
  
  categories: {
    [category: string]: {
      budgeted: number;
      actual: number;
      variance: number;
      currency: Currency;
    };
  };
  
  totalBudgeted: number;
  totalActual: number;
  totalVariance: number;
  
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Expense Categories for Zimbabwe Context
export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
  isTaxDeductible: boolean;
  vatApplicable: boolean;
  withholdingTaxApplicable: boolean;
  
  // Zimbabwe-specific tax rates
  vatRate?: number; // Default 14.5%
  withholdingTaxRate?: number; // Varies by category
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Payment Processing
export interface PaymentRecord {
  id: string;
  transactionId: string;
  amount: number;
  currency: Currency;
  exchangeRate?: number;
  
  paymentMethod: PaymentMethod;
  reference: string;
  
  // Zimbabwe-specific payment details
  ecocashReference?: string;
  onemoneyReference?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    branch?: string;
    swiftCode?: string;
  };
  
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  failureReason?: string;
  
  createdAt: Timestamp;
  processedAt?: Timestamp;
}

// Reconciliation
export interface ReconciliationRecord {
  id: string;
  period: string; // YYYY-MM format
  propertyId?: string;
  
  // Bank statement reconciliation
  bankStatementTotal: number;
  systemTotal: number;
  difference: number;
  
  // Individual transaction reconciliation
  reconciledTransactions: string[];
  unreconciledTransactions: string[];
  discrepancies: {
    transactionId: string;
    systemAmount: number;
    bankAmount: number;
    difference: number;
    reason?: string;
  }[];
  
  status: ReconciliationStatus;
  
  // Process information
  reconciledBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  notes?: string;
  
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// Financial Reports
export interface FinancialReport {
  id: string;
  type: 'income_statement' | 'cash_flow' | 'rent_roll' | 'expense_report' | 'tax_report' | 'profitability';
  title: string;
  
  // Report Parameters
  propertyIds: string[];
  dateFrom: Timestamp;
  dateTo: Timestamp;
  currency: Currency;
  includeProjections?: boolean;
  
  // Report Data
  data: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    
    // Breakdown by category
    incomeBreakdown: Record<string, number>;
    expenseBreakdown: Record<string, number>;
    
    // Month-over-month analysis
    monthlyData?: Array<{
      month: string;
      income: number;
      expenses: number;
      net: number;
    }>;
    
    // Property-wise breakdown
    propertyBreakdown?: Array<{
      propertyId: string;
      propertyName: string;
      income: number;
      expenses: number;
      net: number;
      occupancyRate: number;
    }>;
    
    // Zimbabwe-specific data
    taxData?: {
      vatCollected: number;
      vatPaid: number;
      withholdingTaxDeducted: number;
      corporateTaxDue: number;
    };
  };
  
  // Report Status
  status: 'generating' | 'ready' | 'error';
  fileUrl?: string;
  
  createdBy: string;
  createdAt: Timestamp;
}

// Rent Collection Tracking
export interface RentCollection {
  id: string;
  leaseId: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  
  // Collection Period
  period: string; // YYYY-MM format
  dueDate: Timestamp;
  
  // Amount Details
  rentAmount: number;
  currency: Currency;
  
  // Payment Status
  amountPaid: number;
  amountOutstanding: number;
  isFullyPaid: boolean;
  isOverdue: boolean;
  daysOverdue: number;
  
  // Payments made
  payments: {
    transactionId: string;
    amount: number;
    paidDate: Timestamp;
    paymentMethod: PaymentMethod;
  }[];
  
  // Late fees and penalties
  lateFees: number;
  penalties: number;
  
  // Collection Status
  collectionStatus: 'current' | 'overdue' | 'in_arrears' | 'eviction_notice' | 'legal_action';
  
  // Reminders sent
  remindersSent: {
    type: 'initial' | 'reminder' | 'final_notice' | 'legal_notice';
    sentDate: Timestamp;
    method: 'email' | 'sms' | 'whatsapp' | 'letter';
  }[];
  
  notes?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Financial Dashboard Metrics
export interface FinancialMetrics {
  period: string;
  currency: Currency;
  
  // Core Metrics
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  
  // Collection Metrics
  rentDue: number;
  rentCollected: number;
  collectionRate: number;
  outstandingAmount: number;
  
  // Property Performance
  occupancyRate: number;
  averageRentPSF: number;
  
  // Monthly Trends
  monthlyTrends: {
    month: string;
    income: number;
    expenses: number;
    net: number;
    collectionRate: number;
  }[];
  
  // Top Performing Properties
  topProperties: {
    propertyId: string;
    propertyName: string;
    netIncome: number;
    roi: number;
  }[];
  
  // Expense Categories
  expenseByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  
  // Collection Status
  collectionStatus: {
    current: number;
    overdue: number;
    inArrears: number;
  };
  
  generatedAt: Timestamp;
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const CurrencySchema = z.enum(['USD', 'ZWL']);
export const PaymentMethodSchema = z.enum(['cash', 'bank_transfer', 'ecocash', 'onemoney', 'swipe', 'rtgs', 'nostro']);
export const TransactionCategorySchema = z.enum([
  'rent_payment', 'deposit', 'maintenance_cost', 'service_fee', 'utility_bill',
  'insurance', 'tax_payment', 'commission', 'refund', 'penalty', 'other'
]);

export const TransactionStatusSchema = z.enum(['pending', 'completed', 'failed', 'cancelled', 'reconciled']);

export const FinancialTransactionSchema = z.object({
  type: TransactionCategorySchema,
  amount: z.number().positive('Amount must be positive'),
  currency: CurrencySchema,
  exchangeRate: z.number().positive().optional(),
  description: z.string().min(1, 'Description is required'),
  
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional(),
  tenantId: z.string().optional(),
  leaseId: z.string().optional(),
  
  paymentMethod: PaymentMethodSchema,
  reference: z.string().min(1, 'Reference is required'),
  bankReference: z.string().optional(),
  receiptNumber: z.string().optional(),
  
  allocation: z.object({
    ownerAmount: z.number(),
    mmgCommission: z.number(),
    agentCommission: z.number().optional(),
    vatAmount: z.number().optional(),
    withholdingTax: z.number().optional(),
  }),
  
  attachments: z.array(z.string().url()).default([]),
  notes: z.string().optional(),
});

export const BudgetSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  name: z.string().min(1, 'Budget name is required'),
  description: z.string().optional(),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  startDate: z.date(),
  endDate: z.date(),
  
  categories: z.record(z.object({
    budgeted: z.number().min(0),
    currency: CurrencySchema,
  })),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const ExpenseCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentCategoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  isTaxDeductible: z.boolean().default(false),
  vatApplicable: z.boolean().default(true),
  withholdingTaxApplicable: z.boolean().default(false),
  
  vatRate: z.number().min(0).max(100).optional(),
  withholdingTaxRate: z.number().min(0).max(100).optional(),
});

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface TransactionFormData {
  type: TransactionCategory;
  amount: number;
  currency: Currency;
  description: string;
  propertyId: string;
  unitId?: string;
  tenantId?: string;
  paymentMethod: PaymentMethod;
  reference: string;
  receiptNumber?: string;
  vatAmount?: number;
  withholdingTax?: number;
  attachments?: File[];
  notes?: string;
}

export interface BudgetFormData {
  propertyId: string;
  name: string;
  description?: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  categories: Record<string, { budgeted: number; currency: Currency }>;
}

export interface ExpenseFormData {
  categoryId: string;
  amount: number;
  currency: Currency;
  description: string;
  propertyId: string;
  unitId?: string;
  paymentMethod: PaymentMethod;
  reference: string;
  vatAmount?: number;
  withholdingTax?: number;
  attachments?: File[];
  notes?: string;
}

// ============================================================================
// REPORT FILTERS AND OPTIONS
// ============================================================================

export interface ReportFilters {
  propertyIds?: string[];
  dateFrom: Date;
  dateTo: Date;
  currency: Currency;
  categories?: TransactionCategory[];
  status?: TransactionStatus[];
  includeProjections?: boolean;
  groupBy?: 'property' | 'category' | 'month' | 'tenant';
}

export interface ReconciliationFilters {
  period: string;
  propertyId?: string;
  status?: ReconciliationStatus;
  includeReconciled?: boolean;
}

// ============================================================================
// UTILITIES AND CONSTANTS
// ============================================================================

// Zimbabwe Tax Rates (as of 2024)
export const ZIMBABWE_TAX_RATES = {
  VAT: 14.5,
  WITHHOLDING_TAX: {
    RENT: 5,
    SERVICES: 10,
    COMMISSION: 10,
  },
  CORPORATE_TAX: 24.72,
} as const;

// Payment Method Labels
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  ecocash: 'EcoCash',
  onemoney: 'OneMoney',
  swipe: 'Card Payment',
  rtgs: 'RTGS',
  nostro: 'Nostro Account',
};

// Transaction Category Labels
export const TRANSACTION_CATEGORY_LABELS: Record<TransactionCategory, string> = {
  rent_payment: 'Rent Payment',
  deposit: 'Security Deposit',
  maintenance_cost: 'Maintenance Cost',
  service_fee: 'Service Fee',
  utility_bill: 'Utility Bill',
  insurance: 'Insurance',
  tax_payment: 'Tax Payment',
  commission: 'Commission',
  refund: 'Refund',
  penalty: 'Penalty/Late Fee',
  other: 'Other',
};

// Currency Symbols
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  ZWL: 'Z$',
};