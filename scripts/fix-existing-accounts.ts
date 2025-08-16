import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc
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

// Test accounts configuration
const testAccounts = [
  {
    email: 'admin@mmgproperties.africa',
    password: 'Admin@MMG2024!',
    role: 'admin',
    name: 'Admin User',
    permissions: ['all']
  },
  {
    email: 'owner@example.com',
    password: 'Owner@123456',
    role: 'owner',
    name: 'Property Owner',
    properties: []
  },
  {
    email: 'agent@mmgproperties.africa',
    password: 'Agent@123456',
    role: 'agent',
    name: 'Field Agent',
    managedProperties: []
  },
  {
    email: 'tenant@example.com',
    password: 'Tenant@123456',
    role: 'tenant',
    name: 'Test Tenant',
    leaseId: null
  }
];

async function fixExistingAccounts() {
  console.log('🔧 Fixing existing test accounts...\n');
  
  for (const account of testAccounts) {
    console.log(`📧 Processing ${account.email}...`);
    
    try {
      // Sign in with the account
      const userCredential = await signInWithEmailAndPassword(auth, account.email, account.password);
      const user = userCredential.user;
      console.log(`✅ Signed in successfully (UID: ${user.uid})`);
      
      // Check and update user document
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const currentData = userDoc.data();
        console.log(`📄 User document exists with role: ${currentData.role}`);
        
        // Update to ensure all required fields are present
        const updateData: any = {
          email: account.email,
          name: account.name,
          role: account.role,
          isActive: true,
          updatedAt: new Date()
        };
        
        // Add role-specific fields
        if (account.role === 'admin' && account.permissions) {
          updateData.permissions = account.permissions;
        }
        if (account.role === 'owner' && account.properties !== undefined) {
          updateData.properties = account.properties;
        }
        if (account.role === 'agent' && account.managedProperties !== undefined) {
          updateData.managedProperties = account.managedProperties;
        }
        if (account.role === 'tenant' && account.leaseId !== undefined) {
          updateData.leaseId = account.leaseId;
        }
        
        await updateDoc(userDocRef, updateData);
        console.log(`✅ Updated user document with role: ${account.role}`);
        
      } else {
        console.log('⚠️  User document not found, creating...');
        
        // Create user document with all required fields
        const newUserData: any = {
          id: user.uid,
          email: account.email,
          name: account.name,
          role: account.role,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Add role-specific fields
        if (account.role === 'admin' && account.permissions) {
          newUserData.permissions = account.permissions;
        }
        if (account.role === 'owner' && account.properties !== undefined) {
          newUserData.properties = account.properties;
        }
        if (account.role === 'agent' && account.managedProperties !== undefined) {
          newUserData.managedProperties = account.managedProperties;
        }
        if (account.role === 'tenant' && account.leaseId !== undefined) {
          newUserData.leaseId = account.leaseId;
        }
        
        await setDoc(userDocRef, newUserData);
        console.log(`✅ Created user document with role: ${account.role}`);
      }
      
      // Sign out before processing next account
      await auth.signOut();
      console.log('✅ Signed out\n');
      
    } catch (error: any) {
      console.error(`❌ Error processing ${account.email}:`, error.message);
      if (error.code === 'auth/user-not-found') {
        console.log('   User does not exist in Firebase Auth. Please create the account first.');
      }
      console.log('');
    }
  }
  
  console.log('✅ All test accounts have been processed!');
  console.log('\n📝 Test Account Summary:');
  console.log('------------------------');
  testAccounts.forEach(account => {
    console.log(`${account.role.toUpperCase()}:`);
    console.log(`  Email: ${account.email}`);
    console.log(`  Password: ${account.password}`);
    console.log('');
  });
  
  process.exit(0);
}

// Run the fix
fixExistingAccounts().catch(console.error);