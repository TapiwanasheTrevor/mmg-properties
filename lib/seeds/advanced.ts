// Advanced seeding for leases, maintenance, transactions, and notifications
import { doc, setDoc, serverTimestamp, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Lease, 
  MaintenanceRequest, 
  Transaction, 
  Notification,
  Inspection
} from '../types';

// Generate unique ID
const generateId = () => doc(db, 'temp').id;

// Helper to generate random date within range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

export const seedLeases = async (userIds: any, properties: any[], units: any[]) => {
  console.log('🌱 Seeding leases...');

  const batch = writeBatch(db);
  const leases = [];

  // Create active leases for occupied units
  const occupiedUnits = units.filter(unit => unit.isOccupied);
  const tenantIds = [userIds.tenant1, userIds.tenant2, userIds.tenant3, userIds.tenant4];

  for (let i = 0; i < Math.min(occupiedUnits.length, 20); i++) {
    const unit = occupiedUnits[i];
    const property = properties.find(p => p.id === unit.propertyId);
    const tenantId = tenantIds[i % tenantIds.length];
    
    const startDate = randomDate(new Date(2024, 0, 1), new Date(2024, 6, 1));
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const leaseId = generateId();
    const lease = {
      id: leaseId,
      propertyId: property.id,
      unitId: unit.id,
      tenantId: tenantId,
      ownerId: property.ownerId,
      agentId: property.agentId,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      monthlyRent: unit.monthlyRent,
      securityDeposit: unit.monthlyRent * 2,
      paymentFrequency: 'monthly' as const,
      terms: `Standard residential lease agreement for ${unit.type} apartment at ${property.name}. Includes utilities (water, sewer, trash). Tenant responsible for electricity and internet.`,
      status: 'active' as const,
      documents: [],
      paymentHistory: [],
      renewalHistory: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    leases.push(lease);
    const docRef = doc(db, 'leases', leaseId);
    batch.set(docRef, lease);

    // Update unit with lease and tenant info
    const unitRef = doc(db, 'units', unit.id);
    batch.update(unitRef, {
      currentLeaseId: leaseId,
      currentTenantId: tenantId,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`✅ Created ${leases.length} leases`);
  return leases;
};

export const seedMaintenanceRequests = async (userIds: any, properties: any[], units: any[], leases: any[]) => {
  console.log('🌱 Seeding maintenance requests...');

  const batch = writeBatch(db);
  const maintenanceRequests = [];

  const categories = ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other'];
  const priorities = ['low', 'medium', 'high', 'emergency'];
  const statuses = ['submitted', 'assigned', 'in_progress', 'completed'];

  // Create 25 maintenance requests
  for (let i = 0; i < 25; i++) {
    const lease = leases[i % leases.length];
    const unit = units.find(u => u.id === lease.unitId);
    const property = properties.find(p => p.id === lease.propertyId);

    const requestId = generateId();
    const category = categories[Math.floor(Math.random() * categories.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const titles = {
      plumbing: ['Leaking faucet in kitchen', 'Toilet not flushing properly', 'Low water pressure in shower'],
      electrical: ['Light switch not working', 'Outlet not functioning', 'Flickering lights in bedroom'],
      hvac: ['Air conditioning not cooling', 'Heater making noise', 'Thermostat not responding'],
      appliance: ['Dishwasher not draining', 'Refrigerator making noise', 'Washer not spinning'],
      structural: ['Crack in wall', 'Loose handrail', 'Squeaky floorboard'],
      other: ['Window won\'t close properly', 'Door lock sticking', 'Paint peeling in bathroom']
    };

    const descriptions = {
      plumbing: 'The issue has been ongoing for a few days and is getting worse. Please schedule a repair as soon as possible.',
      electrical: 'This is a safety concern and needs immediate attention. The issue started yesterday.',
      hvac: 'The temperature control is not working properly. It\'s affecting our comfort significantly.',
      appliance: 'The appliance is not functioning correctly and needs professional repair or replacement.',
      structural: 'This issue needs to be addressed to prevent further damage to the property.',
      other: 'General maintenance issue that should be looked at when convenient.'
    };

    const maintenanceRequest = {
      id: requestId,
      propertyId: property.id,
      unitId: unit.id,
      tenantId: lease.tenantId,
      agentId: property.agentId,
      ownerId: property.ownerId,
      title: titles[category][Math.floor(Math.random() * titles[category].length)],
      description: descriptions[category],
      category: category as any,
      priority: priority as any,
      status: status as any,
      submittedMedia: [],
      progressMedia: [],
      completionMedia: [],
      estimatedCost: Math.floor(Math.random() * 500) + 50,
      actualCost: status === 'completed' ? Math.floor(Math.random() * 600) + 25 : undefined,
      requiresApproval: priority === 'high' || priority === 'emergency',
      approvedBy: (priority === 'high' || priority === 'emergency') ? property.ownerId : undefined,
      scheduledDate: status !== 'submitted' ? Timestamp.fromDate(randomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))) : undefined,
      completedDate: status === 'completed' ? Timestamp.fromDate(randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())) : undefined,
      comments: [],
      createdAt: Timestamp.fromDate(randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date())),
      updatedAt: serverTimestamp(),
    };

    maintenanceRequests.push(maintenanceRequest);
    const docRef = doc(db, 'maintenance_requests', requestId);
    batch.set(docRef, maintenanceRequest);
  }

  await batch.commit();
  console.log(`✅ Created ${maintenanceRequests.length} maintenance requests`);
  return maintenanceRequests;
};

export const seedTransactions = async (userIds: any, properties: any[], leases: any[]) => {
  console.log('🌱 Seeding transactions...');

  const batch = writeBatch(db);
  const transactions = [];

  // Create rent payments for the last 6 months
  const now = new Date();
  for (let monthsBack = 0; monthsBack < 6; monthsBack++) {
    const paymentDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    
    for (const lease of leases.slice(0, 15)) { // First 15 leases
      const property = properties.find(p => p.id === lease.propertyId);
      const transactionId = generateId();
      
      const isLate = Math.random() < 0.1; // 10% chance of late payment
      const actualPaymentDate = new Date(paymentDate);
      if (isLate) {
        actualPaymentDate.setDate(actualPaymentDate.getDate() + Math.floor(Math.random() * 15) + 5);
      } else {
        actualPaymentDate.setDate(actualPaymentDate.getDate() + Math.floor(Math.random() * 5));
      }

      const transaction = {
        id: transactionId,
        type: 'rent' as const,
        amount: lease.monthlyRent,
        description: `Monthly rent payment for ${paymentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        propertyId: property.id,
        unitId: lease.unitId,
        tenantId: lease.tenantId,
        leaseId: lease.id,
        status: monthsBack === 0 && Math.random() < 0.2 ? 'pending' : 'completed' as const,
        paymentMethod: ['online', 'check', 'transfer'][Math.floor(Math.random() * 3)],
        reference: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        createdAt: Timestamp.fromDate(paymentDate),
        processedAt: Timestamp.fromDate(actualPaymentDate),
      };

      transactions.push(transaction);
      const docRef = doc(db, 'transactions', transactionId);
      batch.set(docRef, transaction);
    }
  }

  // Create some security deposit transactions
  for (const lease of leases.slice(0, 10)) {
    const property = properties.find(p => p.id === lease.propertyId);
    const transactionId = generateId();
    
    const transaction = {
      id: transactionId,
      type: 'deposit' as const,
      amount: lease.securityDeposit,
      description: 'Security deposit payment',
      propertyId: property.id,
      unitId: lease.unitId,
      tenantId: lease.tenantId,
      leaseId: lease.id,
      status: 'completed' as const,
      paymentMethod: 'transfer',
      reference: `DEP${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: lease.startDate,
      processedAt: lease.startDate,
    };

    transactions.push(transaction);
    const docRef = doc(db, 'transactions', transactionId);
    batch.set(docRef, transaction);
  }

  await batch.commit();
  console.log(`✅ Created ${transactions.length} transactions`);
  return transactions;
};

export const seedNotifications = async (userIds: any, properties: any[], maintenanceRequests: any[]) => {
  console.log('🌱 Seeding notifications...');

  const batch = writeBatch(db);
  const notifications = [];

  const notificationTemplates = [
    {
      type: 'maintenance' as const,
      priority: 'medium' as const,
      title: 'Maintenance Request Update',
      message: 'Your maintenance request has been assigned to a technician.',
    },
    {
      type: 'payment' as const,
      priority: 'high' as const,
      title: 'Rent Payment Due',
      message: 'Your monthly rent payment is due in 3 days.',
    },
    {
      type: 'lease' as const,
      priority: 'medium' as const,
      title: 'Lease Renewal Notice',
      message: 'Your lease is expiring in 60 days. Please contact us to discuss renewal.',
    },
    {
      type: 'system' as const,
      priority: 'low' as const,
      title: 'System Maintenance',
      message: 'The property management portal will be under maintenance tonight.',
    },
    {
      type: 'general' as const,
      priority: 'low' as const,
      title: 'Welcome to the Platform',
      message: 'Welcome! Here are some tips to get started with your account.',
    },
  ];

  // Create notifications for all users
  const allUserIds = Object.values(userIds);
  for (const userId of allUserIds) {
    // Create 3-5 notifications per user
    const numNotifications = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numNotifications; i++) {
      const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
      const notificationId = generateId();
      const isRead = Math.random() < 0.6; // 60% chance of being read
      
      const notification = {
        id: notificationId,
        userId: userId as string,
        title: template.title,
        message: template.message,
        type: template.type,
        priority: template.priority,
        read: isRead,
        actionUrl: template.type === 'maintenance' ? `/maintenance` : undefined,
        data: template.type === 'maintenance' ? { requestId: maintenanceRequests[0]?.id } : undefined,
        createdAt: Timestamp.fromDate(randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())),
        readAt: isRead ? Timestamp.fromDate(randomDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), new Date())) : undefined,
      };

      notifications.push(notification);
      const docRef = doc(db, 'notifications', notificationId);
      batch.set(docRef, notification);
    }
  }

  await batch.commit();
  console.log(`✅ Created ${notifications.length} notifications`);
  return notifications;
};

export const seedInspections = async (userIds: any, properties: any[], units: any[]) => {
  console.log('🌱 Seeding inspections...');

  const batch = writeBatch(db);
  const inspections = [];

  const inspectionTypes = ['routine', 'move_in', 'move_out', 'special'];
  
  // Create inspections for random units
  for (let i = 0; i < 15; i++) {
    const unit = units[Math.floor(Math.random() * units.length)];
    const property = properties.find(p => p.id === unit.propertyId);
    const inspectionId = generateId();
    
    const type = inspectionTypes[Math.floor(Math.random() * inspectionTypes.length)];
    const scheduledDate = randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    const isCompleted = scheduledDate < new Date();
    
    const inspection = {
      id: inspectionId,
      propertyId: property.id,
      unitId: unit.id,
      type: type as any,
      performedBy: property.agentId,
      scheduledDate: Timestamp.fromDate(scheduledDate),
      completedDate: isCompleted ? Timestamp.fromDate(scheduledDate) : undefined,
      findings: isCompleted ? 'Unit is in good condition. Minor wear and tear noted. All systems functioning properly.' : '',
      photos: isCompleted ? ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'] : [],
      videos: [],
      issues: isCompleted ? [
        {
          description: 'Minor scuff on living room wall',
          severity: 'minor' as const,
          resolved: Math.random() < 0.7,
        },
        {
          description: 'Kitchen faucet drips occasionally',
          severity: 'moderate' as const,
          resolved: Math.random() < 0.5,
        }
      ].filter(() => Math.random() < 0.3) : [], // 30% chance of having issues
      tenantSignature: isCompleted && unit.isOccupied ? 'signed' : undefined,
      agentSignature: isCompleted ? 'signed' : undefined,
      createdAt: Timestamp.fromDate(new Date(scheduledDate.getTime() - 7 * 24 * 60 * 60 * 1000)),
    };

    inspections.push(inspection);
    const docRef = doc(db, 'inspections', inspectionId);
    batch.set(docRef, inspection);
  }

  await batch.commit();
  console.log(`✅ Created ${inspections.length} inspections`);
  return inspections;
};

export const seedAdvancedData = async (userIds: any, properties: any[], units: any[]) => {
  try {
    console.log('🌱 Starting advanced data seeding...');
    
    // Create leases first (needed for other data)
    const leases = await seedLeases(userIds, properties, units);
    
    // Create maintenance requests
    const maintenanceRequests = await seedMaintenanceRequests(userIds, properties, units, leases);
    
    // Create transactions
    const transactions = await seedTransactions(userIds, properties, leases);
    
    // Create notifications
    const notifications = await seedNotifications(userIds, properties, maintenanceRequests);
    
    // Create inspections
    const inspections = await seedInspections(userIds, properties, units);
    
    console.log('✅ Advanced data seeding completed!');
    console.log('\n📊 Advanced Data Summary:');
    console.log(`- Leases: ${leases.length}`);
    console.log(`- Maintenance Requests: ${maintenanceRequests.length}`);
    console.log(`- Transactions: ${transactions.length}`);
    console.log(`- Notifications: ${notifications.length}`);
    console.log(`- Inspections: ${inspections.length}`);

    return {
      leases,
      maintenanceRequests,
      transactions,
      notifications,
      inspections,
    };
  } catch (error) {
    console.error('❌ Advanced seeding failed:', error);
    throw error;
  }
};