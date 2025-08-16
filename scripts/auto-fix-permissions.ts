import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc
} from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test account credentials
const TEST_EMAIL = 'admin@mmg.com';
const TEST_PASSWORD = 'Test123!';

async function autoFixPermissions() {
  console.log('🔧 Auto-fixing Firebase permissions...\n');
  
  try {
    // Try to sign in first
    console.log(`📧 Attempting to sign in as ${TEST_EMAIL}...`);
    let user;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
      user = userCredential.user;
      console.log('✅ Signed in successfully');
    } catch (signInError: any) {
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
        // Create the account
        console.log('⚠️  User not found, creating account...');
        const userCredential = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
        user = userCredential.user;
        console.log('✅ Account created successfully');
      } else {
        throw signInError;
      }
    }
    
    // Ensure user document exists and is properly configured
    console.log('\n📄 Configuring user document...');
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    let userData;
    if (userDoc.exists()) {
      userData = userDoc.data();
      console.log('✅ User document exists');
      
      // Update to ensure isActive is true
      if (!userData.isActive) {
        console.log('🔧 Activating user...');
        userData = {
          ...userData,
          isActive: true,
          updatedAt: new Date()
        };
        await setDoc(userDocRef, userData);
        console.log('✅ User activated');
      }
    } else {
      console.log('🔧 Creating user document...');
      userData = {
        id: user.uid,
        email: user.email,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        permissions: ['all'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await setDoc(userDocRef, userData);
      console.log('✅ User document created');
    }
    
    console.log('\n✅ All permissions fixed successfully!');
    console.log('\n📝 User Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Active: ${userData.isActive}`);
    
    console.log('\n🎉 You can now use the application without permission errors!');
    console.log('   The dev server should automatically reload and work properly.');
    
    // Sign out to let the app handle auth properly
    await auth.signOut();
    console.log('\n📤 Signed out. Please sign in through the application.');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the auto-fix
autoFixPermissions();