import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc,
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

async function fixUserPermissions() {
  console.log('🔧 Fixing user permissions...\n');

  // Check current auth state
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(`✅ Authenticated as: ${user.email} (${user.uid})`);
        
        try {
          // Check if user document exists
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('\n📄 Current user document:', JSON.stringify(userData, null, 2));
            
            // Check if isActive field exists
            if (userData.isActive === undefined || userData.isActive === false) {
              console.log('\n⚠️  User is not active or isActive field is missing');
              console.log('🔧 Setting isActive to true...');
              
              await updateDoc(userDocRef, {
                isActive: true,
                updatedAt: new Date()
              });
              
              console.log('✅ User activated successfully');
            } else {
              console.log('✅ User is already active');
            }
            
            // Verify the update
            const updatedDoc = await getDoc(userDocRef);
            console.log('\n📄 Updated user document:', JSON.stringify(updatedDoc.data(), null, 2));
            
          } else {
            console.log('\n⚠️  User document does not exist');
            console.log('🔧 Creating user document...');
            
            // Create a basic user document
            await setDoc(userDocRef, {
              id: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              role: 'tenant', // Default role
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            console.log('✅ User document created successfully');
          }
          
        } catch (error) {
          console.error('❌ Error accessing user document:', error);
        }
        
      } else {
        console.log('❌ No user is currently authenticated');
        console.log('\n💡 Please sign in first. You can use the following command:');
        console.log('   npm run login:test');
      }
      
      resolve(null);
      process.exit(0);
    });
  });
}

// Run the fix
fixUserPermissions().catch(console.error);