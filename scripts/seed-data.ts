/**
 * Seed data script for MMG Properties Platform
 * Run this to populate the database with test data
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { hash } from 'bcryptjs';

// Initialize Firebase (using your actual config)
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

// Test User Credentials
export const testUsers = {
  admin: {
    email: 'admin@mmgproperties.africa',
    password: 'Admin@MMG2024!',
    role: 'admin',
    name: 'System Administrator',
    phone: '+263771234567',
    nationalId: '63-123456A75',
  },
  owner: {
    email: 'owner@example.com',
    password: 'Owner@123456',
    role: 'owner',
    name: 'John Mutasa',
    phone: '+263772345678',
    nationalId: '42-456789B12',
  },
  agent: {
    email: 'agent@mmgproperties.africa',
    password: 'Agent@123456',
    role: 'agent',
    name: 'Sarah Moyo',
    phone: '+263773456789',
    nationalId: '08-789012C34',
  },
  tenant: {
    email: 'tenant@example.com',
    password: 'Tenant@123456',
    role: 'tenant',
    name: 'David Sibanda',
    phone: '+263774567890',
    nationalId: '12-234567D56',
  },
};

// Test Properties
const testProperties = [
  {
    id: 'prop1',
    name: 'Borrowdale Brook Estate',
    address: '15 Crowhill Road, Borrowdale',
    city: 'Harare',
    type: 'residential',
    bedrooms: 4,
    bathrooms: 3,
    size: 350,
    rent: 1500,
    currency: 'USD',
    ownerId: 'owner1',
    agentId: 'agent1',
    status: 'occupied',
    tenantId: 'tenant1',
    amenities: ['swimming_pool', 'garden', 'garage', 'security'],
    images: ['/property1.jpg'],
    description: 'Luxury 4-bedroom house in Borrowdale Brook with swimming pool and large garden',
  },
  {
    id: 'prop2',
    name: 'Avondale Apartment Complex',
    address: '23 King George Road, Avondale',
    city: 'Harare',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    size: 120,
    rent: 600,
    currency: 'USD',
    ownerId: 'owner1',
    agentId: 'agent1',
    status: 'available',
    amenities: ['parking', 'security', 'backup_power'],
    images: ['/property2.jpg'],
    description: 'Modern 2-bedroom apartment in Avondale with backup power',
  },
  {
    id: 'prop3',
    name: 'Hillside Office Park',
    address: '45 Enterprise Road, Hillside',
    city: 'Bulawayo',
    type: 'commercial',
    size: 500,
    rent: 2000,
    currency: 'USD',
    ownerId: 'owner1',
    agentId: 'agent1',
    status: 'occupied',
    amenities: ['parking', 'security', 'air_conditioning', 'backup_power'],
    images: ['/property3.jpg'],
    description: 'Prime office space in Hillside with ample parking',
  },
];

// Test Maintenance Requests
const testMaintenanceRequests = [
  {
    id: 'maint1',
    propertyId: 'prop1',
    tenantId: 'tenant1',
    category: 'plumbing',
    priority: 'high',
    status: 'pending',
    title: 'Leaking kitchen tap',
    description: 'The kitchen tap has been leaking for 2 days. Water is pooling under the sink.',
    reportedDate: new Date('2024-01-15'),
    images: ['/maintenance1.jpg'],
  },
  {
    id: 'maint2',
    propertyId: 'prop1',
    tenantId: 'tenant1',
    category: 'electrical',
    priority: 'medium',
    status: 'in_progress',
    title: 'Bedroom light not working',
    description: 'Master bedroom ceiling light stopped working yesterday.',
    reportedDate: new Date('2024-01-18'),
    assignedTo: 'agent1',
    images: [],
  },
  {
    id: 'maint3',
    propertyId: 'prop2',
    tenantId: 'tenant1',
    category: 'general',
    priority: 'low',
    status: 'completed',
    title: 'Window cleaning needed',
    description: 'External windows need professional cleaning.',
    reportedDate: new Date('2024-01-10'),
    completedDate: new Date('2024-01-12'),
    assignedTo: 'agent1',
    images: [],
  },
];

// Test Lease Agreements
const testLeases = [
  {
    id: 'lease1',
    propertyId: 'prop1',
    tenantId: 'tenant1',
    ownerId: 'owner1',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    rentAmount: 1500,
    currency: 'USD',
    paymentFrequency: 'monthly',
    depositAmount: 3000,
    status: 'active',
    terms: 'Standard 12-month residential lease agreement',
  },
  {
    id: 'lease2',
    propertyId: 'prop3',
    tenantId: 'tenant2',
    ownerId: 'owner1',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2025-05-31'),
    rentAmount: 2000,
    currency: 'USD',
    paymentFrequency: 'monthly',
    depositAmount: 6000,
    status: 'active',
    terms: 'Commercial lease with 2-year term',
  },
];

// Test Payments
const testPayments = [
  {
    id: 'pay1',
    leaseId: 'lease1',
    tenantId: 'tenant1',
    propertyId: 'prop1',
    amount: 1500,
    currency: 'USD',
    type: 'rent',
    status: 'completed',
    paymentDate: new Date('2024-01-01'),
    method: 'bank_transfer',
    reference: 'RENT-JAN-2024',
  },
  {
    id: 'pay2',
    leaseId: 'lease1',
    tenantId: 'tenant1',
    propertyId: 'prop1',
    amount: 1500,
    currency: 'USD',
    type: 'rent',
    status: 'pending',
    dueDate: new Date('2024-02-01'),
    method: 'bank_transfer',
  },
];

// Test Inspections
const testInspections = [
  {
    id: 'insp1',
    propertyId: 'prop1',
    agentId: 'agent1',
    type: 'routine',
    status: 'completed',
    date: new Date('2024-01-15'),
    findings: {
      exterior: { rating: 4, notes: 'Garden well maintained, pool needs cleaning' },
      interior: { rating: 5, notes: 'All rooms in excellent condition' },
      plumbing: { rating: 3, notes: 'Kitchen tap needs repair' },
      electrical: { rating: 5, notes: 'All systems functioning well' },
      security: { rating: 5, notes: 'Security systems operational' },
    },
    images: ['/inspection1.jpg', '/inspection2.jpg'],
    recommendations: ['Fix kitchen tap', 'Schedule pool cleaning'],
  },
];

// Seed Function
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create test users
    console.log('Creating test users...');
    
    for (const [key, userData] of Object.entries(testUsers)) {
      try {
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        
        // Add user data to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          ...userData,
          uid: userCredential.user.uid,
          createdAt: serverTimestamp(),
          isActive: true,
          isVerified: true,
          emailVerified: true,
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
          console.log(`ℹ️ User ${userData.email} already exists`);
        } else {
          console.error(`❌ Error creating ${userData.email}:`, error.message);
        }
      }
    }

    // Add test properties
    console.log('Adding test properties...');
    for (const property of testProperties) {
      await setDoc(doc(db, 'properties', property.id), {
        ...property,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log(`✅ Added ${testProperties.length} properties`);

    // Add maintenance requests
    console.log('Adding maintenance requests...');
    for (const request of testMaintenanceRequests) {
      await setDoc(doc(db, 'maintenance', request.id), {
        ...request,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log(`✅ Added ${testMaintenanceRequests.length} maintenance requests`);

    // Add leases
    console.log('Adding lease agreements...');
    for (const lease of testLeases) {
      await setDoc(doc(db, 'leases', lease.id), {
        ...lease,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log(`✅ Added ${testLeases.length} leases`);

    // Add payments
    console.log('Adding payment records...');
    for (const payment of testPayments) {
      await setDoc(doc(db, 'payments', payment.id), {
        ...payment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log(`✅ Added ${testPayments.length} payments`);

    // Add inspections
    console.log('Adding inspection reports...');
    for (const inspection of testInspections) {
      await setDoc(doc(db, 'inspections', inspection.id), {
        ...inspection,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log(`✅ Added ${testInspections.length} inspections`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Test User Credentials:');
    console.log('========================');
    Object.entries(testUsers).forEach(([role, user]) => {
      console.log(`\n${role.toUpperCase()}:`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('\n✅ Seeding complete!');
    process.exit(0);
  });
}