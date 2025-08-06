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
import { Lease, LeaseStatus, PaymentFrequency, Currency } from '@/lib/types';
import { assignTenantToUnit, removeTenantFromUnit } from './tenants';

// Leases collection reference
const leasesCollection = collection(db, 'leases');

// Create a new lease
export const createLease = async (
  leaseData: Omit<Lease, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(leasesCollection, {
      ...leaseData,
      createdAt: serverTimestamp(),
    });

    // If lease is active, assign tenant to unit
    if (leaseData.status === 'active') {
      await assignTenantToUnit(leaseData.tenantId, leaseData.unitId, docRef.id);
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating lease:', error);
    throw error;
  }
};

// Get a single lease by ID
export const getLease = async (leaseId: string): Promise<Lease | null> => {
  try {
    const docRef = doc(db, 'leases', leaseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Lease;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting lease:', error);
    throw error;
  }
};

// Update a lease
export const updateLease = async (
  leaseId: string,
  updates: Partial<Omit<Lease, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const lease = await getLease(leaseId);
    if (!lease) throw new Error('Lease not found');

    const docRef = doc(db, 'leases', leaseId);
    await updateDoc(docRef, updates);

    // Handle status changes
    if (updates.status && updates.status !== lease.status) {
      await handleLeaseStatusChange(lease, updates.status);
    }
  } catch (error) {
    console.error('Error updating lease:', error);
    throw error;
  }
};

// Handle lease status changes
const handleLeaseStatusChange = async (lease: Lease, newStatus: LeaseStatus) => {
  try {
    switch (newStatus) {
      case 'active':
        // Assign tenant to unit
        await assignTenantToUnit(lease.tenantId, lease.unitId, lease.id);
        break;
      case 'terminated':
      case 'expired':
        // Remove tenant from unit
        await removeTenantFromUnit(lease.tenantId);
        break;
    }
  } catch (error) {
    console.error('Error handling lease status change:', error);
    throw error;
  }
};

// Delete a lease
export const deleteLease = async (leaseId: string): Promise<void> => {
  try {
    const lease = await getLease(leaseId);
    if (!lease) throw new Error('Lease not found');

    // Remove tenant from unit if lease is active
    if (lease.status === 'active') {
      await removeTenantFromUnit(lease.tenantId);
    }

    const docRef = doc(db, 'leases', leaseId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting lease:', error);
    throw error;
  }
};

// Get leases with filtering
interface GetLeasesOptions {
  tenantId?: string;
  unitId?: string;
  propertyId?: string;
  status?: LeaseStatus;
  pageSize?: number;
}

export const getLeases = async (options: GetLeasesOptions = {}) => {
  try {
    let q = query(leasesCollection);

    // Apply filters
    if (options.tenantId) {
      q = query(q, where('tenantId', '==', options.tenantId));
    }

    if (options.unitId) {
      q = query(q, where('unitId', '==', options.unitId));
    }

    if (options.propertyId) {
      q = query(q, where('propertyId', '==', options.propertyId));
    }

    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }

    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'));

    // Add pagination
    if (options.pageSize) {
      q = query(q, limit(options.pageSize));
    }

    const querySnapshot = await getDocs(q);
    const leases: Lease[] = [];
    
    querySnapshot.forEach((doc) => {
      leases.push({ id: doc.id, ...doc.data() } as Lease);
    });

    return {
      leases,
      hasMore: querySnapshot.docs.length === (options.pageSize || 0),
    };
  } catch (error) {
    console.error('Error getting leases:', error);
    throw error;
  }
};

// Get active leases
export const getActiveLeases = async (): Promise<Lease[]> => {
  const result = await getLeases({ status: 'active' });
  return result.leases;
};

// Get leases by tenant
export const getLeasesByTenant = async (tenantId: string): Promise<Lease[]> => {
  const result = await getLeases({ tenantId });
  return result.leases;
};

// Get leases by unit
export const getLeasesByUnit = async (unitId: string): Promise<Lease[]> => {
  const result = await getLeases({ unitId });
  return result.leases;
};

// Get leases by property
export const getLeasesByProperty = async (propertyId: string): Promise<Lease[]> => {
  const result = await getLeases({ propertyId });
  return result.leases;
};

// Get current lease for unit
export const getCurrentLeaseForUnit = async (unitId: string): Promise<Lease | null> => {
  const result = await getLeases({ unitId, status: 'active' });
  return result.leases[0] || null;
};

// Get current lease for tenant
export const getCurrentLeaseForTenant = async (tenantId: string): Promise<Lease | null> => {
  const result = await getLeases({ tenantId, status: 'active' });
  return result.leases[0] || null;
};

// Get expiring leases
export const getExpiringLeases = async (daysFromNow: number = 30): Promise<Lease[]> => {
  try {
    const activeLeases = await getActiveLeases();
    const now = new Date();
    const futureDate = new Date(now.getTime() + (daysFromNow * 24 * 60 * 60 * 1000));

    return activeLeases.filter(lease => {
      const endDate = lease.dates.endDate.toDate();
      return endDate <= futureDate && endDate >= now;
    });
  } catch (error) {
    console.error('Error getting expiring leases:', error);
    throw error;
  }
};

// Get expired leases
export const getExpiredLeases = async (): Promise<Lease[]> => {
  try {
    const activeLeases = await getActiveLeases();
    const now = new Date();

    return activeLeases.filter(lease => {
      const endDate = lease.dates.endDate.toDate();
      return endDate < now;
    });
  } catch (error) {
    console.error('Error getting expired leases:', error);
    throw error;
  }
};

// Update lease status
export const updateLeaseStatus = async (
  leaseId: string,
  status: LeaseStatus
): Promise<void> => {
  try {
    await updateLease(leaseId, { status });
  } catch (error) {
    console.error('Error updating lease status:', error);
    throw error;
  }
};

// Renew lease
export const renewLease = async (
  oldLeaseId: string,
  renewalData: {
    newEndDate: Timestamp;
    rentAmount?: number;
    depositAmount?: number;
  }
): Promise<string> => {
  try {
    const oldLease = await getLease(oldLeaseId);
    if (!oldLease) throw new Error('Original lease not found');

    // Update old lease status
    await updateLeaseStatus(oldLeaseId, 'expired');

    // Create new lease
    const newLeaseData: Omit<Lease, 'id' | 'createdAt'> = {
      ...oldLease,
      dates: {
        ...oldLease.dates,
        startDate: serverTimestamp() as Timestamp,
        endDate: renewalData.newEndDate,
        noticeDate: undefined,
        terminationDate: undefined,
      },
      terms: {
        ...oldLease.terms,
        rentAmount: renewalData.rentAmount || oldLease.terms.rentAmount,
        depositAmount: renewalData.depositAmount || oldLease.terms.depositAmount,
      },
      status: 'active',
      renewalHistory: [...(oldLease.renewalHistory || []), oldLeaseId],
      documents: {
        leaseAgreement: '', // New agreement would be uploaded
        signedBy: {
          tenant: { signed: false },
          owner: { signed: false },
        },
      },
    };

    return await createLease(newLeaseData);
  } catch (error) {
    console.error('Error renewing lease:', error);
    throw error;
  }
};

// Terminate lease
export const terminateLease = async (
  leaseId: string,
  terminationDate?: Timestamp,
  reason?: string
): Promise<void> => {
  try {
    const updates: Partial<Lease> = {
      status: 'terminated',
      dates: {
        ...(await getLease(leaseId))!.dates,
        terminationDate: terminationDate || (serverTimestamp() as Timestamp),
      },
    };

    await updateLease(leaseId, updates);
  } catch (error) {
    console.error('Error terminating lease:', error);
    throw error;
  }
};

// Give notice for lease
export const giveLeaseNotice = async (
  leaseId: string,
  noticeDate?: Timestamp
): Promise<void> => {
  try {
    const updates: Partial<Lease> = {
      status: 'notice_given',
      dates: {
        ...(await getLease(leaseId))!.dates,
        noticeDate: noticeDate || (serverTimestamp() as Timestamp),
      },
    };

    await updateLease(leaseId, updates);
  } catch (error) {
    console.error('Error giving lease notice:', error);
    throw error;
  }
};

// Calculate lease payments
export const calculateLeasePayments = (lease: Lease) => {
  const { rentAmount, paymentFrequency, leasePeriod } = lease.terms;
  
  let paymentsPerYear: number;
  switch (paymentFrequency) {
    case 'monthly':
      paymentsPerYear = 12;
      break;
    case 'quarterly':
      paymentsPerYear = 4;
      break;
    case 'annually':
      paymentsPerYear = 1;
      break;
    default:
      paymentsPerYear = 12;
  }

  const totalPayments = Math.ceil((leasePeriod / 12) * paymentsPerYear);
  const totalAmount = rentAmount * totalPayments;

  return {
    paymentAmount: rentAmount,
    totalPayments,
    totalAmount,
    paymentsPerYear,
  };
};

// Get lease statistics
export const getLeaseStatistics = async () => {
  try {
    const allLeases = await getLeases({ pageSize: 1000 });
    const leases = allLeases.leases;

    const stats = {
      total: leases.length,
      active: leases.filter(l => l.status === 'active').length,
      expired: leases.filter(l => l.status === 'expired').length,
      draft: leases.filter(l => l.status === 'draft').length,
      terminated: leases.filter(l => l.status === 'terminated').length,
      notice_given: leases.filter(l => l.status === 'notice_given').length,
    };

    // Calculate expiring in 30 days
    const expiringLeases = await getExpiringLeases(30);
    stats['expiring_soon'] = expiringLeases.length;

    return stats;
  } catch (error) {
    console.error('Error getting lease statistics:', error);
    throw error;
  }
};

// Sign lease document
export const signLeaseDocument = async (
  leaseId: string,
  signedBy: 'tenant' | 'owner'
): Promise<void> => {
  try {
    const lease = await getLease(leaseId);
    if (!lease) throw new Error('Lease not found');

    const updates: Partial<Lease> = {
      documents: {
        ...lease.documents,
        signedBy: {
          ...lease.documents.signedBy,
          [signedBy]: {
            signed: true,
            signedAt: serverTimestamp() as Timestamp,
          },
        },
      },
    };

    await updateLease(leaseId, updates);
  } catch (error) {
    console.error('Error signing lease document:', error);
    throw error;
  }
};