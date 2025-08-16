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
  setDoc,
  collection,
  query,
  getDocs,
  limit
} from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function fixAuthAndPermissions() {
  console.log('🔧 Firebase Auth & Permissions Fix Tool\n');
  
  // Check if there are any existing users
  try {
    const usersQuery = query(collection(db, 'users'), limit(5));
    const snapshot = await getDocs(usersQuery);
    
    if (!snapshot.empty) {
      console.log('📋 Found existing users in database:');
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   - ${data.email} (${data.role}) - Active: ${data.isActive}`);
      });
      console.log('');
    }
  } catch (error) {
    console.log('⚠️  Could not fetch existing users (this is normal if you\'re not authenticated)\n');
  }

  console.log('Choose an option:');
  console.log('1. Sign in with existing account');
  console.log('2. Create a new test account');
  console.log('3. Exit\n');
  
  const choice = await question('Enter your choice (1-3): ');
  
  if (choice === '3') {
    console.log('Exiting...');
    rl.close();
    process.exit(0);
  }
  
  let email: string;
  let password: string;
  
  if (choice === '1') {
    email = await question('Enter email: ');
    password = await question('Enter password: ');
    
    try {
      console.log('\n🔐 Signing in...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Signed in successfully');
      
      await ensureUserDocument(userCredential.user);
      
    } catch (error: any) {
      console.error('❌ Sign in failed:', error.message);
      
      if (error.code === 'auth/user-not-found') {
        const create = await question('\nUser not found. Would you like to create this account? (y/n): ');
        if (create.toLowerCase() === 'y') {
          await createAccount(email, password);
        }
      }
    }
    
  } else if (choice === '2') {
    console.log('\n📝 Create a test account');
    console.log('Suggested test accounts:');
    console.log('  - admin@mmg.com (Admin role)');
    console.log('  - owner@mmg.com (Owner role)');
    console.log('  - agent@mmg.com (Agent role)');
    console.log('  - tenant@mmg.com (Tenant role)\n');
    
    email = await question('Enter email (or press Enter for admin@mmg.com): ');
    if (!email) email = 'admin@mmg.com';
    
    password = await question('Enter password (or press Enter for Test123!): ');
    if (!password) password = 'Test123!';
    
    await createAccount(email, password);
  }
  
  rl.close();
}

async function createAccount(email: string, password: string) {
  try {
    console.log('\n🔧 Creating account...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Account created successfully');
    
    await ensureUserDocument(userCredential.user);
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Email already in use, attempting to sign in...');
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Signed in successfully');
        await ensureUserDocument(userCredential.user);
      } catch (signInError: any) {
        console.error('❌ Sign in failed:', signInError.message);
      }
    } else {
      console.error('❌ Account creation failed:', error.message);
    }
  }
}

async function ensureUserDocument(user: any) {
  console.log('\n📄 Checking user document...');
  
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    console.log('✅ User document exists');
    console.log('   Current data:', JSON.stringify(userData, null, 2));
    
    // Ensure isActive is true
    if (!userData.isActive) {
      console.log('\n🔧 Activating user...');
      await setDoc(userDocRef, {
        ...userData,
        isActive: true,
        updatedAt: new Date()
      });
      console.log('✅ User activated');
    }
    
  } else {
    console.log('⚠️  User document not found');
    console.log('🔧 Creating user document...');
    
    // Determine role based on email
    let role = 'tenant';
    if (user.email?.includes('admin')) role = 'admin';
    else if (user.email?.includes('owner')) role = 'owner';
    else if (user.email?.includes('agent')) role = 'agent';
    
    const newUserData = {
      id: user.uid,
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      role: role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Add role-specific fields
      ...(role === 'admin' && { permissions: ['all'] }),
      ...(role === 'owner' && { properties: [] }),
      ...(role === 'agent' && { managedProperties: [] }),
      ...(role === 'tenant' && { leaseId: null })
    };
    
    await setDoc(userDocRef, newUserData);
    console.log('✅ User document created');
    console.log('   User data:', JSON.stringify(newUserData, null, 2));
  }
  
  console.log('\n✅ All permissions fixed!');
  console.log('🎉 You can now use the application without permission errors.');
  console.log('\n📝 User details:');
  console.log(`   Email: ${user.email}`);
  console.log(`   UID: ${user.uid}`);
}

// Run the fix
fixAuthAndPermissions().catch(console.error);