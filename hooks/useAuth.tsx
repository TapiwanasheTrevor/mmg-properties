// Firebase Authentication hook for MMG Platform
'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChange, signOutUser, getCurrentUserData } from '@/lib/auth';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { User as AppUser } from '@/lib/types';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh user data from Firestore
  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const userData = await getCurrentUserData();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // Use mock data for development
      setLoading(false);
      return;
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Set up real-time listener for user document
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribeUser = onSnapshot(
          userDocRef,
          (doc) => {
            if (doc.exists()) {
              const userData = doc.data() as AppUser;
              setUser({
                ...userData,
                id: firebaseUser.uid, // Ensure ID matches Firebase user ID
              });
            } else {
              // User document doesn't exist, might be a new user
              setUser(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error listening to user document:', error);
            setUser(null);
            setLoading(false);
          }
        );

        // Return cleanup function for user document listener
        return () => unsubscribeUser();
      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    // Return cleanup function for auth state listener
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hooks for common auth checks
export function useRequireAuth(): AuthContextType {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      // Redirect to login or show auth required message
      window.location.href = '/login';
    }
  }, [auth.loading, auth.user]);

  return auth;
}

export function useRequireRole(requiredRoles: string[]): AuthContextType {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.loading && auth.user) {
      if (!requiredRoles.includes(auth.user.role)) {
        // Redirect to unauthorized page
        window.location.href = '/unauthorized';
      }
    }
  }, [auth.loading, auth.user, requiredRoles]);

  return auth;
}

// Development-only mock auth hook (when Firebase is not configured)
export function useMockAuth(): AuthContextType {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return {
    user: null,
    firebaseUser: null,
    loading,
    signOut: async () => {},
    refreshUser: async () => {},
  };
}