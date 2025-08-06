// Firebase Authentication implementation for MMG Platform
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
  ConfirmationResult,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import { User as AppUser, UserRole } from './types';

// Error handling utility
const handleAuthError = (error: any): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};

// Check if Firebase is configured properly
const checkFirebaseConfig = () => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not properly configured. Please set up your Firebase project.');
  }
};

// Email/Password Authentication
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  checkFirebaseConfig();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await updateLastLogin(userCredential.user.uid);
    return userCredential;
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'tenant'
): Promise<UserCredential> => {
  checkFirebaseConfig();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await createUserDocument(userCredential.user, role);
    
    return userCredential;
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

// Google Authentication
export const signInWithGoogle = async (): Promise<UserCredential> => {
  checkFirebaseConfig();
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const result = await signInWithPopup(auth, provider);
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await createUserDocument(result.user, 'tenant');
    } else {
      await updateLastLogin(result.user.uid);
    }
    
    return result;
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

// Phone Authentication
export const setupPhoneAuth = (containerId: string): RecaptchaVerifier => {
  checkFirebaseConfig();
  if (typeof window === 'undefined') {
    throw new Error('Phone authentication can only be set up in the browser');
  }
  
  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'normal',
    callback: () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber
    },
    'expired-callback': () => {
      // Response expired, ask user to solve reCAPTCHA again
    }
  });
  
  return recaptchaVerifier;
};

export const sendOTP = async (
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  checkFirebaseConfig();
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

export const verifyOTP = async (
  confirmationResult: ConfirmationResult,
  code: string
): Promise<UserCredential> => {
  try {
    const result = await confirmationResult.confirm(code);
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await createUserDocument(result.user, 'tenant');
    } else {
      await updateLastLogin(result.user.uid);
    }
    
    return result;
  } catch (error) {
    throw new Error('Invalid verification code. Please try again.');
  }
};

// Password Reset
export const resetPassword = async (email: string): Promise<void> => {
  checkFirebaseConfig();
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(handleAuthError(error));
  }
};

// Sign Out
export const signOutUser = async (): Promise<void> => {
  checkFirebaseConfig();
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error('Failed to sign out. Please try again.');
  }
};

// Auth State Observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  checkFirebaseConfig();
  return onAuthStateChanged(auth, callback);
};

// User Document Management
const createUserDocument = async (user: User, role: UserRole): Promise<void> => {
  const userData: Partial<AppUser> = {
    id: user.uid,
    email: user.email!,
    role,
    profile: {
      firstName: user.displayName?.split(' ')[0] || '',
      lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
      avatar: user.photoURL || undefined,
    },
    phone: user.phoneNumber || undefined,
    permissions: getDefaultPermissions(role),
    isActive: true,
    mfaEnabled: false,
    mfaSetupRequired: false,
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
  };
  
  await setDoc(doc(db, 'users', user.uid), userData);
};

const updateLastLogin = async (userId: string): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), {
    lastLogin: serverTimestamp(),
  });
};

// Get default permissions based on role
const getDefaultPermissions = (role: UserRole): string[] => {
  switch (role) {
    case 'admin':
      return [
        'users:read', 'users:write', 'users:delete',
        'properties:read', 'properties:write', 'properties:delete',
        'leases:read', 'leases:write', 'leases:delete',
        'maintenance:read', 'maintenance:write', 'maintenance:delete',
        'payments:read', 'payments:write', 'payments:delete',
        'reports:read', 'reports:write',
        'settings:read', 'settings:write'
      ];
    case 'owner':
      return [
        'properties:read', 'properties:write',
        'leases:read', 'leases:write',
        'maintenance:read', 'maintenance:write',
        'payments:read',
        'reports:read'
      ];
    case 'agent':
      return [
        'properties:read',
        'leases:read', 'leases:write',
        'maintenance:read', 'maintenance:write',
        'payments:read'
      ];
    case 'tenant':
      return [
        'properties:read',
        'leases:read',
        'maintenance:read', 'maintenance:write',
        'payments:read'
      ];
    default:
      return [];
  }
};

// Get current user data from Firestore
export const getCurrentUserData = async (): Promise<AppUser | null> => {
  checkFirebaseConfig();
  const user = auth.currentUser;
  if (!user) return null;
  
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) return null;
  
  return userDoc.data() as AppUser;
};

// Update user profile
export const updateUserProfile = async (userId: string, data: Partial<AppUser>): Promise<void> => {
  checkFirebaseConfig();
  await updateDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Permission and role checking functions
export const getUserRole = async (userId?: string): Promise<UserRole | null> => {
  checkFirebaseConfig();
  const user = userId ? await getCurrentUserData() : auth.currentUser ? await getCurrentUserData() : null;
  return user?.role || null;
};

export const hasPermission = async (permission: string, userId?: string): Promise<boolean> => {
  checkFirebaseConfig();
  const user = userId ? await getCurrentUserData() : await getCurrentUserData();
  if (!user) return false;
  return user.permissions.includes(permission);
};

export const hasAllPermissions = async (permissions: string[], userId?: string): Promise<boolean> => {
  checkFirebaseConfig();
  const user = userId ? await getCurrentUserData() : await getCurrentUserData();
  if (!user) return false;
  return permissions.every(permission => user.permissions.includes(permission));
};

export const hasAnyRole = async (roles: UserRole[], userId?: string): Promise<boolean> => {
  checkFirebaseConfig();
  const user = userId ? await getCurrentUserData() : await getCurrentUserData();
  if (!user) return false;
  return roles.includes(user.role);
};

// Alias for signOutUser to match expected import
export const logout = signOutUser;