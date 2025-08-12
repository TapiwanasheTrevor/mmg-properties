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
  startAfter,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import {
  FinancialTransaction,
  PaymentRecord,
  Budget,
  ExpenseCategory,
  ReconciliationRecord,
  Currency,
  PaymentMethod,
  TransactionCategory,
  TransactionStatus,
  ReconciliationStatus,
  TransactionFormData,
  BudgetFormData,
  ExpenseFormData,
  ReportFilters,
  ReconciliationFilters,
  ZIMBABWE_TAX_RATES,
} from '@/lib/types/financials';

// Collection references
const transactionsCollection = collection(db, 'financial_transactions');
const paymentsCollection = collection(db, 'payment_records');
const budgetsCollection = collection(db, 'budgets');
const expenseCategoriesCollection = collection(db, 'expense_categories');
const reconciliationsCollection = collection(db, 'reconciliation_records');

// ============================================================================
// TRANSACTION SERVICES
// ============================================================================

export const createTransaction = async (
  transactionData: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isReconciled'>
): Promise<string> => {
  try {
    const docRef = await addDoc(transactionsCollection, {
      ...transactionData,
      status: 'pending' as TransactionStatus,
      isReconciled: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Failed to create transaction');
  }
};

export const getTransaction = async (id: string): Promise<FinancialTransaction | null> => {
  try {
    const docRef = doc(transactionsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FinancialTransaction;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw new Error('Failed to fetch transaction');
  }
};

export const updateTransaction = async (
  id: string,
  updates: Partial<Omit<FinancialTransaction, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(transactionsCollection, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Failed to update transaction');
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    const docRef = doc(transactionsCollection, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction');
  }
};

interface GetTransactionsOptions {
  type?: TransactionCategory;
  status?: TransactionStatus;
  tenantId?: string;
  propertyId?: string;
  unitId?: string;
  leaseId?: string;
  paymentMethod?: PaymentMethod;
  currency?: Currency;
  dateFrom?: Date;
  dateTo?: Date;
  reconciliationStatus?: ReconciliationStatus;
  isReconciled?: boolean;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
  searchTerm?: string;
}

export const getTransactions = async (options: GetTransactionsOptions = {}) => {
  try {
    let q = query(transactionsCollection);

    // Apply filters
    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }
    
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    if (options.tenantId) {
      q = query(q, where('tenantId', '==', options.tenantId));
    }
    
    if (options.propertyId) {
      q = query(q, where('propertyId', '==', options.propertyId));
    }
    
    if (options.unitId) {
      q = query(q, where('unitId', '==', options.unitId));
    }
    
    if (options.leaseId) {
      q = query(q, where('leaseId', '==', options.leaseId));
    }
    
    if (options.paymentMethod) {
      q = query(q, where('paymentMethod', '==', options.paymentMethod));
    }

    if (options.currency) {
      q = query(q, where('currency', '==', options.currency));
    }

    if (options.isReconciled !== undefined) {
      q = query(q, where('isReconciled', '==', options.isReconciled));
    }

    if (options.reconciliationStatus) {
      q = query(q, where('reconciliationStatus', '==', options.reconciliationStatus));
    }

    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'));

    // Add pagination
    if (options.pageSize) {
      q = query(q, limit(options.pageSize));
    }

    if (options.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }

    const querySnapshot = await getDocs(q);
    let transactions: FinancialTransaction[] = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as FinancialTransaction);
    });

    // Client-side filtering for complex queries
    if (options.dateFrom) {
      transactions = transactions.filter(t => 
        t.createdAt.toDate() >= options.dateFrom!
      );
    }
    
    if (options.dateTo) {
      transactions = transactions.filter(t => 
        t.createdAt.toDate() <= options.dateTo!
      );
    }

    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      transactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchLower) ||
        t.reference.toLowerCase().includes(searchLower) ||
        t.propertyName?.toLowerCase().includes(searchLower) ||
        t.tenantName?.toLowerCase().includes(searchLower) ||
        t.unitNumber?.toLowerCase().includes(searchLower)
      );
    }

    return {
      transactions,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === (options.pageSize || 0),
    };
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
};

// Bulk operations for transactions
export const bulkUpdateTransactions = async (
  transactionIds: string[],
  updates: Partial<FinancialTransaction>
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    transactionIds.forEach(id => {
      const docRef = doc(transactionsCollection, id);
      batch.update(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error bulk updating transactions:', error);
    throw new Error('Failed to update transactions');
  }
};

export const bulkReconcileTransactions = async (
  transactionIds: string[],
  reconciledBy: string
): Promise<void> => {
  try {
    await bulkUpdateTransactions(transactionIds, {
      isReconciled: true,
      reconciliationStatus: 'reconciled',
      reconciledBy,
      reconciledAt: serverTimestamp() as Timestamp,
    });
  } catch (error) {
    console.error('Error bulk reconciling transactions:', error);
    throw new Error('Failed to reconcile transactions');
  }
};

// ============================================================================
// PAYMENT RECORD SERVICES
// ============================================================================

export const createPaymentRecord = async (
  paymentData: Omit<PaymentRecord, 'id' | 'createdAt' | 'processedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(paymentsCollection, {
      ...paymentData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw new Error('Failed to create payment record');
  }
};

export const getPaymentRecord = async (id: string): Promise<PaymentRecord | null> => {
  try {
    const docRef = doc(paymentsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as PaymentRecord;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting payment record:', error);
    throw new Error('Failed to fetch payment record');
  }
};

export const updatePaymentRecord = async (
  id: string,
  updates: Partial<Omit<PaymentRecord, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(paymentsCollection, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating payment record:', error);
    throw new Error('Failed to update payment record');
  }
};

export const getPaymentRecords = async (filters: {
  transactionId?: string;
  status?: string;
  paymentMethod?: PaymentMethod;
  dateFrom?: Date;
  dateTo?: Date;
} = {}) => {
  try {
    let q = query(paymentsCollection);

    if (filters.transactionId) {
      q = query(q, where('transactionId', '==', filters.transactionId));
    }

    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters.paymentMethod) {
      q = query(q, where('paymentMethod', '==', filters.paymentMethod));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    let payments: PaymentRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() } as PaymentRecord);
    });

    // Client-side date filtering
    if (filters.dateFrom) {
      payments = payments.filter(p => 
        p.createdAt.toDate() >= filters.dateFrom!
      );
    }
    
    if (filters.dateTo) {
      payments = payments.filter(p => 
        p.createdAt.toDate() <= filters.dateTo!
      );
    }

    return payments;
  } catch (error) {
    console.error('Error getting payment records:', error);
    throw new Error('Failed to fetch payment records');
  }
};

// ============================================================================
// EXPENSE CATEGORY SERVICES
// ============================================================================

export const createExpenseCategory = async (
  categoryData: Omit<ExpenseCategory, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(expenseCategoriesCollection, {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating expense category:', error);
    throw new Error('Failed to create expense category');
  }
};

export const getExpenseCategories = async (includeInactive = false): Promise<ExpenseCategory[]> => {
  try {
    let q = query(expenseCategoriesCollection);

    if (!includeInactive) {
      q = query(q, where('isActive', '==', true));
    }

    q = query(q, orderBy('name'));

    const querySnapshot = await getDocs(q);
    const categories: ExpenseCategory[] = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as ExpenseCategory);
    });

    return categories;
  } catch (error) {
    console.error('Error getting expense categories:', error);
    throw new Error('Failed to fetch expense categories');
  }
};

export const updateExpenseCategory = async (
  id: string,
  updates: Partial<Omit<ExpenseCategory, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(expenseCategoriesCollection, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating expense category:', error);
    throw new Error('Failed to update expense category');
  }
};

export const deleteExpenseCategory = async (id: string): Promise<void> => {
  try {
    const docRef = doc(expenseCategoriesCollection, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting expense category:', error);
    throw new Error('Failed to delete expense category');
  }
};

// ============================================================================
// BUDGET SERVICES
// ============================================================================

export const createBudget = async (
  budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'totalBudgeted' | 'totalActual' | 'totalVariance'>
): Promise<string> => {
  try {
    // Calculate totals
    const totalBudgeted = Object.values(budgetData.categories).reduce(
      (sum, category) => sum + category.budgeted,
      0
    );

    const docRef = await addDoc(budgetsCollection, {
      ...budgetData,
      totalBudgeted,
      totalActual: 0,
      totalVariance: -totalBudgeted,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw new Error('Failed to create budget');
  }
};

export const getBudget = async (id: string): Promise<Budget | null> => {
  try {
    const docRef = doc(budgetsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Budget;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting budget:', error);
    throw new Error('Failed to fetch budget');
  }
};

export const getBudgets = async (filters: {
  propertyId?: string;
  status?: string;
  period?: string;
} = {}): Promise<Budget[]> => {
  try {
    let q = query(budgetsCollection);

    if (filters.propertyId) {
      q = query(q, where('propertyId', '==', filters.propertyId));
    }

    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters.period) {
      q = query(q, where('period', '==', filters.period));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const budgets: Budget[] = [];
    
    querySnapshot.forEach((doc) => {
      budgets.push({ id: doc.id, ...doc.data() } as Budget);
    });

    return budgets;
  } catch (error) {
    console.error('Error getting budgets:', error);
    throw new Error('Failed to fetch budgets');
  }
};

export const updateBudget = async (
  id: string,
  updates: Partial<Omit<Budget, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(budgetsCollection, id);
    
    // Recalculate totals if categories are updated
    if (updates.categories) {
      const totalBudgeted = Object.values(updates.categories).reduce(
        (sum, category) => sum + category.budgeted,
        0
      );
      
      const totalActual = Object.values(updates.categories).reduce(
        (sum, category) => sum + category.actual,
        0
      );

      updates.totalBudgeted = totalBudgeted;
      updates.totalActual = totalActual;
      updates.totalVariance = totalActual - totalBudgeted;
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    throw new Error('Failed to update budget');
  }
};

export const deleteBudget = async (id: string): Promise<void> => {
  try {
    const docRef = doc(budgetsCollection, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw new Error('Failed to delete budget');
  }
};

// ============================================================================
// RECONCILIATION SERVICES
// ============================================================================

export const createReconciliation = async (
  reconciliationData: Omit<ReconciliationRecord, 'id' | 'createdAt' | 'completedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(reconciliationsCollection, {
      ...reconciliationData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating reconciliation:', error);
    throw new Error('Failed to create reconciliation');
  }
};

export const getReconciliations = async (filters: ReconciliationFilters = {}): Promise<ReconciliationRecord[]> => {
  try {
    let q = query(reconciliationsCollection);

    if (filters.period) {
      q = query(q, where('period', '==', filters.period));
    }

    if (filters.propertyId) {
      q = query(q, where('propertyId', '==', filters.propertyId));
    }

    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const reconciliations: ReconciliationRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      reconciliations.push({ id: doc.id, ...doc.data() } as ReconciliationRecord);
    });

    return reconciliations;
  } catch (error) {
    console.error('Error getting reconciliations:', error);
    throw new Error('Failed to fetch reconciliations');
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const calculateTransactionAllocation = (
  amount: number,
  type: TransactionCategory,
  currency: Currency,
  exchangeRate?: number
): {
  ownerAmount: number;
  mmgCommission: number;
  agentCommission?: number;
  vatAmount?: number;
  withholdingTax?: number;
} => {
  let ownerAmount = amount;
  let mmgCommission = 0;
  let agentCommission = 0;
  let vatAmount = 0;
  let withholdingTax = 0;

  // Calculate VAT if applicable
  if (['service_fee', 'commission'].includes(type)) {
    vatAmount = amount * (ZIMBABWE_TAX_RATES.VAT / 100);
  }

  // Calculate withholding tax
  if (type === 'rent_payment') {
    withholdingTax = amount * (ZIMBABWE_TAX_RATES.WITHHOLDING_TAX.RENT / 100);
  } else if (type === 'commission') {
    withholdingTax = amount * (ZIMBABWE_TAX_RATES.WITHHOLDING_TAX.COMMISSION / 100);
  }

  // Calculate commission split for rent payments
  if (type === 'rent_payment') {
    mmgCommission = amount * 0.15; // 15% MMG commission
    agentCommission = amount * 0.05; // 5% agent commission (if applicable)
    ownerAmount = amount - mmgCommission - agentCommission - withholdingTax;
  }

  return {
    ownerAmount,
    mmgCommission,
    agentCommission: agentCommission > 0 ? agentCommission : undefined,
    vatAmount: vatAmount > 0 ? vatAmount : undefined,
    withholdingTax: withholdingTax > 0 ? withholdingTax : undefined,
  };
};

export const uploadTransactionAttachment = async (
  transactionId: string,
  file: File,
  type: 'receipt' | 'proof' | 'other' = 'other'
): Promise<string> => {
  try {
    const fileRef = ref(
      storage,
      `transactions/${transactionId}/${type}_${Date.now()}_${file.name}`
    );
    
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw new Error('Failed to upload attachment');
  }
};

export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USD' && toCurrency === 'ZWL') {
    return amount * exchangeRate;
  } else if (fromCurrency === 'ZWL' && toCurrency === 'USD') {
    return amount / exchangeRate;
  }
  
  return amount;
};

// Default expense categories for Zimbabwe context
export const createDefaultExpenseCategories = async (): Promise<void> => {
  const defaultCategories = [
    {
      name: 'Maintenance & Repairs',
      description: 'Property maintenance, repairs, and renovations',
      isActive: true,
      isTaxDeductible: true,
      vatApplicable: true,
      withholdingTaxApplicable: false,
      vatRate: ZIMBABWE_TAX_RATES.VAT,
    },
    {
      name: 'Utilities',
      description: 'Water, electricity, gas, and other utilities',
      isActive: true,
      isTaxDeductible: true,
      vatApplicable: true,
      withholdingTaxApplicable: false,
      vatRate: ZIMBABWE_TAX_RATES.VAT,
    },
    {
      name: 'Insurance',
      description: 'Property insurance premiums',
      isActive: true,
      isTaxDeductible: true,
      vatApplicable: false,
      withholdingTaxApplicable: false,
    },
    {
      name: 'Management Fees',
      description: 'Property management and administration fees',
      isActive: true,
      isTaxDeductible: true,
      vatApplicable: true,
      withholdingTaxApplicable: true,
      vatRate: ZIMBABWE_TAX_RATES.VAT,
      withholdingTaxRate: ZIMBABWE_TAX_RATES.WITHHOLDING_TAX.SERVICES,
    },
    {
      name: 'Legal & Professional',
      description: 'Legal fees, accounting, and professional services',
      isActive: true,
      isTaxDeductible: true,
      vatApplicable: true,
      withholdingTaxApplicable: true,
      vatRate: ZIMBABWE_TAX_RATES.VAT,
      withholdingTaxRate: ZIMBABWE_TAX_RATES.WITHHOLDING_TAX.SERVICES,
    },
    {
      name: 'Security',
      description: 'Security services and equipment',
      isActive: true,
      isTaxDeductible: true,
      vatApplicable: true,
      withholdingTaxApplicable: true,
      vatRate: ZIMBABWE_TAX_RATES.VAT,
      withholdingTaxRate: ZIMBABWE_TAX_RATES.WITHHOLDING_TAX.SERVICES,
    },
    {
      name: 'Gardening & Landscaping',
      description: 'Garden maintenance and landscaping',
      isActive: true,
      isTaxDeductible: true,
      vatApplicable: true,
      withholdingTaxApplicable: true,
      vatRate: ZIMBABWE_TAX_RATES.VAT,
      withholdingTaxRate: ZIMBABWE_TAX_RATES.WITHHOLDING_TAX.SERVICES,
    },
    {
      name: 'Marketing & Advertising',
      description: 'Property marketing and advertising costs',
      isActive: true,
      isTaxDeductible: true,
      vatApplicable: true,
      withholdingTaxApplicable: false,
      vatRate: ZIMBABWE_TAX_RATES.VAT,
    },
    {
      name: 'Travel & Transport',
      description: 'Property-related travel and transport costs',
      isActive: true,
      isTaxDeductible: true,
      vatApplicable: true,
      withholdingTaxApplicable: false,
      vatRate: ZIMBABWE_TAX_RATES.VAT,
    },
    {
      name: 'Other Expenses',
      description: 'Miscellaneous property-related expenses',
      isActive: true,
      isTaxDeductible: true,
      vatApplicable: true,
      withholdingTaxApplicable: false,
      vatRate: ZIMBABWE_TAX_RATES.VAT,
    },
  ];

  try {
    for (const category of defaultCategories) {
      await createExpenseCategory(category);
    }
  } catch (error) {
    console.error('Error creating default expense categories:', error);
    throw new Error('Failed to create default expense categories');
  }
};