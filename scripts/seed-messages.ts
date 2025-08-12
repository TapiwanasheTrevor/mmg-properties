import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../lib/firebase-config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedMessages() {
  console.log('🌱 Starting to seed messages...');

  try {
    // Sample conversations
    const conversations = [
      {
        id: 'conv_1',
        title: 'Unit A-101 Maintenance Issue',
        type: 'maintenance',
        description: 'Discussion about plumbing repair in Unit A-101',
        participants: {
          'admin_user': {
            name: 'Admin User',
            email: 'admin@mmg.com',
            role: 'admin',
            isOnline: true,
            joinedAt: serverTimestamp()
          },
          'tenant_1': {
            name: 'John Doe',
            email: 'john.doe@email.com',
            role: 'tenant',
            isOnline: false,
            joinedAt: serverTimestamp()
          },
          'agent_1': {
            name: 'Sarah Agent',
            email: 'sarah@mmg.com',
            role: 'agent',
            isOnline: true,
            joinedAt: serverTimestamp()
          }
        },
        createdBy: 'tenant_1',
        propertyId: 'prop_1',
        propertyName: 'Sunset Apartments',
        unitId: 'unit_a101',
        unitNumber: 'A-101',
        maintenanceRequestId: 'maint_001',
        lastMessage: {
          id: 'msg_3',
          content: 'The plumber will arrive tomorrow at 2 PM',
          senderId: 'agent_1',
          senderName: 'Sarah Agent',
          createdAt: serverTimestamp()
        },
        lastActivityAt: serverTimestamp(),
        settings: {
          'admin_user': { isArchived: false, isMuted: false, isPinned: false },
          'tenant_1': { isArchived: false, isMuted: false, isPinned: true },
          'agent_1': { isArchived: false, isMuted: false, isPinned: false }
        },
        messageCount: 3,
        unreadCount: {
          'admin_user': 0,
          'tenant_1': 1,
          'agent_1': 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'conv_2',
        title: 'Lease Renewal Discussion',
        type: 'direct',
        description: 'Discussing lease renewal terms',
        participants: {
          'owner_1': {
            name: 'Property Owner',
            email: 'owner@mmg.com',
            role: 'owner',
            isOnline: false,
            joinedAt: serverTimestamp()
          },
          'tenant_2': {
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            role: 'tenant',
            isOnline: true,
            joinedAt: serverTimestamp()
          }
        },
        createdBy: 'owner_1',
        propertyId: 'prop_2',
        propertyName: 'Downtown Complex',
        unitId: 'unit_b205',
        unitNumber: 'B-205',
        lastMessage: {
          id: 'msg_6',
          content: 'I would like to renew for another year',
          senderId: 'tenant_2',
          senderName: 'Jane Smith',
          createdAt: serverTimestamp()
        },
        lastActivityAt: serverTimestamp(),
        settings: {
          'owner_1': { isArchived: false, isMuted: false, isPinned: true },
          'tenant_2': { isArchived: false, isMuted: false, isPinned: false }
        },
        messageCount: 4,
        unreadCount: {
          'owner_1': 1,
          'tenant_2': 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'conv_3',
        title: 'Property Management Updates',
        type: 'group',
        description: 'Monthly updates for all tenants',
        participants: {
          'admin_user': {
            name: 'Admin User',
            email: 'admin@mmg.com',
            role: 'admin',
            isOnline: true,
            joinedAt: serverTimestamp()
          },
          'tenant_1': {
            name: 'John Doe',
            email: 'john.doe@email.com',
            role: 'tenant',
            isOnline: false,
            joinedAt: serverTimestamp()
          },
          'tenant_2': {
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            role: 'tenant',
            isOnline: true,
            joinedAt: serverTimestamp()
          },
          'tenant_3': {
            name: 'Mike Johnson',
            email: 'mike.johnson@email.com',
            role: 'tenant',
            isOnline: false,
            joinedAt: serverTimestamp()
          }
        },
        createdBy: 'admin_user',
        propertyId: 'prop_1',
        propertyName: 'Sunset Apartments',
        lastMessage: {
          id: 'msg_8',
          content: 'Reminder: Monthly community meeting is this Friday at 6 PM',
          senderId: 'admin_user',
          senderName: 'Admin User',
          createdAt: serverTimestamp()
        },
        lastActivityAt: serverTimestamp(),
        settings: {
          'admin_user': { isArchived: false, isMuted: false, isPinned: false },
          'tenant_1': { isArchived: false, isMuted: false, isPinned: false },
          'tenant_2': { isArchived: false, isMuted: false, isPinned: false },
          'tenant_3': { isArchived: false, isMuted: true, isPinned: false }
        },
        messageCount: 2,
        unreadCount: {
          'admin_user': 0,
          'tenant_1': 2,
          'tenant_2': 1,
          'tenant_3': 2
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Sample messages
    const messages = [
      // Conversation 1 messages
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        content: 'Hi, there is a leak in my bathroom sink that needs urgent attention.',
        type: 'maintenance_request',
        priority: 'high',
        senderId: 'tenant_1',
        senderName: 'John Doe',
        senderRole: 'tenant',
        recipients: {
          'admin_user': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() },
          'agent_1': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() },
          'tenant_1': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() }
        },
        threadCount: 0,
        attachments: [],
        mentions: ['admin_user', 'agent_1'],
        propertyId: 'prop_1',
        propertyName: 'Sunset Apartments',
        unitId: 'unit_a101',
        unitNumber: 'A-101',
        maintenanceRequestId: 'maint_001',
        isEdited: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reactions: {}
      },
      {
        id: 'msg_2',
        conversationId: 'conv_1',
        content: 'Thank you for reporting this. I will send our maintenance team to assess the issue.',
        type: 'direct',
        priority: 'medium',
        senderId: 'admin_user',
        senderName: 'Admin User',
        senderRole: 'admin',
        recipients: {
          'admin_user': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() },
          'agent_1': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() },
          'tenant_1': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() }
        },
        parentMessageId: 'msg_1',
        threadCount: 0,
        attachments: [],
        mentions: [],
        propertyId: 'prop_1',
        propertyName: 'Sunset Apartments',
        unitId: 'unit_a101',
        unitNumber: 'A-101',
        maintenanceRequestId: 'maint_001',
        isEdited: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reactions: {}
      },
      {
        id: 'msg_3',
        conversationId: 'conv_1',
        content: 'The plumber will arrive tomorrow at 2 PM. Please ensure someone is available to provide access.',
        type: 'direct',
        priority: 'medium',
        senderId: 'agent_1',
        senderName: 'Sarah Agent',
        senderRole: 'agent',
        recipients: {
          'admin_user': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() },
          'agent_1': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() },
          'tenant_1': { status: 'sent', deliveredAt: serverTimestamp() }
        },
        threadCount: 0,
        attachments: [],
        mentions: ['tenant_1'],
        propertyId: 'prop_1',
        propertyName: 'Sunset Apartments',
        unitId: 'unit_a101',
        unitNumber: 'A-101',
        maintenanceRequestId: 'maint_001',
        isEdited: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reactions: {}
      },
      // Conversation 2 messages
      {
        id: 'msg_4',
        conversationId: 'conv_2',
        content: 'Hi Jane, your lease is coming up for renewal. Would you like to discuss the terms?',
        type: 'direct',
        priority: 'medium',
        senderId: 'owner_1',
        senderName: 'Property Owner',
        senderRole: 'owner',
        recipients: {
          'owner_1': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() },
          'tenant_2': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() }
        },
        threadCount: 0,
        attachments: [],
        mentions: [],
        propertyId: 'prop_2',
        propertyName: 'Downtown Complex',
        unitId: 'unit_b205',
        unitNumber: 'B-205',
        isEdited: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reactions: {}
      },
      {
        id: 'msg_5',
        conversationId: 'conv_2',
        content: 'Yes, I am very happy with the apartment and would like to stay.',
        type: 'direct',
        priority: 'medium',
        senderId: 'tenant_2',
        senderName: 'Jane Smith',
        senderRole: 'tenant',
        recipients: {
          'owner_1': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() },
          'tenant_2': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() }
        },
        parentMessageId: 'msg_4',
        threadCount: 0,
        attachments: [],
        mentions: [],
        propertyId: 'prop_2',
        propertyName: 'Downtown Complex',
        unitId: 'unit_b205',
        unitNumber: 'B-205',
        isEdited: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reactions: {}
      },
      {
        id: 'msg_6',
        conversationId: 'conv_2',
        content: 'I would like to renew for another year. Are there any changes to the rent?',
        type: 'direct',
        priority: 'medium',
        senderId: 'tenant_2',
        senderName: 'Jane Smith',
        senderRole: 'tenant',
        recipients: {
          'owner_1': { status: 'sent', deliveredAt: serverTimestamp() },
          'tenant_2': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() }
        },
        threadCount: 0,
        attachments: [],
        mentions: [],
        propertyId: 'prop_2',
        propertyName: 'Downtown Complex',
        unitId: 'unit_b205',
        unitNumber: 'B-205',
        isEdited: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reactions: {}
      },
      // Conversation 3 messages
      {
        id: 'msg_7',
        conversationId: 'conv_3',
        content: 'Hello everyone! This is your monthly property management update. We have several announcements to share.',
        type: 'announcement',
        priority: 'medium',
        senderId: 'admin_user',
        senderName: 'Admin User',
        senderRole: 'admin',
        recipients: {
          'admin_user': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() },
          'tenant_1': { status: 'sent', deliveredAt: serverTimestamp() },
          'tenant_2': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() },
          'tenant_3': { status: 'sent', deliveredAt: serverTimestamp() }
        },
        threadCount: 0,
        attachments: [],
        mentions: [],
        propertyId: 'prop_1',
        propertyName: 'Sunset Apartments',
        isEdited: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reactions: {}
      },
      {
        id: 'msg_8',
        conversationId: 'conv_3',
        content: 'Reminder: Monthly community meeting is this Friday at 6 PM in the community room. We will discuss upcoming maintenance and building improvements.',
        type: 'reminder',
        priority: 'medium',
        senderId: 'admin_user',
        senderName: 'Admin User',
        senderRole: 'admin',
        recipients: {
          'admin_user': { status: 'read', deliveredAt: serverTimestamp(), readAt: serverTimestamp() },
          'tenant_1': { status: 'sent', deliveredAt: serverTimestamp() },
          'tenant_2': { status: 'sent', deliveredAt: serverTimestamp() },
          'tenant_3': { status: 'sent', deliveredAt: serverTimestamp() }
        },
        threadCount: 0,
        attachments: [],
        mentions: ['tenant_1', 'tenant_2', 'tenant_3'],
        propertyId: 'prop_1',
        propertyName: 'Sunset Apartments',
        isEdited: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reactions: {}
      }
    ];

    // Seed conversations
    console.log('📝 Creating conversations...');
    for (const conversation of conversations) {
      await setDoc(doc(collection(db, 'conversations'), conversation.id), conversation);
      console.log(`✅ Created conversation: ${conversation.title}`);
    }

    // Seed messages
    console.log('💬 Creating messages...');
    for (const message of messages) {
      await setDoc(doc(collection(db, 'messages'), message.id), message);
      console.log(`✅ Created message: ${message.id}`);
    }

    // Create some sample notifications
    const notifications = [
      {
        id: 'notif_1',
        userId: 'tenant_1',
        messageId: 'msg_3',
        conversationId: 'conv_1',
        type: 'new_message',
        title: 'New message from Sarah Agent',
        body: 'The plumber will arrive tomorrow at 2 PM',
        data: {
          senderId: 'agent_1',
          senderName: 'Sarah Agent',
          conversationId: 'conv_1'
        },
        isRead: false,
        createdAt: serverTimestamp()
      },
      {
        id: 'notif_2',
        userId: 'owner_1',
        messageId: 'msg_6',
        conversationId: 'conv_2',
        type: 'new_message',
        title: 'New message from Jane Smith',
        body: 'I would like to renew for another year',
        data: {
          senderId: 'tenant_2',
          senderName: 'Jane Smith',
          conversationId: 'conv_2'
        },
        isRead: false,
        createdAt: serverTimestamp()
      }
    ];

    console.log('🔔 Creating notifications...');
    for (const notification of notifications) {
      await setDoc(doc(collection(db, 'notifications'), notification.id), notification);
      console.log(`✅ Created notification: ${notification.id}`);
    }

    console.log('🎉 Messages seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${conversations.length} conversations created`);
    console.log(`   - ${messages.length} messages created`);
    console.log(`   - ${notifications.length} notifications created`);
    
  } catch (error) {
    console.error('❌ Error seeding messages:', error);
    throw error;
  }
}

// Run the seeder
if (require.main === module) {
  seedMessages()
    .then(() => {
      console.log('✅ Message seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Message seeding failed:', error);
      process.exit(1);
    });
}

export { seedMessages };