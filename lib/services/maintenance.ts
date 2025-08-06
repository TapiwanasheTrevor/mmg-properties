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
import { MaintenanceRequest, RequestStatus, RequestPriority, RequestCategory, RequestType } from '@/lib/types';

// Maintenance requests collection reference
const maintenanceCollection = collection(db, 'maintenanceRequests');

// Create a new maintenance request
export const createMaintenanceRequest = async (
  requestData: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'status' | 'comments'>
): Promise<string> => {
  try {
    const docRef = await addDoc(maintenanceCollection, {
      ...requestData,
      status: 'pending' as RequestStatus,
      comments: [],
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    throw error;
  }
};

// Get a single maintenance request by ID
export const getMaintenanceRequest = async (requestId: string): Promise<MaintenanceRequest | null> => {
  try {
    const docRef = doc(db, 'maintenanceRequests', requestId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as MaintenanceRequest;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting maintenance request:', error);
    throw error;
  }
};

// Update a maintenance request
export const updateMaintenanceRequest = async (
  requestId: string,
  updates: Partial<Omit<MaintenanceRequest, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'maintenanceRequests', requestId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    throw error;
  }
};

// Delete a maintenance request
export const deleteMaintenanceRequest = async (requestId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'maintenanceRequests', requestId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting maintenance request:', error);
    throw error;
  }
};

// Get maintenance requests with filtering and pagination
interface GetMaintenanceRequestsOptions {
  status?: RequestStatus;
  priority?: RequestPriority;
  category?: RequestCategory;
  type?: RequestType;
  propertyId?: string;
  unitId?: string;
  submittedBy?: string;
  assignedTo?: string;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
}

export const getMaintenanceRequests = async (options: GetMaintenanceRequestsOptions = {}) => {
  try {
    let q = query(maintenanceCollection);

    // Apply filters
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    if (options.priority) {
      q = query(q, where('priority', '==', options.priority));
    }
    
    if (options.category) {
      q = query(q, where('category', '==', options.category));
    }
    
    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }
    
    if (options.propertyId) {
      q = query(q, where('propertyId', '==', options.propertyId));
    }
    
    if (options.unitId) {
      q = query(q, where('unitId', '==', options.unitId));
    }
    
    if (options.submittedBy) {
      q = query(q, where('submittedBy', '==', options.submittedBy));
    }
    
    if (options.assignedTo) {
      q = query(q, where('assignedTo', '==', options.assignedTo));
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
    const requests: MaintenanceRequest[] = [];
    
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as MaintenanceRequest);
    });

    return {
      requests,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === (options.pageSize || 0),
    };
  } catch (error) {
    console.error('Error getting maintenance requests:', error);
    throw error;
  }
};

// Assign a maintenance request to an agent
export const assignMaintenanceRequest = async (
  requestId: string,
  agentId: string
): Promise<void> => {
  try {
    await updateMaintenanceRequest(requestId, {
      assignedTo: agentId,
      assignedAt: serverTimestamp() as Timestamp,
      status: 'assigned',
    });
  } catch (error) {
    console.error('Error assigning maintenance request:', error);
    throw error;
  }
};

// Update maintenance request status
export const updateMaintenanceRequestStatus = async (
  requestId: string,
  status: RequestStatus,
  additionalData?: Partial<MaintenanceRequest>
): Promise<void> => {
  try {
    const updates: Partial<MaintenanceRequest> = {
      status,
      ...additionalData,
    };

    // Add completion timestamp if marking as completed
    if (status === 'completed') {
      updates.completedAt = serverTimestamp() as Timestamp;
    }

    await updateMaintenanceRequest(requestId, updates);
  } catch (error) {
    console.error('Error updating maintenance request status:', error);
    throw error;
  }
};

// Add comment to maintenance request
export const addMaintenanceComment = async (
  requestId: string,
  userId: string,
  message: string,
  attachments?: string[]
): Promise<void> => {
  try {
    const request = await getMaintenanceRequest(requestId);
    if (!request) throw new Error('Maintenance request not found');

    const newComment = {
      userId,
      message,
      timestamp: serverTimestamp() as Timestamp,
      attachments: attachments || [],
    };

    const updatedComments = [...request.comments, newComment];

    await updateMaintenanceRequest(requestId, {
      comments: updatedComments,
    });
  } catch (error) {
    console.error('Error adding comment to maintenance request:', error);
    throw error;
  }
};

// Get requests by status
export const getRequestsByStatus = async (status: RequestStatus) => {
  const result = await getMaintenanceRequests({ status });
  return result.requests;
};

// Get pending requests
export const getPendingRequests = async (): Promise<MaintenanceRequest[]> => {
  return getRequestsByStatus('pending');
};

// Get assigned requests for an agent
export const getAssignedRequests = async (agentId: string): Promise<MaintenanceRequest[]> => {
  const result = await getMaintenanceRequests({ assignedTo: agentId });
  return result.requests;
};

// Get requests by property
export const getRequestsByProperty = async (propertyId: string): Promise<MaintenanceRequest[]> => {
  const result = await getMaintenanceRequests({ propertyId });
  return result.requests;
};

// Get requests by unit
export const getRequestsByUnit = async (unitId: string): Promise<MaintenanceRequest[]> => {
  const result = await getMaintenanceRequests({ unitId });
  return result.requests;
};

// Get requests submitted by user
export const getRequestsByUser = async (userId: string): Promise<MaintenanceRequest[]> => {
  const result = await getMaintenanceRequests({ submittedBy: userId });
  return result.requests;
};

// Get emergency requests
export const getEmergencyRequests = async (): Promise<MaintenanceRequest[]> => {
  const result = await getMaintenanceRequests({ priority: 'emergency' });
  return result.requests;
};

// Get requests by category
export const getRequestsByCategory = async (category: RequestCategory): Promise<MaintenanceRequest[]> => {
  const result = await getMaintenanceRequests({ category });
  return result.requests;
};

// Search maintenance requests
export const searchMaintenanceRequests = async (
  searchTerm: string,
  filters?: Partial<GetMaintenanceRequestsOptions>
): Promise<MaintenanceRequest[]> => {
  try {
    // Get all requests with filters
    const result = await getMaintenanceRequests({ ...filters, pageSize: 100 });
    
    // Client-side search (in production, use Algolia or similar)
    const searchLower = searchTerm.toLowerCase();
    const filteredRequests = result.requests.filter(request =>
      request.title.toLowerCase().includes(searchLower) ||
      request.description.toLowerCase().includes(searchLower) ||
      request.category.toLowerCase().includes(searchLower) ||
      request.type.toLowerCase().includes(searchLower)
    );
    
    return filteredRequests;
  } catch (error) {
    console.error('Error searching maintenance requests:', error);
    throw error;
  }
};

// Get maintenance statistics
export const getMaintenanceStatistics = async (propertyId?: string) => {
  try {
    const filters = propertyId ? { propertyId } : {};
    const allRequests = await getMaintenanceRequests({ ...filters, pageSize: 1000 });
    const requests = allRequests.requests;

    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      assigned: requests.filter(r => r.status === 'assigned').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      completed: requests.filter(r => r.status === 'completed').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length,
      emergency: requests.filter(r => r.priority === 'emergency').length,
      high_priority: requests.filter(r => r.priority === 'high').length,
      
      // By category
      categories: {
        plumbing: requests.filter(r => r.category === 'plumbing').length,
        electrical: requests.filter(r => r.category === 'electrical').length,
        structural: requests.filter(r => r.category === 'structural').length,
        appliance: requests.filter(r => r.category === 'appliance').length,
        cleaning: requests.filter(r => r.category === 'cleaning').length,
        other: requests.filter(r => r.category === 'other').length,
      },
      
      // Recent activity (last 30 days)
      recent: {
        created: requests.filter(r => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return r.createdAt.toDate() >= thirtyDaysAgo;
        }).length,
        completed: requests.filter(r => {
          if (!r.completedAt) return false;
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return r.completedAt.toDate() >= thirtyDaysAgo;
        }).length,
      },
    };

    return stats;
  } catch (error) {
    console.error('Error getting maintenance statistics:', error);
    throw error;
  }
};

// Get average response time for requests
export const getAverageResponseTime = async (agentId?: string) => {
  try {
    const filters = agentId ? { assignedTo: agentId } : {};
    const result = await getMaintenanceRequests({ ...filters, pageSize: 100 });
    const completedRequests = result.requests.filter(r => r.completedAt && r.assignedAt);

    if (completedRequests.length === 0) return 0;

    const totalTime = completedRequests.reduce((sum, request) => {
      const assignedTime = request.assignedAt!.toDate().getTime();
      const completedTime = request.completedAt!.toDate().getTime();
      return sum + (completedTime - assignedTime);
    }, 0);

    return Math.round(totalTime / completedRequests.length / (1000 * 60 * 60)); // Convert to hours
  } catch (error) {
    console.error('Error calculating average response time:', error);
    throw error;
  }
};

// Get overdue requests (assigned more than 48 hours ago for high priority, 72 hours for others)
export const getOverdueRequests = async (): Promise<MaintenanceRequest[]> => {
  try {
    const assignedRequests = await getRequestsByStatus('assigned');
    const inProgressRequests = await getRequestsByStatus('in_progress');
    const allActiveRequests = [...assignedRequests, ...inProgressRequests];

    const now = new Date();
    const overdueRequests = allActiveRequests.filter(request => {
      if (!request.assignedAt) return false;
      
      const assignedTime = request.assignedAt.toDate();
      const hoursElapsed = (now.getTime() - assignedTime.getTime()) / (1000 * 60 * 60);
      
      // Different thresholds based on priority
      const threshold = request.priority === 'emergency' ? 4 : 
                       request.priority === 'high' ? 48 : 72;
      
      return hoursElapsed > threshold;
    });

    return overdueRequests;
  } catch (error) {
    console.error('Error getting overdue requests:', error);
    throw error;
  }
};