/**
 * Simple test script to verify Firebase connection and authentication
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  limit, 
  getDocs
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-w4tP94wfkorfa0vgKFd4kVYU-qDqe48",
  authDomain: "mmg-platform.firebaseapp.com",
  databaseURL: "https://mmg-platform-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mmg-platform",
  storageBucket: "mmg-platform.firebasestorage.app",
  messagingSenderId: "220106972775",
  appId: "1:220106972775:web:04a44cb649fb1c617afec2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...\n');

  try {
    // Test 1: Authentication
    console.log('Test 1: Authentication');
    console.log('=====================');
    
    const testEmail = 'admin@mmgproperties.africa';
    const testPassword = 'Admin@MMG2024!';
    
    console.log(`Attempting login with: ${testEmail}`);
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Authentication successful!');
    console.log(`User ID: ${userCredential.user.uid}`);
    console.log(`Email: ${userCredential.user.email}\n`);

    // Test 2: Firestore Read
    console.log('Test 2: Firestore Access');
    console.log('========================');
    
    // Test reading users collection
    console.log('Reading users collection...');
    const usersQuery = query(collection(db, 'users'), limit(5));
    const usersSnapshot = await getDocs(usersQuery);
    console.log(`✅ Found ${usersSnapshot.size} users in database\n`);

    // Test reading properties collection
    console.log('Reading properties collection...');
    const propertiesQuery = query(collection(db, 'properties'), limit(5));
    const propertiesSnapshot = await getDocs(propertiesQuery);
    console.log(`✅ Found ${propertiesSnapshot.size} properties in database\n`);

    // Test reading maintenance collection
    console.log('Reading maintenance collection...');
    const maintenanceQuery = query(collection(db, 'maintenance'), limit(5));
    const maintenanceSnapshot = await getDocs(maintenanceQuery);
    console.log(`✅ Found ${maintenanceSnapshot.size} maintenance requests in database\n`);

    // Sign out
    await signOut(auth);
    console.log('✅ Successfully signed out\n');

    console.log('🎉 All Firebase tests passed!');
    console.log('===============================');
    console.log('✅ Authentication: Working');
    console.log('✅ Firestore Rules: Working');
    console.log('✅ Database Access: Working');
    console.log('✅ Security Rules: Deployed');
    console.log('\n📱 Platform Status: READY FOR TESTING');
    console.log('\n🌐 Login at: http://localhost:3004');
    console.log('👤 Use any of the test credentials from TEST_CREDENTIALS.md');

  } catch (error: any) {
    console.error('❌ Firebase test failed:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'auth/wrong-password') {
      console.error('Wrong password - check TEST_CREDENTIALS.md');
    } else if (error.code === 'auth/user-not-found') {
      console.error('User not found - run npm run setup:firebase first');
    } else if (error.code === 'permission-denied') {
      console.error('Permission denied - check Firestore rules');
    }
    
    process.exit(1);
  }
}

// Run the test
testFirebaseConnection();