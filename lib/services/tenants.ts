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
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tenant, TenantStatus, User } from '@/lib/types';
import { updateUnitTenant } from './units';

// Tenants collection reference
const tenantsCollection = collection(db, 'tenants');

// Create a new tenant
export const createTenant = async (
  tenantData: Omit<Tenant, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(tenantsCollection, {
      ...tenantData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
};

// Get a single tenant by ID
export const getTenant = async (tenantId: string): Promise<Tenant | null> => {
  try {
    const docRef = doc(db, 'tenants', tenantId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Tenant;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting tenant:', error);
    throw error;
  }
};

// Get tenant by user ID
export const getTenantByUserId = async (userId: string): Promise<Tenant | null> => {
  try {
    const q = query(tenantsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Tenant;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting tenant by user ID:', error);
    throw error;
  }
};

// Update a tenant
export const updateTenant = async (
  tenantId: string,
  updates: Partial<Omit<Tenant, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'tenants', tenantId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating tenant:', error);
    throw error;
  }
};

// Delete a tenant
export const deleteTenant = async (tenantId: string): Promise<void> => {
  try {
    const tenant = await getTenant(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    // Remove tenant from current unit if assigned
    if (tenant.currentUnit) {
      await updateUnitTenant(tenant.currentUnit, null, null);
    }

    const docRef = doc(db, 'tenants', tenantId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting tenant:', error);
    throw error;
  }
};

// Get tenants with filtering and pagination
interface GetTenantsOptions {
  status?: TenantStatus;
  propertyId?: string;
  searchTerm?: string;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
}

export const getTenants = async (options: GetTenantsOptions = {}) => {
  try {
    let q = query(tenantsCollection);

    // Apply filters
    if (options.status) {
      q = query(q, where('status', '==', options.status));
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
    const tenants: Tenant[] = [];
    
    querySnapshot.forEach((doc) => {
      tenants.push({ id: doc.id, ...doc.data() } as Tenant);
    });

    // Client-side filtering for search and property
    let filteredTenants = tenants;

    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      filteredTenants = tenants.filter(tenant => {
        // Get user info to search by name (you'd need to fetch user data)
        return tenant.personalInfo.idNumber.toLowerCase().includes(searchLower) ||
               tenant.personalInfo.occupation.toLowerCase().includes(searchLower) ||
               tenant.personalInfo.emergencyContact.name.toLowerCase().includes(searchLower);
      });
    }

    if (options.propertyId) {
      // Filter tenants by property (you'd need to join with units/leases)
      // This would require additional queries to get current leases
    }

    return {
      tenants: filteredTenants,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === (options.pageSize || 0),
    };
  } catch (error) {
    console.error('Error getting tenants:', error);
    throw error;
  }
};

// Search tenants
export const searchTenants = async (searchTerm: string, limit: number = 10) => {
  try {
    // Get all tenants for client-side search (in production, use Algolia or similar)
    const result = await getTenants({ pageSize: 100 });
    
    const searchLower = searchTerm.toLowerCase();
    const filteredTenants = result.tenants.filter(tenant =>
      tenant.personalInfo.idNumber.toLowerCase().includes(searchLower) ||
      tenant.personalInfo.occupation.toLowerCase().includes(searchLower) ||
      tenant.personalInfo.emergencyContact.name.toLowerCase().includes(searchLower)
    );
    
    return filteredTenants.slice(0, limit);
  } catch (error) {
    console.error('Error searching tenants:', error);
    throw error;
  }
};

// Get tenants by status
export const getTenantsByStatus = async (status: TenantStatus): Promise<Tenant[]> => {
  const result = await getTenants({ status });
  return result.tenants;
};

// Get active tenants
export const getActiveTenants = async (): Promise<Tenant[]> => {
  return getTenantsByStatus('active');
};

// Get former tenants
export const getFormerTenants = async (): Promise<Tenant[]> => {
  return getTenantsByStatus('former');
};

// Assign tenant to unit
export const assignTenantToUnit = async (
  tenantId: string,
  unitId: string,
  leaseId: string
): Promise<void> => {
  try {
    // Update tenant record
    await updateTenant(tenantId, {
      currentUnit: unitId,
      status: 'active',
    });

    // Update unit record
    await updateUnitTenant(unitId, tenantId, leaseId);
  } catch (error) {
    console.error('Error assigning tenant to unit:', error);
    throw error;
  }
};

// Remove tenant from unit
export const removeTenantFromUnit = async (tenantId: string): Promise<void> => {
  try {
    const tenant = await getTenant(tenantId);
    if (!tenant || !tenant.currentUnit) {
      throw new Error('Tenant not found or not assigned to a unit');
    }

    // Update tenant record
    await updateTenant(tenantId, {
      currentUnit: undefined,
      status: 'former',
    });

    // Update unit record
    await updateUnitTenant(tenant.currentUnit, null, null);
  } catch (error) {
    console.error('Error removing tenant from unit:', error);
    throw error;
  }
};

// Get tenant statistics
export const getTenantStatistics = async () => {
  try {
    const result = await getTenants({ pageSize: 1000 });
    const tenants = result.tenants;
    
    const stats = {
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      former: tenants.filter(t => t.status === 'former').length,
      notice_period: tenants.filter(t => t.status === 'notice_period').length,
    };

    return stats;
  } catch (error) {
    console.error('Error getting tenant statistics:', error);
    throw error;
  }
};

// Get tenants with expired leases (would need lease data)
export const getTenantsWithExpiringLeases = async (daysFromNow: number = 30) => {
  try {
    // This would require joining with lease data
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error getting tenants with expiring leases:', error);
    throw error;
  }
};

// Update tenant status
export const updateTenantStatus = async (
  tenantId: string,
  status: TenantStatus
): Promise<void> => {
  try {
    await updateTenant(tenantId, { status });
  } catch (error) {
    console.error('Error updating tenant status:', error);
    throw error;
  }
};

// Get tenant payment history (would integrate with transactions)
export const getTenantPaymentHistory = async (tenantId: string) => {
  try {
    // This would query the transactions collection
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error getting tenant payment history:', error);
    throw error;
  }
};

// Get tenant maintenance requests (would integrate with requests)
export const getTenantMaintenanceRequests = async (tenantId: string) => {
  try {
    // This would query the maintenance requests collection
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Error getting tenant maintenance requests:', error);
    throw error;
  }
};

// Create tenant with user account
export const createTenantWithUser = async (
  userData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  },
  tenantData: Omit<Tenant, 'id' | 'userId' | 'createdAt'>
): Promise<{ userId: string; tenantId: string }> => {
  try {
    // This would create a user account first, then create tenant record
    // For now, just create tenant record
    const tenantId = await createTenant({
      ...tenantData,
      userId: 'temp-user-id', // Would be actual user ID
    });

    return {
      userId: 'temp-user-id',
      tenantId,
    };
  } catch (error) {
    console.error('Error creating tenant with user:', error);
    throw error;
  }
};