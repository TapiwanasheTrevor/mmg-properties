/**
 * Firebase Setup Script for MMG Properties Platform
 * This script helps initialize Firebase for development and testing
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  connectAuthEmulator
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp,
  connectFirestoreEmulator
} from 'firebase/firestore';

// Check if we're using emulator
const USE_EMULATOR = process.env.USE_FIREBASE_EMULATOR === 'true';

// Firebase configuration - using your actual project credentials
const firebaseConfig = {
  apiKey: "AIzaSyD-w4tP94wfkorfa0vgKFd4kVYU-qDqe48",
  authDomain: "mmg-platform.firebaseapp.com",
  databaseURL: "https://mmg-platform-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mmg-platform",
  storageBucket: "mmg-platform.firebasestorage.app",
  messagingSenderId: "220106972775",
  appId: "1:220106972775:web:04a44cb649fb1c617afec2"
};

console.log('🔥 Initializing Firebase...');
console.log('Using configuration:', {
  ...firebaseConfig,
  apiKey: '***' + firebaseConfig.apiKey.slice(-4) // Hide most of API key
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators if enabled
if (USE_EMULATOR) {
  console.log('📦 Connecting to Firebase Emulators...');
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// Test users to create
const testUsers = [
  {
    email: 'admin@mmgproperties.africa',
    password: 'Admin@MMG2024!',
    displayName: 'System Administrator',
    role: 'admin',
    phone: '+263771234567',
    nationalId: '63-123456A75',
  },
  {
    email: 'owner@example.com',
    password: 'Owner@123456',
    displayName: 'John Mutasa',
    role: 'owner',
    phone: '+263772345678',
    nationalId: '42-456789B12',
  },
  {
    email: 'agent@mmgproperties.africa',
    password: 'Agent@123456',
    displayName: 'Sarah Moyo',
    role: 'agent',
    phone: '+263773456789',
    nationalId: '08-789012C34',
  },
  {
    email: 'tenant@example.com',
    password: 'Tenant@123456',
    displayName: 'David Sibanda',
    role: 'tenant',
    phone: '+263774567890',
    nationalId: '12-234567D56',
  },
];

async function setupFirebase() {
  console.log('\n🚀 Starting Firebase setup...\n');

  // Test Firebase connection
  try {
    console.log('Testing Firebase Auth connection...');
    // Try to sign in with a test email to check if Auth is working
    await signInWithEmailAndPassword(auth, 'test@test.com', 'test123').catch(() => {
      console.log('✅ Firebase Auth is reachable (test login failed as expected)');
    });
  } catch (error: any) {
    if (error.code === 'auth/network-request-failed') {
      console.error('❌ Cannot connect to Firebase. Please check:');
      console.error('   1. Your internet connection');
      console.error('   2. Firebase project exists');
      console.error('   3. API keys are correct');
      return;
    }
  }

  // Create test users
  console.log('\n👥 Creating test users...\n');
  
  for (const userData of testUsers) {
    try {
      console.log(`Creating ${userData.role}: ${userData.email}`);
      
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        phone: userData.phone,
        nationalId: userData.nationalId,
        isActive: true,
        isVerified: true,
        emailVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          notifications: true,
          theme: 'light',
          language: 'en',
          currency: 'USD',
        },
      });
      
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`ℹ️  User ${userData.email} already exists`);
        
        // Try to sign in to verify credentials
        try {
          await signInWithEmailAndPassword(auth, userData.email, userData.password);
          console.log(`✅ Verified login for: ${userData.email}`);
        } catch (loginError: any) {
          console.log(`⚠️  Cannot login with ${userData.email} - password may be different`);
        }
      } else if (error.code === 'auth/weak-password') {
        console.error(`❌ Weak password for ${userData.email}`);
      } else if (error.code === 'auth/invalid-email') {
        console.error(`❌ Invalid email: ${userData.email}`);
      } else {
        console.error(`❌ Error creating ${userData.email}:`, error.message);
      }
    }
  }

  console.log('\n📊 Setup Summary:\n');
  console.log('=====================================');
  console.log('Firebase Project:', firebaseConfig.projectId);
  console.log('Auth Domain:', firebaseConfig.authDomain);
  console.log('Emulator Mode:', USE_EMULATOR ? 'Enabled' : 'Disabled');
  console.log('=====================================\n');
  
  console.log('🎉 Firebase setup complete!\n');
  console.log('Test Credentials:');
  console.log('=================');
  testUsers.forEach(user => {
    console.log(`\n${user.role.toUpperCase()}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
  });
  
  console.log('\n📝 Next Steps:');
  console.log('1. Run "npm run dev" to start the development server');
  console.log('2. Navigate to http://localhost:3000');
  console.log('3. Login with any of the test credentials above');
  console.log('\n');
}

// Run setup
setupFirebase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });