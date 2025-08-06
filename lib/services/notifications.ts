import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getExpiringLeases, getExpiredLeases } from './leases';

export interface Notification {
  id: string;
  type: 'lease_expiring' | 'lease_expired' | 'payment_due' | 'maintenance_request';
  title: string;
  message: string;
  recipients: string[]; // user IDs
  relatedId?: string; // lease ID, tenant ID, maintenance request ID, etc.
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Timestamp;
  scheduledFor?: Timestamp;
  sent: boolean;
}

const notificationsCollection = collection(db, 'notifications');

// Create a notification
export const createNotification = async (
  notificationData: Omit<Notification, 'id' | 'createdAt' | 'read' | 'sent'>
): Promise<string> => {
  try {
    const docRef = await addDoc(notificationsCollection, {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false,
      sent: false,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const q = query(
      notificationsCollection,
      where('recipients', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification);
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'notifications', notificationId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Generate lease expiration notifications
export const generateLeaseExpirationNotifications = async (): Promise<void> => {
  try {
    // Get leases expiring in 30 days
    const expiringLeases = await getExpiringLeases(30);
    
    // Get leases expiring in 7 days
    const urgentExpiringLeases = await getExpiringLeases(7);
    
    // Get expired leases
    const expiredLeases = await getExpiredLeases();

    // Create notifications for leases expiring in 30 days
    for (const lease of expiringLeases) {
      const daysUntilExpiry = Math.ceil(
        (lease.dates.endDate.toDate().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 30 && daysUntilExpiry > 7) {
        await createNotification({
          type: 'lease_expiring',
          title: 'Lease Expiring Soon',
          message: `Lease for tenant ${lease.tenantId} expires in ${daysUntilExpiry} days (${lease.dates.endDate.toDate().toLocaleDateString()})`,
          recipients: ['admin', 'owner', 'agent'], // This should be actual user IDs
          relatedId: lease.id,
          priority: 'medium',
        });
      }
    }

    // Create urgent notifications for leases expiring in 7 days
    for (const lease of urgentExpiringLeases) {
      const daysUntilExpiry = Math.ceil(
        (lease.dates.endDate.toDate().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        await createNotification({
          type: 'lease_expiring',
          title: 'Urgent: Lease Expiring Very Soon',
          message: `URGENT: Lease for tenant ${lease.tenantId} expires in ${daysUntilExpiry} days (${lease.dates.endDate.toDate().toLocaleDateString()})`,
          recipients: ['admin', 'owner', 'agent'],
          relatedId: lease.id,
          priority: 'high',
        });
      }
    }

    // Create notifications for expired leases
    for (const lease of expiredLeases) {
      const daysOverdue = Math.ceil(
        (new Date().getTime() - lease.dates.endDate.toDate().getTime()) / (1000 * 60 * 60 * 24)
      );

      await createNotification({
        type: 'lease_expired',
        title: 'Lease Expired',
        message: `Lease for tenant ${lease.tenantId} expired ${daysOverdue} days ago (${lease.dates.endDate.toDate().toLocaleDateString()})`,
        recipients: ['admin', 'owner', 'agent'],
        relatedId: lease.id,
        priority: 'high',
      });
    }
  } catch (error) {
    console.error('Error generating lease expiration notifications:', error);
    throw error;
  }
};

// Generate payment due notifications
export const generatePaymentDueNotifications = async (): Promise<void> => {
  try {
    // This would integrate with the payment system
    // For now, it's a placeholder
    console.log('Payment due notifications will be implemented with payment tracking');
  } catch (error) {
    console.error('Error generating payment due notifications:', error);
    throw error;
  }
};

// Generate maintenance request notifications
export const generateMaintenanceNotifications = async (): Promise<void> => {
  try {
    // Import maintenance functions
    const { getPendingRequests, getOverdueRequests, getAssignedRequests } = await import('./maintenance');
    
    // Get pending requests (unassigned)
    const pendingRequests = await getPendingRequests();
    
    // Get overdue requests
    const overdueRequests = await getOverdueRequests();
    
    // Create notifications for new pending requests
    for (const request of pendingRequests) {
      // Check if notification already exists for this request
      // In production, you'd store notification state to avoid duplicates
      
      await createNotification({
        type: 'maintenance_request',
        title: 'New Maintenance Request',
        message: `New ${request.priority} priority ${request.category} request: ${request.title}`,
        recipients: ['admin', 'agent'], // This should be actual user IDs
        relatedId: request.id,
        priority: request.priority === 'emergency' ? 'high' : 'medium',
      });
    }
    
    // Create notifications for overdue requests
    for (const request of overdueRequests) {
      const hoursOverdue = request.assignedAt ? 
        Math.ceil((new Date().getTime() - request.assignedAt.toDate().getTime()) / (1000 * 60 * 60)) : 0;
      
      await createNotification({
        type: 'maintenance_request',
        title: 'Overdue Maintenance Request',
        message: `Maintenance request "${request.title}" is overdue by ${hoursOverdue} hours`,
        recipients: request.assignedTo ? [request.assignedTo, 'admin'] : ['admin'],
        relatedId: request.id,
        priority: 'high',
      });
    }
    
    // Create notifications for high priority requests assigned more than 4 hours ago
    const highPriorityRequests = await getAssignedRequests('all'); // This would need to be updated
    
    console.log(`Generated notifications for ${pendingRequests.length} pending and ${overdueRequests.length} overdue maintenance requests`);
  } catch (error) {
    console.error('Error generating maintenance notifications:', error);
    throw error;
  }
};

// Run all notification generators
export const runNotificationSystem = async (): Promise<void> => {
  try {
    console.log('Running notification system...');
    
    await generateLeaseExpirationNotifications();
    await generatePaymentDueNotifications();
    await generateMaintenanceNotifications();
    
    console.log('Notification system completed successfully');
  } catch (error) {
    console.error('Error running notification system:', error);
    throw error;
  }
};

// Get notification statistics
export const getNotificationStats = async (userId: string) => {
  try {
    const notifications = await getUserNotifications(userId);
    
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      high_priority: notifications.filter(n => n.priority === 'high' && !n.read).length,
      lease_expiring: notifications.filter(n => n.type === 'lease_expiring' && !n.read).length,
      lease_expired: notifications.filter(n => n.type === 'lease_expired' && !n.read).length,
    };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    throw error;
  }
};

// Schedule notifications (for cron jobs or scheduled tasks)
export const scheduleNotifications = async (): Promise<void> => {
  try {
    // This could be called by a cron job or scheduled task
    // For now, we'll run it immediately
    await runNotificationSystem();
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    throw error;
  }
};

// Clean up old notifications (older than 90 days)
export const cleanupOldNotifications = async (): Promise<void> => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const q = query(
      notificationsCollection,
      where('createdAt', '<', Timestamp.fromDate(ninetyDaysAgo))
    );
    
    const querySnapshot = await getDocs(q);
    
    // In a real implementation, you'd batch delete these
    // For now, we'll just log the count
    console.log(`Found ${querySnapshot.docs.length} old notifications to clean up`);
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    throw error;
  }
};