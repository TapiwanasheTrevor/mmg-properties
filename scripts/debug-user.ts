/**
 * Debug user data script to check what's stored in Firestore
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc
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

async function debugUser() {
  console.log('🔍 Debugging user data...\n');

  try {
    // Login as admin
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      'admin@mmgproperties.africa', 
      'Admin@MMG2024!'
    );
    
    console.log('✅ Login successful!');
    console.log('User ID:', userCredential.user.uid);
    console.log('Email:', userCredential.user.email);
    console.log('Display Name:', userCredential.user.displayName);
    
    // Get user document from Firestore
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('\n📄 User document found in Firestore:');
      console.log('================================');
      const userData = userDoc.data();
      console.log(JSON.stringify(userData, null, 2));
    } else {
      console.log('\n❌ No user document found in Firestore!');
      console.log('This explains why the dashboard is blank.');
      console.log('User document should be at path: users/' + userCredential.user.uid);
    }

  } catch (error: any) {
    console.error('❌ Debug error:', error.message);
  }
}

debugUser();