import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auditHelpers } from '@/lib/security/audit-logger';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  subject: string;
  content: string;
  attachments?: string[];
  isRead: boolean;
  readAt?: Timestamp;
  parentMessageId?: string; // For replies
  messageType: 'message' | 'notification' | 'alert' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedResource?: {
    type: 'property' | 'unit' | 'tenant' | 'lease' | 'maintenance' | 'transaction';
    id: string;
    name: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: string;
  }[];
  subject: string;
  lastMessage: {
    content: string;
    senderId: string;
    timestamp: Timestamp;
  };
  messageCount: number;
  unreadCount: {
    [userId: string]: number;
  };
  relatedResource?: {
    type: string;
    id: string;
    name: string;
  };
  tags: string[];
  isArchived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const messagesCollection = collection(db, 'messages');
const conversationsCollection = collection(db, 'conversations');

// Create a new message
export const sendMessage = async (
  senderId: string,
  senderName: string,
  senderRole: string,
  recipientId: string,
  recipientName: string,
  recipientRole: string,
  subject: string,
  content: string,
  options: {
    conversationId?: string;
    parentMessageId?: string;
    messageType?: 'message' | 'notification' | 'alert' | 'reminder';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    relatedResource?: {
      type: 'property' | 'unit' | 'tenant' | 'lease' | 'maintenance' | 'transaction';
      id: string;
      name: string;
    };
    attachments?: string[];
  } = {}
): Promise<string> => {
  try {
    const messageData = {
      conversationId: options.conversationId || await createConversation(
        [{ id: senderId, name: senderName, role: senderRole }, { id: recipientId, name: recipientName, role: recipientRole }],
        subject,
        options.relatedResource
      ),
      senderId,
      senderName,
      senderRole,
      recipientId,
      recipientName,
      recipientRole,
      subject,
      content,
      attachments: options.attachments || [],
      isRead: false,
      parentMessageId: options.parentMessageId,
      messageType: options.messageType || 'message',
      priority: options.priority || 'medium',
      relatedResource: options.relatedResource,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(messagesCollection, messageData);
    
    // Update conversation
    if (messageData.conversationId) {
      await updateConversation(messageData.conversationId, {
        lastMessage: {
          content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          senderId,
          timestamp: serverTimestamp() as Timestamp,
        },
        updatedAt: serverTimestamp(),
      }, recipientId);
    }

    // Log audit event
    await auditHelpers.logDataExport(senderId, senderRole, 'message', {
      action: 'send',
      recipientId,
      messageType: options.messageType || 'message',
      subject
    });

    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Create a new conversation
export const createConversation = async (
  participants: { id: string; name: string; role: string }[],
  subject: string,
  relatedResource?: {
    type: string;
    id: string;
    name: string;
  }
): Promise<string> => {
  try {
    const conversationData = {
      participants,
      subject,
      lastMessage: {
        content: '',
        senderId: '',
        timestamp: serverTimestamp(),
      },
      messageCount: 0,
      unreadCount: participants.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}),
      relatedResource,
      tags: [],
      isArchived: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(conversationsCollection, conversationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Update conversation
const updateConversation = async (
  conversationId: string,
  updates: Partial<Conversation>,
  recipientId: string
) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    
    // Increment message count and unread count for recipient
    await updateDoc(conversationRef, {
      ...updates,
      messageCount: (updates.messageCount || 0) + 1,
      [`unreadCount.${recipientId}`]: arrayUnion(1),
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

// Get messages for a conversation
export const getConversationMessages = async (
  conversationId: string,
  pageSize: number = 50
): Promise<Message[]> => {
  try {
    let q = query(
      messagesCollection,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
};

// Get conversations for a user
export const getUserConversations = async (
  userId: string,
  includeArchived: boolean = false
): Promise<Conversation[]> => {
  try {
    let q = query(
      conversationsCollection,
      where('participants', 'array-contains', { id: userId }),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];
    
    querySnapshot.forEach((doc) => {
      const conversation = { id: doc.id, ...doc.data() } as Conversation;
      
      // Filter archived conversations if not requested
      if (!includeArchived && conversation.isArchived) return;
      
      conversations.push(conversation);
    });

    return conversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

// Mark message as read
export const markMessageAsRead = async (
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      isRead: true,
      readAt: serverTimestamp(),
    });

    // Update conversation unread count
    const messageDoc = await getDoc(messageRef);
    if (messageDoc.exists()) {
      const messageData = messageDoc.data() as Message;
      const conversationRef = doc(db, 'conversations', messageData.conversationId);
      
      // Decrement unread count for this user
      const conversationDoc = await getDoc(conversationRef);
      if (conversationDoc.exists()) {
        const conversationData = conversationDoc.data() as Conversation;
        const currentUnread = conversationData.unreadCount[userId] || 0;
        
        await updateDoc(conversationRef, {
          [`unreadCount.${userId}`]: Math.max(0, currentUnread - 1),
        });
      }
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Get unread message count for user
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const conversations = await getUserConversations(userId);
    return conversations.reduce((total, conv) => total + (conv.unreadCount[userId] || 0), 0);
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
};

// Search messages
export const searchMessages = async (
  userId: string,
  searchTerm: string,
  filters: {
    messageType?: string;
    priority?: string;
    dateFrom?: Date;
    dateTo?: Date;
  } = {}
): Promise<Message[]> => {
  try {
    // Get user's conversations first
    const conversations = await getUserConversations(userId, true);
    const conversationIds = conversations.map(c => c.id);
    
    if (conversationIds.length === 0) return [];

    // Search in messages from user's conversations
    const messages: Message[] = [];
    
    for (const conversationId of conversationIds) {
      const conversationMessages = await getConversationMessages(conversationId, 100);
      
      const filteredMessages = conversationMessages.filter(message => {
        // Text search
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
          message.subject.toLowerCase().includes(searchLower) ||
          message.content.toLowerCase().includes(searchLower) ||
          message.senderName.toLowerCase().includes(searchLower);
        
        // Filter by type
        const matchesType = !filters.messageType || message.messageType === filters.messageType;
        
        // Filter by priority
        const matchesPriority = !filters.priority || message.priority === filters.priority;
        
        // Filter by date
        const messageDate = message.createdAt.toDate();
        const matchesDateFrom = !filters.dateFrom || messageDate >= filters.dateFrom;
        const matchesDateTo = !filters.dateTo || messageDate <= filters.dateTo;
        
        return matchesSearch && matchesType && matchesPriority && matchesDateFrom && matchesDateTo;
      });
      
      messages.push(...filteredMessages);
    }

    // Sort by date (most recent first)
    return messages.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

// Archive conversation
export const archiveConversation = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      isArchived: true,
      updatedAt: serverTimestamp(),
    });

    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'conversation', {
      action: 'archive',
      conversationId
    });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
};

// Delete message (soft delete - mark as deleted)
export const deleteMessage = async (
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      content: '[Message deleted]',
      attachments: [],
      updatedAt: serverTimestamp(),
    });

    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'message', {
      action: 'delete',
      messageId
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Get message statistics
export const getMessageStatistics = async (userId: string) => {
  try {
    const conversations = await getUserConversations(userId, true);
    const totalUnread = await getUnreadMessageCount(userId);
    
    let totalMessages = 0;
    let messagesByType = { message: 0, notification: 0, alert: 0, reminder: 0 };
    let messagesByPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
    
    for (const conversation of conversations) {
      const messages = await getConversationMessages(conversation.id, 1000);
      totalMessages += messages.length;
      
      messages.forEach(message => {
        messagesByType[message.messageType]++;
        messagesByPriority[message.priority]++;
      });
    }

    return {
      totalConversations: conversations.length,
      archivedConversations: conversations.filter(c => c.isArchived).length,
      totalMessages,
      totalUnread,
      messagesByType,
      messagesByPriority,
    };
  } catch (error) {
    console.error('Error getting message statistics:', error);
    throw error;
  }
};

// Send automated messages
export const sendAutomatedMessage = async (
  recipientId: string,
  recipientName: string,
  recipientRole: string,
  template: {
    subject: string;
    content: string;
    type: 'notification' | 'alert' | 'reminder';
    priority: 'low' | 'medium' | 'high' | 'urgent';
  },
  relatedResource?: {
    type: 'property' | 'unit' | 'tenant' | 'lease' | 'maintenance' | 'transaction';
    id: string;
    name: string;
  }
): Promise<string> => {
  try {
    return await sendMessage(
      'system',
      'MMG System',
      'system',
      recipientId,
      recipientName,
      recipientRole,
      template.subject,
      template.content,
      {
        messageType: template.type,
        priority: template.priority,
        relatedResource,
      }
    );
  } catch (error) {
    console.error('Error sending automated message:', error);
    throw error;
  }
};
