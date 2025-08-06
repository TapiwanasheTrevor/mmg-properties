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
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Unit, UnitType, UnitStatus, Currency } from '@/lib/types';
import { updatePropertyOccupancy } from './properties';

// Units collection reference
const unitsCollection = collection(db, 'units');

// Create a new unit
export const createUnit = async (
  unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(unitsCollection, {
      ...unitData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update property occupancy stats
    await updatePropertyOccupancyStats(unitData.propertyId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating unit:', error);
    throw error;
  }
};

// Get a single unit by ID
export const getUnit = async (unitId: string): Promise<Unit | null> => {
  try {
    const docRef = doc(db, 'units', unitId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Unit;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting unit:', error);
    throw error;
  }
};

// Update a unit
export const updateUnit = async (
  unitId: string,
  updates: Partial<Omit<Unit, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const unit = await getUnit(unitId);
    if (!unit) throw new Error('Unit not found');

    const docRef = doc(db, 'units', unitId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Update property occupancy stats if status changed
    if (updates.status && updates.status !== unit.status) {
      await updatePropertyOccupancyStats(unit.propertyId);
    }
  } catch (error) {
    console.error('Error updating unit:', error);
    throw error;
  }
};

// Delete a unit
export const deleteUnit = async (unitId: string): Promise<void> => {
  try {
    const unit = await getUnit(unitId);
    if (!unit) throw new Error('Unit not found');

    const docRef = doc(db, 'units', unitId);
    await deleteDoc(docRef);

    // Update property occupancy stats
    await updatePropertyOccupancyStats(unit.propertyId);
  } catch (error) {
    console.error('Error deleting unit:', error);
    throw error;
  }
};

// Get units by property
export const getUnitsByProperty = async (propertyId: string): Promise<Unit[]> => {
  try {
    const q = query(
      unitsCollection,
      where('propertyId', '==', propertyId),
      orderBy('label')
    );

    const querySnapshot = await getDocs(q);
    const units: Unit[] = [];
    
    querySnapshot.forEach((doc) => {
      units.push({ id: doc.id, ...doc.data() } as Unit);
    });
    
    return units;
  } catch (error) {
    console.error('Error getting units by property:', error);
    throw error;
  }
};

// Get units by status
export const getUnitsByStatus = async (
  propertyId: string,
  status: UnitStatus
): Promise<Unit[]> => {
  try {
    const q = query(
      unitsCollection,
      where('propertyId', '==', propertyId),
      where('status', '==', status),
      orderBy('label')
    );

    const querySnapshot = await getDocs(q);
    const units: Unit[] = [];
    
    querySnapshot.forEach((doc) => {
      units.push({ id: doc.id, ...doc.data() } as Unit);
    });
    
    return units;
  } catch (error) {
    console.error('Error getting units by status:', error);
    throw error;
  }
};

// Get vacant units
export const getVacantUnits = async (propertyId?: string): Promise<Unit[]> => {
  try {
    let q = query(unitsCollection, where('status', '==', 'vacant'));
    
    if (propertyId) {
      q = query(q, where('propertyId', '==', propertyId));
    }
    
    q = query(q, orderBy('label'));

    const querySnapshot = await getDocs(q);
    const units: Unit[] = [];
    
    querySnapshot.forEach((doc) => {
      units.push({ id: doc.id, ...doc.data() } as Unit);
    });
    
    return units;
  } catch (error) {
    console.error('Error getting vacant units:', error);
    throw error;
  }
};

// Get occupied units
export const getOccupiedUnits = async (propertyId?: string): Promise<Unit[]> => {
  try {
    let q = query(unitsCollection, where('status', '==', 'occupied'));
    
    if (propertyId) {
      q = query(q, where('propertyId', '==', propertyId));
    }
    
    q = query(q, orderBy('label'));

    const querySnapshot = await getDocs(q);
    const units: Unit[] = [];
    
    querySnapshot.forEach((doc) => {
      units.push({ id: doc.id, ...doc.data() } as Unit);
    });
    
    return units;
  } catch (error) {
    console.error('Error getting occupied units:', error);
    throw error;
  }
};

// Upload unit images
export const uploadUnitImages = async (
  unitId: string,
  files: File[]
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file) => {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `units/${unitId}/images/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading unit images:', error);
    throw error;
  }
};

// Upload unit floor plan
export const uploadUnitFloorPlan = async (
  unitId: string,
  file: File
): Promise<string> => {
  try {
    const fileName = `floorplan_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `units/${unitId}/floorplan/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading unit floor plan:', error);
    throw error;
  }
};

// Delete unit image
export const deleteUnitImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting unit image:', error);
    throw error;
  }
};

// Update unit tenant
export const updateUnitTenant = async (
  unitId: string,
  tenantId: string | null,
  leaseId: string | null
): Promise<void> => {
  try {
    const docRef = doc(db, 'units', unitId);
    const updates: any = {
      currentTenantId: tenantId,
      currentLeaseId: leaseId,
      status: tenantId ? 'occupied' : 'vacant',
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updates);

    // Update property occupancy stats
    const unit = await getUnit(unitId);
    if (unit) {
      await updatePropertyOccupancyStats(unit.propertyId);
    }
  } catch (error) {
    console.error('Error updating unit tenant:', error);
    throw error;
  }
};

// Get unit statistics for a property
export const getUnitStatistics = async (propertyId: string) => {
  try {
    const units = await getUnitsByProperty(propertyId);
    
    const stats = {
      total: units.length,
      occupied: units.filter(u => u.status === 'occupied').length,
      vacant: units.filter(u => u.status === 'vacant').length,
      maintenance: units.filter(u => u.status === 'maintenance').length,
      reserved: units.filter(u => u.status === 'reserved').length,
    };

    const occupancyRate = stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0;
    
    const totalRent = units
      .filter(u => u.status === 'occupied')
      .reduce((sum, u) => sum + u.rentAmount, 0);

    const avgRent = stats.occupied > 0 ? totalRent / stats.occupied : 0;

    return {
      ...stats,
      occupancyRate,
      totalRent,
      avgRent,
    };
  } catch (error) {
    console.error('Error getting unit statistics:', error);
    throw error;
  }
};

// Helper function to update property occupancy stats
const updatePropertyOccupancyStats = async (propertyId: string): Promise<void> => {
  try {
    const units = await getUnitsByProperty(propertyId);
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    await updatePropertyOccupancy(propertyId, units.length, occupiedUnits);
  } catch (error) {
    console.error('Error updating property occupancy stats:', error);
    throw error;
  }
};

// Search units within a property
export const searchUnitsInProperty = async (
  propertyId: string,
  searchTerm: string
): Promise<Unit[]> => {
  try {
    const units = await getUnitsByProperty(propertyId);
    
    // Client-side filtering for now - consider server-side search for production
    return units.filter(unit =>
      unit.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching units:', error);
    throw error;
  }
};

// Get units by tenant
export const getUnitsByTenant = async (tenantId: string): Promise<Unit[]> => {
  try {
    const q = query(
      unitsCollection,
      where('currentTenantId', '==', tenantId)
    );

    const querySnapshot = await getDocs(q);
    const units: Unit[] = [];
    
    querySnapshot.forEach((doc) => {
      units.push({ id: doc.id, ...doc.data() } as Unit);
    });
    
    return units;
  } catch (error) {
    console.error('Error getting units by tenant:', error);
    throw error;
  }
};