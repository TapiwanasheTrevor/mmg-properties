export type MessageType = 
  | 'direct' 
  | 'group' 
  | 'announcement' 
  | 'maintenance_request' 
  | 'complaint' 
  | 'inquiry' 
  | 'notification';

export type MessageStatus = 
  | 'sent' 
  | 'delivered' 
  | 'read' 
  | 'failed';

export type MessagePriority = 'low' | 'medium' | 'high' | 'urgent';

export type AttachmentType = 
  | 'image' 
  | 'document' 
  | 'video' 
  | 'audio';

export interface MessageAttachment {
  id: string;
  name: string;
  type: AttachmentType;
  size: number;
  url: string;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface MessageParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  lastReadAt?: Date;
  isOnline: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  priority: MessagePriority;
  
  // Sender info
  senderId: string;
  senderName: string;
  senderRole: string;
  
  // Recipients
  recipients: {
    id: string;
    status: MessageStatus;
    readAt?: Date;
    deliveredAt?: Date;
  }[];
  
  // Threading
  parentMessageId?: string;
  replyToMessageId?: string;
  threadCount: number;
  
  // Content
  attachments: MessageAttachment[];
  mentions: string[]; // user IDs mentioned in message
  
  // Context
  propertyId?: string;
  propertyName?: string;
  unitId?: string;
  unitNumber?: string;
  maintenanceRequestId?: string;
  
  // Metadata
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Reactions
  reactions: {
    emoji: string;
    userId: string;
    userName: string;
    createdAt: Date;
  }[];
}

export interface Conversation {
  id: string;
  title: string;
  type: 'direct' | 'group' | 'property' | 'maintenance';
  description?: string;
  
  // Participants
  participants: MessageParticipant[];
  createdBy: string;
  
  // Context
  propertyId?: string;
  propertyName?: string;
  unitId?: string;
  unitNumber?: string;
  maintenanceRequestId?: string;
  
  // Latest activity
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: Date;
  };
  lastActivityAt: Date;
  
  // Settings
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  
  // Counts
  messageCount: number;
  unreadCount: Record<string, number>; // userId -> unread count
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageNotification {
  id: string;
  userId: string;
  messageId: string;
  conversationId: string;
  type: 'new_message' | 'mention' | 'reply' | 'reaction';
  title: string;
  body: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface MessageFilter {
  conversations: string[];
  participants: string[];
  types: MessageType[];
  priorities: MessagePriority[];
  properties: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  hasAttachments?: boolean;
  isUnread?: boolean;
  searchQuery?: string;
}

export interface MessageDraft {
  id: string;
  conversationId: string;
  content: string;
  attachments: MessageAttachment[];
  mentions: string[];
  replyToMessageId?: string;
  lastSaved: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface MessageMetrics {
  totalMessages: number;
  unreadMessages: number;
  conversationsCount: number;
  responseTime: number; // average response time in minutes
  messagesByType: Record<MessageType, number>;
  messagesByPriority: Record<MessagePriority, number>;
  dailyMessageCount: { date: string; count: number }[];
  topContacts: {
    userId: string;
    userName: string;
    messageCount: number;
    lastMessageAt: Date;
  }[];
}

// Firebase Firestore structure
export interface FirestoreMessage {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  priority: MessagePriority;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipients: {
    [userId: string]: {
      status: MessageStatus;
      readAt?: any; // Firestore Timestamp
      deliveredAt?: any; // Firestore Timestamp
    };
  };
  parentMessageId?: string;
  replyToMessageId?: string;
  threadCount: number;
  attachments: MessageAttachment[];
  mentions: string[];
  propertyId?: string;
  propertyName?: string;
  unitId?: string;
  unitNumber?: string;
  maintenanceRequestId?: string;
  isEdited: boolean;
  editedAt?: any; // Firestore Timestamp
  isDeleted: boolean;
  deletedAt?: any; // Firestore Timestamp
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  reactions: {
    [reactionId: string]: {
      emoji: string;
      userId: string;
      userName: string;
      createdAt: any; // Firestore Timestamp
    };
  };
}

export interface FirestoreConversation {
  id: string;
  title: string;
  type: 'direct' | 'group' | 'property' | 'maintenance';
  description?: string;
  participants: {
    [userId: string]: {
      name: string;
      email: string;
      role: string;
      avatar?: string;
      lastReadAt?: any; // Firestore Timestamp
      isOnline: boolean;
      joinedAt: any; // Firestore Timestamp
    };
  };
  createdBy: string;
  propertyId?: string;
  propertyName?: string;
  unitId?: string;
  unitNumber?: string;
  maintenanceRequestId?: string;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: any; // Firestore Timestamp
  };
  lastActivityAt: any; // Firestore Timestamp
  settings: {
    [userId: string]: {
      isArchived: boolean;
      isMuted: boolean;
      isPinned: boolean;
    };
  };
  messageCount: number;
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

// Real-time events
export interface MessageEvent {
  type: 'message_sent' | 'message_read' | 'typing_start' | 'typing_stop' | 'user_online' | 'user_offline';
  conversationId: string;
  userId: string;
  data: any;
  timestamp: Date;
}