'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Property, MaintenanceRequest, Unit, Tenant } from '@/lib/types';

// Real-time properties hook for owners and agents
export function useRealtimeProperties(ownerId?: string, agentId?: string) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerId && !agentId) {
      setLoading(false);
      return;
    }

    let q;
    if (ownerId) {
      q = query(
        collection(db, 'properties'),
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
      );
    } else if (agentId) {
      q = query(
        collection(db, 'properties'),
        where('agentId', '==', agentId),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q!,
      (snapshot) => {
        const propertiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Property[];
        
        setProperties(propertiesData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching properties:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ownerId, agentId]);

  return { properties, loading, error, refetch: () => {} };
}

// Real-time maintenance requests hook
export function useRealtimeMaintenanceRequests(filters?: {
  propertyId?: string;
  tenantId?: string;
  agentId?: string;
  status?: string;
  limit?: number;
}) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = collection(db, 'maintenance_requests');
    const constraints = [];

    if (filters?.propertyId) {
      constraints.push(where('propertyId', '==', filters.propertyId));
    }
    if (filters?.tenantId) {
      constraints.push(where('tenantId', '==', filters.tenantId));
    }
    if (filters?.agentId) {
      constraints.push(where('agentId', '==', filters.agentId));
    }
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

    const queryRef = query(q, ...constraints);

    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MaintenanceRequest[];
        
        setRequests(requestsData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching maintenance requests:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters]);

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      await updateDoc(doc(db, 'maintenance_requests', requestId), {
        status,
        notes: notes || '',
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      throw error;
    }
  };

  return { requests, loading, error, updateRequestStatus };
}

// Real-time property units hook
export function useRealtimePropertyUnits(propertyId: string) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'units'),
      where('propertyId', '==', propertyId),
      orderBy('unitNumber', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const unitsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Unit[];
        
        setUnits(unitsData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching units:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [propertyId]);

  return { units, loading, error };
}

// Real-time property dashboard data for owners
export function usePropertyDashboard(ownerId: string) {
  const [dashboardData, setDashboardData] = useState({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    pendingMaintenance: 0,
    monthlyIncome: 0,
    recentActivity: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownerId) {
      setLoading(false);
      return;
    }

    const unsubscribers: (() => void)[] = [];

    // Listen to properties
    const propertiesQuery = query(
      collection(db, 'properties'),
      where('ownerId', '==', ownerId)
    );

    unsubscribers.push(
      onSnapshot(propertiesQuery, async (propertiesSnapshot) => {
        const properties = propertiesSnapshot.docs;
        const propertyIds = properties.map(doc => doc.id);

        if (propertyIds.length === 0) {
          setDashboardData(prev => ({ ...prev, totalProperties: 0 }));
          setLoading(false);
          return;
        }

        // Get units for all properties
        const unitsQuery = query(
          collection(db, 'units'),
          where('propertyId', 'in', propertyIds)
        );

        const unitsSnapshot = await getDocs(unitsQuery);
        const units = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const occupiedUnits = units.filter(unit => unit.status === 'occupied').length;
        const vacantUnits = units.filter(unit => unit.status === 'vacant').length;

        // Get maintenance requests
        const maintenanceQuery = query(
          collection(db, 'maintenance_requests'),
          where('propertyId', 'in', propertyIds),
          where('status', 'in', ['submitted', 'in_progress'])
        );

        const maintenanceSnapshot = await getDocs(maintenanceQuery);
        const pendingMaintenance = maintenanceSnapshot.size;

        setDashboardData(prev => ({
          ...prev,
          totalProperties: properties.length,
          totalUnits: units.length,
          occupiedUnits,
          vacantUnits,
          pendingMaintenance,
        }));

        setLoading(false);
        setError(null);
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [ownerId]);

  return { dashboardData, loading, error };
}

// Real-time tenant dashboard data
export function useTenantDashboard(tenantId: string) {
  const [tenantData, setTenantData] = useState({
    currentLease: null as any,
    maintenanceRequests: [] as MaintenanceRequest[],
    upcomingPayments: [] as any[],
    propertyInfo: null as Property | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    const unsubscribers: (() => void)[] = [];

    // Listen to current lease
    const leaseQuery = query(
      collection(db, 'leases'),
      where('tenantId', '==', tenantId),
      where('status', '==', 'active'),
      limit(1)
    );

    unsubscribers.push(
      onSnapshot(leaseQuery, async (leaseSnapshot) => {
        if (!leaseSnapshot.empty) {
          const lease = { id: leaseSnapshot.docs[0].id, ...leaseSnapshot.docs[0].data() };
          setTenantData(prev => ({ ...prev, currentLease: lease }));

          // Get property info
          const propertyDoc = await getDocs(
            query(collection(db, 'properties'), where('id', '==', lease.propertyId))
          );
          if (!propertyDoc.empty) {
            setTenantData(prev => ({
              ...prev,
              propertyInfo: { id: propertyDoc.docs[0].id, ...propertyDoc.docs[0].data() } as Property
            }));
          }
        }
      })
    );

    // Listen to maintenance requests
    const maintenanceQuery = query(
      collection(db, 'maintenance_requests'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    unsubscribers.push(
      onSnapshot(maintenanceQuery, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MaintenanceRequest[];
        
        setTenantData(prev => ({ ...prev, maintenanceRequests: requests }));
        setLoading(false);
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [tenantId]);

  return { tenantData, loading, error };
}

// Agent dashboard with assigned tasks and properties
export function useAgentDashboard(agentId: string) {
  const [agentData, setAgentData] = useState({
    assignedProperties: [] as Property[],
    pendingInspections: [] as any[],
    maintenanceAssignments: [] as MaintenanceRequest[],
    todayTasks: [] as any[],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    const unsubscribers: (() => void)[] = [];

    // Listen to assigned properties
    const propertiesQuery = query(
      collection(db, 'properties'),
      where('agentId', '==', agentId)
    );

    unsubscribers.push(
      onSnapshot(propertiesQuery, (snapshot) => {
        const properties = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Property[];
        
        setAgentData(prev => ({ ...prev, assignedProperties: properties }));
      })
    );

    // Listen to maintenance assignments
    const maintenanceQuery = query(
      collection(db, 'maintenance_requests'),
      where('agentId', '==', agentId),
      where('status', 'in', ['assigned', 'in_progress']),
      orderBy('priority', 'desc')
    );

    unsubscribers.push(
      onSnapshot(maintenanceQuery, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MaintenanceRequest[];
        
        setAgentData(prev => ({ ...prev, maintenanceAssignments: requests }));
        setLoading(false);
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [agentId]);

  return { agentData, loading, error };
}