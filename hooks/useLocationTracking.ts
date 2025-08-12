'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
}

interface LocationUpdate {
  userId: string;
  location: LocationData;
  workStatus: 'available' | 'busy' | 'offline';
  lastSeen: Date;
}

interface PropertyVisit {
  id?: string;
  agentId: string;
  propertyId: string;
  checkInLocation: LocationData;
  checkOutLocation?: LocationData;
  checkInTime: Date;
  checkOutTime?: Date;
  visitType: 'inspection' | 'maintenance' | 'showing' | 'emergency';
  notes?: string;
  photos?: string[];
  status: 'active' | 'completed';
}

export function useLocationTracking(userId: string, enabled: boolean = true) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [activeVisit, setActiveVisit] = useState<PropertyVisit | null>(null);

  // Get current position with high accuracy
  const getCurrentPosition = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // Cache location for 30 seconds
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          };
          resolve(locationData);
        },
        (error) => {
          let errorMessage = 'Location access denied';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Check your GPS signal.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Try again.';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }, []);

  // Reverse geocoding to get address (simplified version)
  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      // In a real implementation, you'd use a geocoding service
      // For Zimbabwe, you might use local mapping services or Google Maps API
      return `${lat.toFixed(4)}, ${lng.toFixed(4)} (Harare, Zimbabwe)`;
    } catch (error) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Update agent location in Firebase
  const updateAgentLocation = async (location: LocationData, workStatus: string) => {
    try {
      const locationUpdate: LocationUpdate = {
        userId,
        location: {
          ...location,
          address: await getAddressFromCoords(location.lat, location.lng),
        },
        workStatus: workStatus as 'available' | 'busy' | 'offline',
        lastSeen: new Date(),
      };

      await updateDoc(doc(db, 'agent_locations', userId), locationUpdate);
    } catch (error) {
      console.error('Error updating agent location:', error);
    }
  };

  // Start location tracking
  const startTracking = useCallback(async (workStatus: string = 'available') => {
    if (!enabled || isTracking) return;

    try {
      const location = await getCurrentPosition();
      setCurrentLocation(location);
      setLocationError(null);
      setIsTracking(true);

      // Update location in Firebase
      await updateAgentLocation(location, workStatus);

      // Set up periodic location updates (every 2 minutes for field agents)
      const trackingInterval = setInterval(async () => {
        try {
          const newLocation = await getCurrentPosition();
          setCurrentLocation(newLocation);
          await updateAgentLocation(newLocation, workStatus);
        } catch (error) {
          setLocationError((error as Error).message);
        }
      }, 120000); // 2 minutes

      return () => {
        clearInterval(trackingInterval);
        setIsTracking(false);
      };
    } catch (error) {
      setLocationError((error as Error).message);
      setIsTracking(false);
    }
  }, [enabled, isTracking, getCurrentPosition, userId]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    // Update status to offline in Firebase
    if (currentLocation) {
      updateAgentLocation(currentLocation, 'offline');
    }
  }, [currentLocation, userId]);

  // Check in to property visit
  const checkInToProperty = async (propertyId: string, visitType: PropertyVisit['visitType']) => {
    try {
      const location = await getCurrentPosition();
      
      const visit: Omit<PropertyVisit, 'id'> = {
        agentId: userId,
        propertyId,
        checkInLocation: location,
        checkInTime: new Date(),
        visitType,
        status: 'active',
      };

      const docRef = await addDoc(collection(db, 'property_visits'), visit);
      const visitWithId = { ...visit, id: docRef.id };
      
      setActiveVisit(visitWithId);
      
      // Update work status to busy
      await updateAgentLocation(location, 'busy');
      
      return visitWithId;
    } catch (error) {
      throw new Error(`Check-in failed: ${(error as Error).message}`);
    }
  };

  // Check out from property visit
  const checkOutFromProperty = async (notes?: string, photos?: string[]) => {
    if (!activeVisit) {
      throw new Error('No active visit to check out from');
    }

    try {
      const location = await getCurrentPosition();
      
      const updatedVisit = {
        ...activeVisit,
        checkOutLocation: location,
        checkOutTime: new Date(),
        notes,
        photos,
        status: 'completed' as const,
      };

      await updateDoc(doc(db, 'property_visits', activeVisit.id!), {
        checkOutLocation: location,
        checkOutTime: new Date(),
        notes,
        photos,
        status: 'completed',
      });

      setActiveVisit(null);
      
      // Update work status back to available
      await updateAgentLocation(location, 'available');
      
      return updatedVisit;
    } catch (error) {
      throw new Error(`Check-out failed: ${(error as Error).message}`);
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Verify agent is at property location (within 100m radius)
  const verifyPropertyLocation = async (propertyLocation: {lat: number, lng: number}): Promise<boolean> => {
    try {
      const location = await getCurrentPosition();
      const distance = calculateDistance(
        location.lat, location.lng,
        propertyLocation.lat, propertyLocation.lng
      );
      
      return distance <= 0.1; // Within 100 meters
    } catch (error) {
      return false;
    }
  };

  // Listen to active visit updates
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'property_visits'),
      where('agentId', '==', userId),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const visitDoc = snapshot.docs[0];
        setActiveVisit({ id: visitDoc.id, ...visitDoc.data() } as PropertyVisit);
      } else {
        setActiveVisit(null);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // Auto-start tracking when component mounts
  useEffect(() => {
    if (enabled && userId && !isTracking) {
      startTracking();
    }

    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [enabled, userId, startTracking, stopTracking, isTracking]);

  return {
    currentLocation,
    locationError,
    isTracking,
    activeVisit,
    startTracking,
    stopTracking,
    checkInToProperty,
    checkOutFromProperty,
    getCurrentPosition,
    verifyPropertyLocation,
    calculateDistance,
  };
}

// Hook for monitoring all agent locations (for admin dashboard)
export function useAgentLocations() {
  const [agentLocations, setAgentLocations] = useState<LocationUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'agent_locations'),
      (snapshot) => {
        const locations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LocationUpdate[];
        
        setAgentLocations(locations);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { agentLocations, loading };
}