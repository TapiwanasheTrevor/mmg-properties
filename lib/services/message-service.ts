import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { 
  Message, 
  Conversation, 
  MessageAttachment, 
  MessageNotification,
  FirestoreMessage,
  FirestoreConversation,
  MessageFilter,
  TypingIndicator,
  MessageDraft
} from '@/lib/types/messages';

export class MessageService {
  // Collections
  private messagesCollection = collection(db, 'messages');
  private conversationsCollection = collection(db, 'conversations');
  private notificationsCollection = collection(db, 'notifications');
  private typingCollection = collection(db, 'typing');
  private draftsCollection = collection(db, 'drafts');

  // Conversations CRUD
  async createConversation(
    title: string,
    type: 'direct' | 'group' | 'property' | 'maintenance',
    participants: string[],
    createdBy: string,
    options?: {
      description?: string;
      propertyId?: string;
      propertyName?: string;
      unitId?: string;
      unitNumber?: string;
      maintenanceRequestId?: string;
    }
  ): Promise<string> {
    try {
      // Create participant objects
      const participantData: Record<string, any> = {};
      for (const participantId of participants) {
        participantData[participantId] = {
          name: 'User Name', // Should be fetched from user service
          email: 'user@example.com',
          role: 'tenant',
          isOnline: false,
          joinedAt: serverTimestamp()
        };
      }

      const conversationData: Omit<FirestoreConversation, 'id'> = {
        title,
        type,
        description: options?.description,
        participants: participantData,
        createdBy,
        propertyId: options?.propertyId,
        propertyName: options?.propertyName,
        unitId: options?.unitId,
        unitNumber: options?.unitNumber,
        maintenanceRequestId: options?.maintenanceRequestId,
        lastActivityAt: serverTimestamp(),
        settings: {},
        messageCount: 0,
        unreadCount: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Initialize settings and unread counts for all participants
      participants.forEach(participantId => {
        conversationData.settings[participantId] = {
          isArchived: false,
          isMuted: false,
          isPinned: false
        };
        conversationData.unreadCount[participantId] = 0;
      });

      const docRef = await addDoc(this.conversationsCollection, conversationData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  async updateConversation(conversationId: string, updates: Partial<FirestoreConversation>): Promise<void> {
    try {
      const conversationRef = doc(this.conversationsCollection, conversationId);
      await updateDoc(conversationRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw new Error('Failed to update conversation');
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete conversation
      const conversationRef = doc(this.conversationsCollection, conversationId);
      batch.delete(conversationRef);
      
      // Delete all messages in conversation
      const messagesQuery = query(
        this.messagesCollection, 
        where('conversationId', '==', conversationId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }

  // Messages CRUD
  async sendMessage(
    conversationId: string,
    content: string,
    senderId: string,
    senderName: string,
    senderRole: string,
    options?: {
      type?: string;
      priority?: string;
      attachments?: MessageAttachment[];
      mentions?: string[];
      replyToMessageId?: string;
      propertyId?: string;
      propertyName?: string;
      unitId?: string;
      unitNumber?: string;
      maintenanceRequestId?: string;
    }
  ): Promise<string> {
    try {
      const batch = writeBatch(db);

      // Get conversation to get recipients
      const conversationRef = doc(this.conversationsCollection, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error('Conversation not found');
      }

      const conversation = conversationDoc.data() as FirestoreConversation;
      const participants = Object.keys(conversation.participants);
      
      // Create recipient statuses
      const recipients: Record<string, any> = {};
      participants.forEach(participantId => {
        recipients[participantId] = {
          status: participantId === senderId ? 'read' : 'sent',
          deliveredAt: serverTimestamp(),
          readAt: participantId === senderId ? serverTimestamp() : null
        };
      });

      // Create message
      const messageData: Omit<FirestoreMessage, 'id'> = {
        conversationId,
        content,
        type: (options?.type as any) || 'direct',
        priority: (options?.priority as any) || 'medium',
        senderId,
        senderName,
        senderRole,
        recipients,
        parentMessageId: options?.replyToMessageId,
        replyToMessageId: options?.replyToMessageId,
        threadCount: 0,
        attachments: options?.attachments || [],
        mentions: options?.mentions || [],
        propertyId: options?.propertyId,
        propertyName: options?.propertyName,
        unitId: options?.unitId,
        unitNumber: options?.unitNumber,
        maintenanceRequestId: options?.maintenanceRequestId,
        isEdited: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reactions: {}
      };

      const messageRef = doc(this.messagesCollection);
      batch.set(messageRef, messageData);

      // Update conversation
      batch.update(conversationRef, {
        lastMessage: {
          id: messageRef.id,
          content: content.substring(0, 100),
          senderId,
          senderName,
          createdAt: serverTimestamp()
        },
        lastActivityAt: serverTimestamp(),
        messageCount: increment(1),
        [`unreadCount.${senderId}`]: 0, // Reset sender's unread count
        updatedAt: serverTimestamp()
      });

      // Increment unread count for other participants
      participants.forEach(participantId => {
        if (participantId !== senderId) {
          batch.update(conversationRef, {
            [`unreadCount.${participantId}`]: increment(1)
          });
        }
      });

      await batch.commit();

      // Send notifications to other participants
      this.sendMessageNotifications(messageRef.id, conversationId, content, senderId, senderName, participants.filter(p => p !== senderId));

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  async editMessage(messageId: string, newContent: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(this.messagesCollection, messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }
      
      const message = messageDoc.data() as FirestoreMessage;
      
      if (message.senderId !== userId) {
        throw new Error('Unauthorized to edit this message');
      }

      await updateDoc(messageRef, {
        content: newContent,
        isEdited: true,
        editedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error editing message:', error);
      throw new Error('Failed to edit message');
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(this.messagesCollection, messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }
      
      const message = messageDoc.data() as FirestoreMessage;
      
      if (message.senderId !== userId) {
        throw new Error('Unauthorized to delete this message');
      }

      await updateDoc(messageRef, {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        content: '[Message deleted]',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(this.messagesCollection, messageId);
      await updateDoc(messageRef, {
        [`recipients.${userId}.status`]: 'read',
        [`recipients.${userId}.readAt`]: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new Error('Failed to mark message as read');
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Reset unread count
      const conversationRef = doc(this.conversationsCollection, conversationId);
      batch.update(conversationRef, {
        [`unreadCount.${userId}`]: 0,
        [`participants.${userId}.lastReadAt`]: serverTimestamp()
      });
      
      // Mark all unread messages as read
      const messagesQuery = query(
        this.messagesCollection,
        where('conversationId', '==', conversationId),
        where(`recipients.${userId}.status`, '!=', 'read')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      messagesSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          [`recipients.${userId}.status`]: 'read',
          [`recipients.${userId}.readAt`]: serverTimestamp()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw new Error('Failed to mark conversation as read');
    }
  }

  // File upload
  async uploadAttachment(file: File, conversationId: string, userId: string): Promise<MessageAttachment> {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `messages/${conversationId}/${fileName}`;
      const fileRef = ref(storage, filePath);
      
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const attachment: MessageAttachment = {
        id: fileName,
        name: file.name,
        type: this.getAttachmentType(file.type),
        size: file.size,
        url: downloadURL,
        mimeType: file.type,
        uploadedAt: new Date(),
        uploadedBy: userId
      };
      
      return attachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw new Error('Failed to upload attachment');
    }
  }

  private getAttachmentType(mimeType: string): 'image' | 'document' | 'video' | 'audio' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  // Real-time listeners
  subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void): () => void {
    const conversationsQuery = query(
      this.conversationsCollection,
      where(`participants.${userId}`, '!=', null),
      orderBy('lastActivityAt', 'desc')
    );
    
    return onSnapshot(conversationsQuery, (snapshot) => {
      const conversations: Conversation[] = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreConversation;
        return this.convertFirestoreConversation(doc.id, data);
      });
      callback(conversations);
    });
  }

  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
    const messagesQuery = query(
      this.messagesCollection,
      where('conversationId', '==', conversationId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(messagesQuery, (snapshot) => {
      const messages: Message[] = snapshot.docs.map(doc => {
        const data = doc.data() as FirestoreMessage;
        return this.convertFirestoreMessage(doc.id, data);
      });
      callback(messages);
    });
  }

  // Typing indicators
  async setTyping(conversationId: string, userId: string, userName: string, isTyping: boolean): Promise<void> {
    try {
      const typingRef = doc(this.typingCollection, `${conversationId}_${userId}`);
      
      if (isTyping) {
        await updateDoc(typingRef, {
          conversationId,
          userId,
          userName,
          timestamp: serverTimestamp()
        });
      } else {
        await deleteDoc(typingRef);
      }
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  }

  subscribeToTyping(conversationId: string, callback: (typing: TypingIndicator[]) => void): () => void {
    const typingQuery = query(
      this.typingCollection,
      where('conversationId', '==', conversationId)
    );
    
    return onSnapshot(typingQuery, (snapshot) => {
      const typingIndicators: TypingIndicator[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          conversationId: data.conversationId,
          userId: data.userId,
          userName: data.userName,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });
      callback(typingIndicators);
    });
  }

  // Notifications
  private async sendMessageNotifications(
    messageId: string,
    conversationId: string,
    content: string,
    senderId: string,
    senderName: string,
    recipients: string[]
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      recipients.forEach(recipientId => {
        const notificationRef = doc(this.notificationsCollection);
        batch.set(notificationRef, {
          userId: recipientId,
          messageId,
          conversationId,
          type: 'new_message',
          title: `New message from ${senderName}`,
          body: content.substring(0, 100),
          data: {
            senderId,
            senderName,
            conversationId
          },
          isRead: false,
          createdAt: serverTimestamp()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  // Data conversion helpers
  private convertFirestoreMessage(id: string, data: FirestoreMessage): Message {
    return {
      id,
      conversationId: data.conversationId,
      content: data.content,
      type: data.type,
      priority: data.priority,
      senderId: data.senderId,
      senderName: data.senderName,
      senderRole: data.senderRole,
      recipients: Object.entries(data.recipients).map(([userId, status]) => ({
        id: userId,
        status: status.status,
        readAt: status.readAt?.toDate(),
        deliveredAt: status.deliveredAt?.toDate()
      })),
      parentMessageId: data.parentMessageId,
      replyToMessageId: data.replyToMessageId,
      threadCount: data.threadCount,
      attachments: data.attachments,
      mentions: data.mentions,
      propertyId: data.propertyId,
      propertyName: data.propertyName,
      unitId: data.unitId,
      unitNumber: data.unitNumber,
      maintenanceRequestId: data.maintenanceRequestId,
      isEdited: data.isEdited,
      editedAt: data.editedAt?.toDate(),
      isDeleted: data.isDeleted,
      deletedAt: data.deletedAt?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      reactions: Object.values(data.reactions || {}).map(reaction => ({
        emoji: reaction.emoji,
        userId: reaction.userId,
        userName: reaction.userName,
        createdAt: reaction.createdAt?.toDate() || new Date()
      }))
    };
  }

  private convertFirestoreConversation(id: string, data: FirestoreConversation): Conversation {
    return {
      id,
      title: data.title,
      type: data.type,
      description: data.description,
      participants: Object.entries(data.participants).map(([userId, participant]) => ({
        id: userId,
        name: participant.name,
        email: participant.email,
        role: participant.role,
        avatar: participant.avatar,
        lastReadAt: participant.lastReadAt?.toDate(),
        isOnline: participant.isOnline
      })),
      createdBy: data.createdBy,
      propertyId: data.propertyId,
      propertyName: data.propertyName,
      unitId: data.unitId,
      unitNumber: data.unitNumber,
      maintenanceRequestId: data.maintenanceRequestId,
      lastMessage: data.lastMessage ? {
        id: data.lastMessage.id,
        content: data.lastMessage.content,
        senderId: data.lastMessage.senderId,
        senderName: data.lastMessage.senderName,
        createdAt: data.lastMessage.createdAt?.toDate() || new Date()
      } : undefined,
      lastActivityAt: data.lastActivityAt?.toDate() || new Date(),
      isArchived: false, // This would come from user-specific settings
      isMuted: false,
      isPinned: false,
      messageCount: data.messageCount,
      unreadCount: data.unreadCount,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }
}

export const messageService = new MessageService();