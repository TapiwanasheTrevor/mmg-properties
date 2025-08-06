// Database seeding for MMG Platform
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';
import { 
  User as AppUser, 
  UserRole, 
  Property, 
  Unit, 
  Lease, 
  MaintenanceRequest, 
  Transaction, 
  Tenant, 
  Agent, 
  Owner,
  Notification
} from '../types';

// Check if seeding is allowed
const checkSeedingAllowed = () => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not properly configured. Please set up your Firebase project first.');
  }
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeding is not allowed in production environment');
  }
};

// Helper function to create user with profile
const createUserWithProfile = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  additionalData?: any
): Promise<string> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const userData: Partial<AppUser> = {
      id: user.uid,
      email: user.email!,
      role,
      profile: {
        firstName: displayName.split(' ')[0],
        lastName: displayName.split(' ').slice(1).join(' '),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      },
      permissions: getDefaultPermissions(role),
      isActive: true,
      mfaEnabled: false,
      mfaSetupRequired: false,
      lastLogin: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData,
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    
    console.log(`✅ Created user: ${displayName} (${email}) - Role: ${role}`);
    return user.uid;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  User already exists: ${email}`);
      // Try to sign in to get the user ID
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user.uid;
      } catch (signInError) {
        console.error(`❌ Could not sign in existing user: ${email}`, signInError);
        throw signInError;
      }
    } else {
      console.error(`❌ Failed to create user: ${email}`, error);
      throw error;
    }
  }
};

// Get default permissions for role
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
        'payments:read', 'reports:read'
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
        'properties:read', 'leases:read',
        'maintenance:read', 'maintenance:write',
        'payments:read'
      ];
    default:
      return [];
  }
};

// Generate unique ID
const generateId = () => doc(db, 'temp').id;

// Seeding functions
export const seedTestUsers = async () => {
  checkSeedingAllowed();
  console.log('🌱 Seeding test users...');

  const users = {
    // Admin users
    admin: await createUserWithProfile(
      'admin@mmg.com',
      'password123',
      'Admin User',
      'admin'
    ),
    
    // Owner users
    owner1: await createUserWithProfile(
      'john.owner@mmg.com',
      'password123',
      'John Smith',
      'owner',
      { phone: '+1-555-0101' }
    ),
    
    owner2: await createUserWithProfile(
      'sarah.owner@mmg.com',
      'password123',
      'Sarah Johnson',
      'owner',
      { phone: '+1-555-0102' }
    ),

    // Agent users
    agent1: await createUserWithProfile(
      'mike.agent@mmg.com',
      'password123',
      'Mike Wilson',
      'agent',
      { phone: '+1-555-0201' }
    ),

    agent2: await createUserWithProfile(
      'emma.agent@mmg.com',
      'password123',
      'Emma Davis',
      'agent',
      { phone: '+1-555-0202' }
    ),

    // Tenant users
    tenant1: await createUserWithProfile(
      'alex.tenant@mmg.com',
      'password123',
      'Alex Rodriguez',
      'tenant',
      { phone: '+1-555-0301' }
    ),

    tenant2: await createUserWithProfile(
      'lisa.tenant@mmg.com',
      'password123',
      'Lisa Brown',
      'tenant',
      { phone: '+1-555-0302' }
    ),

    tenant3: await createUserWithProfile(
      'david.tenant@mmg.com',
      'password123',
      'David Chen',
      'tenant',
      { phone: '+1-555-0303' }
    ),

    tenant4: await createUserWithProfile(
      'maria.tenant@mmg.com',
      'password123',
      'Maria Garcia',
      'tenant',
      { phone: '+1-555-0304' }
    ),
  };

  console.log('✅ Test users created successfully!');
  return users;
};

export const seedProperties = async (userIds: any) => {
  checkSeedingAllowed();
  console.log('🌱 Seeding properties...');

  const properties = [
    {
      id: generateId(),
      ownerId: userIds.owner1,
      agentId: userIds.agent1,
      name: 'Sunset Apartments',
      address: {
        street: '123 Sunset Boulevard',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        coordinates: { lat: 34.0522, lng: -118.2437 }
      },
      type: 'residential' as const,
      status: 'active' as const,
      description: 'Modern apartment complex with premium amenities',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
        'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800'
      ],
      documents: [],
      totalUnits: 24,
      occupiedUnits: 20,
      monthlyIncome: 48000,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      id: generateId(),
      ownerId: userIds.owner2,
      agentId: userIds.agent2,
      name: 'Downtown Lofts',
      address: {
        street: '456 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      },
      type: 'residential' as const,
      status: 'active' as const,
      description: 'Luxury loft apartments in the heart of downtown',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
      ],
      documents: [],
      totalUnits: 12,
      occupiedUnits: 10,
      monthlyIncome: 36000,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      id: generateId(),
      ownerId: userIds.owner1,
      agentId: userIds.agent1,
      name: 'Garden View Condos',
      address: {
        street: '789 Garden Avenue',
        city: 'San Diego',
        state: 'CA',
        zipCode: '92101',
        country: 'USA',
        coordinates: { lat: 32.7157, lng: -117.1611 }
      },
      type: 'residential' as const,
      status: 'active' as const,
      description: 'Beautiful condos with garden views and pool',
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
      ],
      documents: [],
      totalUnits: 16,
      occupiedUnits: 14,
      monthlyIncome: 28800,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  ];

  const batch = writeBatch(db);
  properties.forEach(property => {
    const docRef = doc(db, 'properties', property.id);
    batch.set(docRef, property);
  });

  await batch.commit();
  console.log('✅ Properties created successfully!');
  return properties;
};

export const seedUnits = async (properties: any[]) => {
  checkSeedingAllowed();
  console.log('🌱 Seeding units...');

  const units = [];
  const batch = writeBatch(db);

  // Sunset Apartments - 24 units
  for (let i = 1; i <= 24; i++) {
    const unitId = generateId();
    const unit = {
      id: unitId,
      propertyId: properties[0].id,
      unitNumber: `${Math.floor((i-1)/6) + 1}${String.fromCharCode(65 + ((i-1) % 6))}`,
      type: i % 4 === 0 ? '2br' : i % 3 === 0 ? '1br' : 'studio',
      status: i <= 20 ? 'occupied' : 'vacant',
      squareFootage: i % 4 === 0 ? 1200 : i % 3 === 0 ? 800 : 600,
      monthlyRent: i % 4 === 0 ? 2400 : i % 3 === 0 ? 1800 : 1200,
      isOccupied: i <= 20,
      amenities: ['Air Conditioning', 'Dishwasher', 'In-unit Laundry'],
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'],
      description: `Modern ${i % 4 === 0 ? '2-bedroom' : i % 3 === 0 ? '1-bedroom' : 'studio'} apartment`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    units.push(unit);
    const docRef = doc(db, 'units', unitId);
    batch.set(docRef, unit);
  }

  // Downtown Lofts - 12 units
  for (let i = 1; i <= 12; i++) {
    const unitId = generateId();
    const unit = {
      id: unitId,
      propertyId: properties[1].id,
      unitNumber: `${Math.floor((i-1)/4) + 1}${String.fromCharCode(65 + ((i-1) % 4))}`,
      type: i % 3 === 0 ? '3br' : '2br',
      status: i <= 10 ? 'occupied' : 'vacant',
      squareFootage: i % 3 === 0 ? 1600 : 1200,
      monthlyRent: i % 3 === 0 ? 3600 : 3000,
      isOccupied: i <= 10,
      amenities: ['Hardwood Floors', 'High Ceilings', 'City Views', 'Modern Kitchen'],
      images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600'],
      description: `Luxury ${i % 3 === 0 ? '3-bedroom' : '2-bedroom'} loft`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    units.push(unit);
    const docRef = doc(db, 'units', unitId);
    batch.set(docRef, unit);
  }

  // Garden View Condos - 16 units
  for (let i = 1; i <= 16; i++) {
    const unitId = generateId();
    const unit = {
      id: unitId,
      propertyId: properties[2].id,
      unitNumber: `${Math.floor((i-1)/4) + 1}${String.fromCharCode(65 + ((i-1) % 4))}`,
      type: i % 2 === 0 ? '2br' : '1br',
      status: i <= 14 ? 'occupied' : 'vacant',
      squareFootage: i % 2 === 0 ? 1100 : 750,
      monthlyRent: i % 2 === 0 ? 2200 : 1600,
      isOccupied: i <= 14,
      amenities: ['Balcony', 'Pool Access', 'Garden View', 'Parking'],
      images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600'],
      description: `Comfortable ${i % 2 === 0 ? '2-bedroom' : '1-bedroom'} condo`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    units.push(unit);
    const docRef = doc(db, 'units', unitId);
    batch.set(docRef, unit);
  }

  await batch.commit();
  console.log('✅ Units created successfully!');
  return units;
};

export const seedExtendedData = async (userIds: any, properties: any[], units: any[]) => {
  checkSeedingAllowed();
  console.log('🌱 Seeding extended data (tenants, agents, owners)...');

  const batch = writeBatch(db);

  // Create tenant profiles
  const tenants = [
    {
      id: generateId(),
      userId: userIds.tenant1,
      personalInfo: {
        idNumber: 'DL123456789',
        nationality: 'American',
        occupation: 'Software Engineer',
        employer: 'Tech Corp',
        emergencyContact: {
          name: 'Maria Rodriguez',
          phone: '+1-555-0399',
          relationship: 'Mother'
        }
      },
      currentUnit: units.find(u => u.propertyId === properties[0].id && u.isOccupied)?.id,
      leaseHistory: [],
      paymentHistory: [],
      requestHistory: [],
      status: 'active' as const,
      createdAt: serverTimestamp(),
    },
    {
      id: generateId(),
      userId: userIds.tenant2,
      personalInfo: {
        idNumber: 'DL987654321',
        nationality: 'American',
        occupation: 'Graphic Designer',
        employer: 'Creative Agency',
        emergencyContact: {
          name: 'John Brown',
          phone: '+1-555-0398',
          relationship: 'Father'
        }
      },
      currentUnit: units.find(u => u.propertyId === properties[1].id && u.isOccupied)?.id,
      leaseHistory: [],
      paymentHistory: [],
      requestHistory: [],
      status: 'active' as const,
      createdAt: serverTimestamp(),
    }
  ];

  tenants.forEach(tenant => {
    const docRef = doc(db, 'tenants', tenant.id);
    batch.set(docRef, tenant);
  });

  // Create agent profiles
  const agents = [
    {
      id: generateId(),
      userId: userIds.agent1,
      assignedProperties: [properties[0].id, properties[2].id],
      specializations: ['Residential', 'Luxury Apartments'],
      performance: {
        completedTasks: 156,
        avgResponseTime: 2.5,
        tenantSatisfactionRating: 4.7
      },
      workSchedule: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingHours: { start: '09:00', end: '17:00' }
      },
      status: 'active' as const,
      createdAt: serverTimestamp(),
    },
    {
      id: generateId(),
      userId: userIds.agent2,
      assignedProperties: [properties[1].id],
      specializations: ['Commercial', 'Luxury Lofts'],
      performance: {
        completedTasks: 89,
        avgResponseTime: 1.8,
        tenantSatisfactionRating: 4.9
      },
      workSchedule: {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        workingHours: { start: '08:00', end: '18:00' }
      },
      status: 'active' as const,
      createdAt: serverTimestamp(),
    }
  ];

  agents.forEach(agent => {
    const docRef = doc(db, 'agents', agent.id);
    batch.set(docRef, agent);
  });

  // Create owner profiles
  const owners = [
    {
      id: generateId(),
      userId: userIds.owner1,
      ownedProperties: [properties[0].id, properties[2].id],
      bankDetails: {
        accountName: 'John Smith',
        accountNumber: '****1234',
        bankName: 'First National Bank',
        branch: 'Downtown Branch'
      },
      preferences: {
        paymentDay: 1,
        communicationMethod: 'email' as const,
        autoApproveLimit: 500
      },
      createdAt: serverTimestamp(),
    },
    {
      id: generateId(),
      userId: userIds.owner2,
      ownedProperties: [properties[1].id],
      bankDetails: {
        accountName: 'Sarah Johnson',
        accountNumber: '****5678',
        bankName: 'Community Bank',
        branch: 'Main Street Branch'
      },
      preferences: {
        paymentDay: 5,
        communicationMethod: 'both' as const,
        autoApproveLimit: 1000
      },
      createdAt: serverTimestamp(),
    }
  ];

  owners.forEach(owner => {
    const docRef = doc(db, 'owners', owner.id);
    batch.set(docRef, owner);
  });

  await batch.commit();
  console.log('✅ Extended data created successfully!');
  return { tenants, agents, owners };
};

// Main seeding function
export const seedAllData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Create test users
    const userIds = await seedTestUsers();
    
    // Create properties
    const properties = await seedProperties(userIds);
    
    // Create units
    const units = await seedUnits(properties);
    
    // Create extended data
    const extendedData = await seedExtendedData(userIds, properties, units);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${Object.keys(userIds).length}`);
    console.log(`- Properties: ${properties.length}`);
    console.log(`- Units: ${units.length}`);
    console.log(`- Tenants: ${extendedData.tenants.length}`);
    console.log(`- Agents: ${extendedData.agents.length}`);
    console.log(`- Owners: ${extendedData.owners.length}`);

    return {
      userIds,
      properties,
      units,
      ...extendedData,
    };
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};