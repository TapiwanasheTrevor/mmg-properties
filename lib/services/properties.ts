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
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Property, PropertyType, PropertyStatus } from '@/lib/types';

// Properties collection reference
const propertiesCollection = collection(db, 'properties');

// Create a new property
export const createProperty = async (
  propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(propertiesCollection, {
      ...propertyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

// Get a single property by ID
export const getProperty = async (propertyId: string): Promise<Property | null> => {
  try {
    const docRef = doc(db, 'properties', propertyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Property;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting property:', error);
    throw error;
  }
};

// Update a property
export const updateProperty = async (
  propertyId: string,
  updates: Partial<Omit<Property, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'properties', propertyId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

// Delete a property
export const deleteProperty = async (propertyId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'properties', propertyId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

// Get properties with filtering and pagination
interface GetPropertiesOptions {
  ownerId?: string;
  assignedAgentId?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  searchTerm?: string;
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
}

export const getProperties = async (options: GetPropertiesOptions = {}) => {
  try {
    let q = query(propertiesCollection);

    // Apply filters
    if (options.ownerId) {
      q = query(q, where('ownerId', '==', options.ownerId));
    }

    if (options.assignedAgentId) {
      q = query(q, where('assignedAgents', 'array-contains', options.assignedAgentId));
    }

    if (options.type) {
      q = query(q, where('type', '==', options.type));
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

    if (options.lastDoc) {
      q = query(q, startAfter(options.lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const properties: Property[] = [];
    
    querySnapshot.forEach((doc) => {
      properties.push({ id: doc.id, ...doc.data() } as Property);
    });

    return {
      properties,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === (options.pageSize || 0),
    };
  } catch (error) {
    console.error('Error getting properties:', error);
    throw error;
  }
};

// Search properties by name or address
export const searchProperties = async (searchTerm: string, limit: number = 10) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - consider using Algolia or similar for production
    const q = query(
      propertiesCollection,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      orderBy('name'),
      limit(limit)
    );

    const querySnapshot = await getDocs(q);
    const properties: Property[] = [];
    
    querySnapshot.forEach((doc) => {
      properties.push({ id: doc.id, ...doc.data() } as Property);
    });
    
    return properties;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

// Upload property images
export const uploadPropertyImages = async (
  propertyId: string,
  files: File[]
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file) => {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `properties/${propertyId}/images/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading property images:', error);
    throw error;
  }
};

// Delete property image
export const deletePropertyImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting property image:', error);
    throw error;
  }
};

// Assign agents to property
export const assignAgentsToProperty = async (
  propertyId: string,
  agentIds: string[]
): Promise<void> => {
  try {
    const docRef = doc(db, 'properties', propertyId);
    await updateDoc(docRef, {
      assignedAgents: agentIds,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error assigning agents to property:', error);
    throw error;
  }
};

// Get properties by owner
export const getPropertiesByOwner = async (ownerId: string): Promise<Property[]> => {
  const result = await getProperties({ ownerId });
  return result.properties;
};

// Get properties by agent
export const getPropertiesByAgent = async (agentId: string): Promise<Property[]> => {
  const result = await getProperties({ assignedAgentId: agentId });
  return result.properties;
};

// Update property occupancy statistics
export const updatePropertyOccupancy = async (
  propertyId: string,
  totalUnits: number,
  occupiedUnits: number
): Promise<void> => {
  try {
    const docRef = doc(db, 'properties', propertyId);
    await updateDoc(docRef, {
      totalUnits,
      occupiedUnits,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating property occupancy:', error);
    throw error;
  }
};

// Get property statistics
export const getPropertyStats = async (propertyId: string) => {
  try {
    const property = await getProperty(propertyId);
    if (!property) return null;

    // Get units for this property
    const unitsQuery = query(
      collection(db, 'units'),
      where('propertyId', '==', propertyId)
    );
    const unitsSnapshot = await getDocs(unitsQuery);
    
    const units = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const occupiedUnits = units.filter(unit => unit.status === 'occupied').length;
    const vacantUnits = units.filter(unit => unit.status === 'vacant').length;
    const maintenanceUnits = units.filter(unit => unit.status === 'maintenance').length;
    
    const totalRent = units.reduce((sum, unit) => {
      return unit.status === 'occupied' ? sum + (unit.rentAmount || 0) : sum;
    }, 0);

    return {
      totalUnits: units.length,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      occupancyRate: units.length > 0 ? (occupiedUnits / units.length) * 100 : 0,
      monthlyIncome: totalRent,
    };
  } catch (error) {
    console.error('Error getting property stats:', error);
    throw error;
  }
};