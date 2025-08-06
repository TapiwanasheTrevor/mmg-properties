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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction, TransactionType, PaymentMethod, TransactionStatus, Currency } from '@/lib/types';

// Transactions collection reference
const transactionsCollection = collection(db, 'transactions');

// Create a new transaction
export const createTransaction = async (
  transactionData: Omit<Transaction, 'id' | 'createdAt' | 'status'>
): Promise<string> => {
  try {
    const docRef = await addDoc(transactionsCollection, {
      ...transactionData,
      status: 'pending' as TransactionStatus,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Get a single transaction by ID
export const getTransaction = async (transactionId: string): Promise<Transaction | null> => {
  try {
    const docRef = doc(db, 'transactions', transactionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Transaction;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
};

// Update a transaction
export const updateTransaction = async (
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'transactions', transactionId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (transactionId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Get transactions with filtering and pagination
interface GetTransactionsOptions {
  type?: TransactionType;
  status?: TransactionStatus;
  tenantId?: string;
  propertyId?: string;
  unitId?: string;
  leaseId?: string;
  paymentMethod?: PaymentMethod;
  dateFrom?: Date;
  dateTo?: Date;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
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

    // Add ordering (most recent first)
    q = query(q, orderBy('createdAt', 'desc'));

    // Add pagination
    if (options.pageSize) {
      q = query(q, limit(options.pageSize));
    }

    if (options.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });

    // Client-side date filtering (for better performance, use Firestore date queries)
    let filteredTransactions = transactions;
    
    if (options.dateFrom) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.createdAt.toDate() >= options.dateFrom!
      );
    }
    
    if (options.dateTo) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.createdAt.toDate() <= options.dateTo!
      );
    }

    return {
      transactions: filteredTransactions,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === (options.pageSize || 0),
    };
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

// Process a transaction (mark as completed)
export const processTransaction = async (
  transactionId: string,
  processingData?: {
    processedAt?: Timestamp;
    receipt?: string;
    proof?: string[];
    notes?: string;
  }
): Promise<void> => {
  try {
    const updates: Partial<Transaction> = {
      status: 'completed',
      processedAt: processingData?.processedAt || (serverTimestamp() as Timestamp),
      ...processingData,
    };
    
    await updateTransaction(transactionId, updates);
  } catch (error) {
    console.error('Error processing transaction:', error);
    throw error;
  }
};

// Mark transaction as failed
export const failTransaction = async (
  transactionId: string,
  reason?: string
): Promise<void> => {
  try {
    await updateTransaction(transactionId, {
      status: 'failed',
      description: reason ? `${reason}` : undefined,
    });
  } catch (error) {
    console.error('Error failing transaction:', error);
    throw error;
  }
};

// Record rent payment
export const recordRentPayment = async (
  tenantId: string,
  leaseId: string,
  unitId: string,
  propertyId: string,
  amount: number,
  currency: Currency,
  paymentMethod: PaymentMethod,
  reference: string,
  description?: string,
  proof?: string[]
): Promise<string> => {
  try {
    // Get lease information for allocation calculation
    const { getLease } = await import('./leases');
    const lease = await getLease(leaseId);
    
    if (!lease) {
      throw new Error('Lease not found');
    }

    // Calculate allocation (default: 85% owner, 15% MMG)
    const ownerShare = amount * 0.85;
    const mmgShare = amount * 0.15;

    const transactionData: Omit<Transaction, 'id' | 'createdAt' | 'status'> = {
      type: 'rent_payment',
      amount,
      currency,
      tenantId,
      propertyId,
      unitId,
      leaseId,
      paymentMethod,
      reference,
      description: description || `Rent payment for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      proof: proof || [],
      allocatedTo: {
        owner: ownerShare,
        mmg: mmgShare,
      },
    };

    return await createTransaction(transactionData);
  } catch (error) {
    console.error('Error recording rent payment:', error);
    throw error;
  }
};

// Record deposit payment
export const recordDepositPayment = async (
  tenantId: string,
  leaseId: string,
  unitId: string,
  propertyId: string,
  amount: number,
  currency: Currency,
  paymentMethod: PaymentMethod,
  reference: string,
  description?: string,
  proof?: string[]
): Promise<string> => {
  try {
    const transactionData: Omit<Transaction, 'id' | 'createdAt' | 'status'> = {
      type: 'deposit',
      amount,
      currency,
      tenantId,
      propertyId,
      unitId,
      leaseId,
      paymentMethod,
      reference,
      description: description || 'Security deposit payment',
      proof: proof || [],
      allocatedTo: {
        owner: amount, // Deposits go entirely to owner
        mmg: 0,
      },
    };

    return await createTransaction(transactionData);
  } catch (error) {
    console.error('Error recording deposit payment:', error);
    throw error;
  }
};

// Record maintenance expense
export const recordMaintenanceExpense = async (
  requestId: string,
  propertyId: string,
  unitId: string | undefined,
  amount: number,
  currency: Currency,
  description: string,
  proof?: string[]
): Promise<string> => {
  try {
    const transactionData: Omit<Transaction, 'id' | 'createdAt' | 'status'> = {
      type: 'maintenance_cost',
      amount: -amount, // Negative for expenses
      currency,
      propertyId,
      unitId,
      requestId,
      paymentMethod: 'bank_transfer', // Default for expenses
      reference: `MAINT-${requestId.slice(0, 8)}`,
      description,
      proof: proof || [],
      allocatedTo: {
        owner: -amount, // Expense reduces owner income
        mmg: 0,
      },
    };

    return await createTransaction(transactionData);
  } catch (error) {
    console.error('Error recording maintenance expense:', error);
    throw error;
  }
};

// Get transactions by tenant
export const getTransactionsByTenant = async (tenantId: string): Promise<Transaction[]> => {
  const result = await getTransactions({ tenantId });
  return result.transactions;
};

// Get transactions by property
export const getTransactionsByProperty = async (propertyId: string): Promise<Transaction[]> => {
  const result = await getTransactions({ propertyId });
  return result.transactions;
};

// Get transactions by lease
export const getTransactionsByLease = async (leaseId: string): Promise<Transaction[]> => {
  const result = await getTransactions({ leaseId });
  return result.transactions;
};

// Get rent payments
export const getRentPayments = async (filters?: Partial<GetTransactionsOptions>): Promise<Transaction[]> => {
  const result = await getTransactions({ ...filters, type: 'rent_payment' });
  return result.transactions;
};

// Get pending transactions
export const getPendingTransactions = async (): Promise<Transaction[]> => {
  const result = await getTransactions({ status: 'pending' });
  return result.transactions;
};

// Get completed transactions for date range
export const getCompletedTransactions = async (
  dateFrom: Date,
  dateTo: Date,
  filters?: Partial<GetTransactionsOptions>
): Promise<Transaction[]> => {
  const result = await getTransactions({ 
    ...filters, 
    status: 'completed',
    dateFrom,
    dateTo 
  });
  return result.transactions;
};

// Calculate financial summary
export const getFinancialSummary = async (
  propertyId?: string,
  dateFrom?: Date,
  dateTo?: Date
) => {
  try {
    const filters: GetTransactionsOptions = {
      status: 'completed',
      pageSize: 1000,
    };
    
    if (propertyId) filters.propertyId = propertyId;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const result = await getTransactions(filters);
    const transactions = result.transactions;

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      rentPayments: 0,
      deposits: 0,
      maintenanceCosts: 0,
      serviceFees: 0,
      transactionCount: transactions.length,
      ownerShare: 0,
      mmgShare: 0,
      byMonth: {} as Record<string, any>,
      byCategory: {} as Record<string, number>,
    };

    transactions.forEach(transaction => {
      const amount = transaction.amount;
      const monthKey = format(transaction.createdAt.toDate(), 'yyyy-MM');
      
      // Initialize month if not exists
      if (!summary.byMonth[monthKey]) {
        summary.byMonth[monthKey] = {
          income: 0,
          expenses: 0,
          net: 0,
          transactions: 0,
        };
      }

      // Update totals
      if (amount > 0) {
        summary.totalIncome += amount;
        summary.byMonth[monthKey].income += amount;
      } else {
        summary.totalExpenses += Math.abs(amount);
        summary.byMonth[monthKey].expenses += Math.abs(amount);
      }

      summary.byMonth[monthKey].net += amount;
      summary.byMonth[monthKey].transactions += 1;

      // Update by category
      summary.byCategory[transaction.type] = (summary.byCategory[transaction.type] || 0) + amount;

      // Update specific types
      switch (transaction.type) {
        case 'rent_payment':
          summary.rentPayments += amount;
          break;
        case 'deposit':
          summary.deposits += amount;
          break;
        case 'maintenance_cost':
          summary.maintenanceCosts += Math.abs(amount);
          break;
        case 'service_fee':
          summary.serviceFees += Math.abs(amount);
          break;
      }

      // Update allocations
      summary.ownerShare += transaction.allocatedTo.owner;
      summary.mmgShare += transaction.allocatedTo.mmg;
      if (transaction.allocatedTo.agent) {
        summary.mmgShare += transaction.allocatedTo.agent;
      }
    });

    summary.netIncome = summary.totalIncome - summary.totalExpenses;

    return summary;
  } catch (error) {
    console.error('Error calculating financial summary:', error);
    throw error;
  }
};

// Get overdue rent payments
export const getOverdueRentPayments = async (): Promise<{
  tenant: string;
  lease: string;
  unit: string;
  property: string;
  amountDue: number;
  daysOverdue: number;
  lastPayment?: Transaction;
}[]> => {
  try {
    // This would require complex logic to determine overdue payments
    // For now, return empty array - would need lease payment schedules
    return [];
  } catch (error) {
    console.error('Error getting overdue rent payments:', error);
    throw error;
  }
};

// Search transactions
export const searchTransactions = async (
  searchTerm: string,
  filters?: Partial<GetTransactionsOptions>
): Promise<Transaction[]> => {
  try {
    const result = await getTransactions({ ...filters, pageSize: 100 });
    
    const searchLower = searchTerm.toLowerCase();
    const filteredTransactions = result.transactions.filter(transaction =>
      transaction.reference.toLowerCase().includes(searchLower) ||
      transaction.description.toLowerCase().includes(searchLower) ||
      transaction.type.toLowerCase().includes(searchLower)
    );
    
    return filteredTransactions;
  } catch (error) {
    console.error('Error searching transactions:', error);
    throw error;
  }
};

// Helper function to format date for queries
const format = (date: Date, formatStr: string): string => {
  // Simple date formatting - in production use date-fns
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  if (formatStr === 'yyyy-MM') {
    return `${year}-${month}`;
  }
  
  return date.toISOString();
};