// Firebase configuration for MMG Platform
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration object - PRODUCTION
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase (avoid duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to Firebase emulators in development (only if USE_EMULATOR is true)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  let emulatorsConnected = false;
  
  try {
    // Connect Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    
    // Connect Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8081);
    
    // Connect Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    
    // Connect Functions emulator (optional)
    connectFunctionsEmulator(functions, 'localhost', 5001);
    
    emulatorsConnected = true;
    console.log('🔥 Connected to Firebase emulators');
  } catch (error) {
    console.log('⚠️ Emulator connection failed, using live Firebase:', error);
    emulatorsConnected = false;
  }
  
  if (!emulatorsConnected) {
    console.log('🔥 Falling back to live Firebase services');
  }
} else if (process.env.NODE_ENV === 'development') {
  console.log('🔥 Using live Firebase services (emulators disabled)');
}

// Export the app instance
export default app;

// Utility function to check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.authDomain &&
    firebaseConfig.apiKey.startsWith('AIza') &&
    firebaseConfig.projectId === 'mmg-platform'
  );
};

// Console log for production Firebase
if (isFirebaseConfigured()) {
  console.log('🔥 Firebase production configuration loaded successfully');
} else {
  console.error('❌ Firebase configuration is incomplete. Please check environment variables.');
}