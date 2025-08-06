// Firestore database service functions for MMG Platform
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
  Timestamp,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  Property,
  Unit,
  Lease,
  MaintenanceRequest,
  Transaction,
  Notification,
  User,
  Tenant,
  Agent,
  Owner,
  Inspection,
} from './types';

// Generic CRUD operations
export class FirestoreService<T> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  private checkConfig() {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not properly configured');
    }
  }

  // Create
  async create(data: Omit<T, 'id'> & { createdAt?: any; updatedAt?: any }): Promise<string> {
    this.checkConfig();
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, this.collectionName), docData);
    return docRef.id;
  }

  // Create with specific ID
  async createWithId(id: string, data: Omit<T, 'id'> & { createdAt?: any; updatedAt?: any }): Promise<void> {
    this.checkConfig();
    const docData = {
      ...data,
      id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, this.collectionName, id), docData);
  }

  // Read
  async getById(id: string): Promise<T | null> {
    this.checkConfig();
    const docSnap = await getDoc(doc(db, this.collectionName, id));
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  // Update
  async update(id: string, data: Partial<T>): Promise<void> {
    this.checkConfig();
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(doc(db, this.collectionName, id), updateData);
  }

  // Delete
  async delete(id: string): Promise<void> {
    this.checkConfig();
    await deleteDoc(doc(db, this.collectionName, id));
  }

  // Get all with optional constraints
  async getAll(constraints?: QueryConstraint[]): Promise<T[]> {
    this.checkConfig();
    const collectionRef = collection(db, this.collectionName);
    const q = constraints ? query(collectionRef, ...constraints) : collectionRef;
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as T));
  }

  // Paginated query
  async getPaginated(
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot,
    constraints?: QueryConstraint[]
  ): Promise<{ data: T[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
    this.checkConfig();
    const collectionRef = collection(db, this.collectionName);
    
    const queryConstraints = constraints || [];
    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }
    queryConstraints.push(limit(pageSize + 1)); // Get one extra to check if there are more
    
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageSize;
    
    if (hasMore) {
      docs.pop(); // Remove the extra document
    }
    
    return {
      data: docs.map(doc => ({ id: doc.id, ...doc.data() } as T)),
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
      hasMore,
    };
  }

  // Search by field
  async findBy(field: string, value: any): Promise<T[]> {
    this.checkConfig();
    const q = query(
      collection(db, this.collectionName),
      where(field, '==', value)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as T));
  }
}

// Service instances for each collection
export const userService = new FirestoreService<User>('users');
export const propertyService = new FirestoreService<Property>('properties');
export const unitService = new FirestoreService<Unit>('units');
export const leaseService = new FirestoreService<Lease>('leases');
export const maintenanceService = new FirestoreService<MaintenanceRequest>('maintenance_requests');
export const transactionService = new FirestoreService<Transaction>('transactions');
export const notificationService = new FirestoreService<Notification>('notifications');
export const tenantService = new FirestoreService<Tenant>('tenants');
export const agentService = new FirestoreService<Agent>('agents');
export const ownerService = new FirestoreService<Owner>('owners');
export const inspectionService = new FirestoreService<Inspection>('inspections');

// Specialized query functions
export const propertyQueries = {
  getByOwner: (ownerId: string) => 
    propertyService.findBy('ownerId', ownerId),
  
  getByAgent: (agentId: string) => 
    propertyService.findBy('agentId', agentId),
  
  getByStatus: (status: string) => 
    propertyService.findBy('status', status),
  
  getActiveProperties: () => 
    propertyService.getAll([where('status', '==', 'active')]),
};

export const unitQueries = {
  getByProperty: (propertyId: string) => 
    unitService.findBy('propertyId', propertyId),
  
  getVacantUnits: () => 
    unitService.getAll([where('status', '==', 'vacant')]),
  
  getOccupiedUnits: () => 
    unitService.getAll([where('status', '==', 'occupied')]),
  
  getByTenant: (tenantId: string) => 
    unitService.findBy('currentTenantId', tenantId),
};

export const leaseQueries = {
  getByTenant: (tenantId: string) => 
    leaseService.findBy('tenantId', tenantId),
  
  getByProperty: (propertyId: string) => 
    leaseService.findBy('propertyId', propertyId),
  
  getByOwner: (ownerId: string) => 
    leaseService.findBy('ownerId', ownerId),
  
  getActiveLeases: () => 
    leaseService.getAll([where('status', '==', 'active')]),
  
  getExpiringLeases: (days: number = 30) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return leaseService.getAll([
      where('status', '==', 'active'),
      where('endDate', '<=', Timestamp.fromDate(futureDate))
    ]);
  },
};

export const maintenanceQueries = {
  getByTenant: (tenantId: string) => 
    maintenanceService.findBy('tenantId', tenantId),
  
  getByProperty: (propertyId: string) => 
    maintenanceService.findBy('propertyId', propertyId),
  
  getByAgent: (agentId: string) => 
    maintenanceService.findBy('agentId', agentId),
  
  getByStatus: (status: string) => 
    maintenanceService.findBy('status', status),
  
  getPendingRequests: () => 
    maintenanceService.getAll([
      where('status', 'in', ['submitted', 'assigned'])
    ]),
  
  getUrgentRequests: () => 
    maintenanceService.getAll([
      where('priority', 'in', ['high', 'emergency'])
    ]),
};

export const notificationQueries = {
  getByUser: (userId: string) => 
    notificationService.getAll([
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ]),
  
  getUnreadByUser: (userId: string) => 
    notificationService.getAll([
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    ]),
  
  markAsRead: async (notificationId: string) => {
    await notificationService.update(notificationId, {
      read: true,
      readAt: serverTimestamp(),
    });
  },
};

export const transactionQueries = {
  getByProperty: (propertyId: string) => 
    transactionService.findBy('propertyId', propertyId),
  
  getByTenant: (tenantId: string) => 
    transactionService.findBy('tenantId', tenantId),
  
  getByType: (type: string) => 
    transactionService.findBy('type', type),
  
  getByStatus: (status: string) => 
    transactionService.findBy('status', status),
  
  getMonthlyRevenue: async (year: number, month: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return transactionService.getAll([
      where('type', '==', 'rent'),
      where('status', '==', 'completed'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate))
    ]);
  },
};

// Batch operations
export const batchOperations = {
  async createMultiple<T>(collectionName: string, documents: (Omit<T, 'id'> & { id?: string })[]): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not properly configured');
    }
    
    const batch = writeBatch(db);
    
    documents.forEach(docData => {
      const docRef = docData.id 
        ? doc(db, collectionName, docData.id)
        : doc(collection(db, collectionName));
      
      const data = {
        ...docData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      batch.set(docRef, data);
    });
    
    await batch.commit();
  },

  async updateMultiple(collectionName: string, updates: { id: string; data: any }[]): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not properly configured');
    }
    
    const batch = writeBatch(db);
    
    updates.forEach(({ id, data }) => {
      const docRef = doc(db, collectionName, id);
      batch.update(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
  },

  async deleteMultiple(collectionName: string, ids: string[]): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not properly configured');
    }
    
    const batch = writeBatch(db);
    
    ids.forEach(id => {
      const docRef = doc(db, collectionName, id);
      batch.delete(docRef);
    });
    
    await batch.commit();
  },
};

// Transaction operations for complex operations
export const transactionOperations = {
  async transferUnit(unitId: string, fromTenantId: string, toTenantId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not properly configured');
    }
    
    await runTransaction(db, async (transaction) => {
      const unitRef = doc(db, 'units', unitId);
      const unitSnap = await transaction.get(unitRef);
      
      if (!unitSnap.exists()) {
        throw new Error('Unit does not exist');
      }
      
      const unitData = unitSnap.data();
      if (unitData.currentTenantId !== fromTenantId) {
        throw new Error('Unit is not currently assigned to the specified tenant');
      }
      
      // Update unit
      transaction.update(unitRef, {
        currentTenantId: toTenantId,
        updatedAt: serverTimestamp(),
      });
      
      // You could add more operations here like updating lease records, etc.
    });
  },
};

export default {
  userService,
  propertyService,
  unitService,
  leaseService,
  maintenanceService,
  transactionService,
  notificationService,
  tenantService,
  agentService,
  ownerService,
  inspectionService,
  propertyQueries,
  unitQueries,
  leaseQueries,
  maintenanceQueries,
  notificationQueries,
  transactionQueries,
  batchOperations,
  transactionOperations,
};