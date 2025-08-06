'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send,
  Plus,
  Search,
  Archive,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building,
  Bell,
  Mail,
  Reply,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Message, 
  Conversation, 
  sendMessage, 
  getUserConversations, 
  getConversationMessages,
  markMessageAsRead,
  getUnreadMessageCount,
  searchMessages,
  archiveConversation,
  deleteMessage
} from '@/lib/services/messages';

export default function MessageCenter() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  
  // Compose message state
  const [composeData, setComposeData] = useState({
    recipientId: '',
    recipientName: '',
    recipientRole: '',
    subject: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    messageType: 'message' as 'message' | 'notification' | 'alert' | 'reminder',
  });

  useEffect(() => {
    if (user) {
      loadConversations();
      loadUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userConversations = await getUserConversations(user.id);
      setConversations(userConversations);
      
      // Auto-select first conversation if none selected
      if (!selectedConversation && userConversations.length > 0) {
        setSelectedConversation(userConversations[0]);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const conversationMessages = await getConversationMessages(conversationId);
      setMessages(conversationMessages);
      
      // Mark unread messages as read
      const unreadMessages = conversationMessages.filter(m => !m.isRead && m.recipientId === user?.id);
      for (const message of unreadMessages) {
        await markMessageAsRead(message.id, user!.id);
      }
      
      // Refresh unread count
      await loadUnreadCount();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const loadUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await getUnreadMessageCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !composeData.content.trim()) return;

    setSending(true);
    setError('');
    
    try {
      await sendMessage(
        user.id,
        user.name,
        user.role,
        composeData.recipientId,
        composeData.recipientName,
        composeData.recipientRole,
        composeData.subject,
        composeData.content,
        {
          messageType: composeData.messageType,
          priority: composeData.priority,
        }
      );
      
      setSuccess('Message sent successfully!');
      setShowCompose(false);
      setComposeData({
        recipientId: '',
        recipientName: '',
        recipientRole: '',
        subject: '',
        content: '',
        priority: 'medium',
        messageType: 'message',
      });
      
      // Refresh conversations
      await loadConversations();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (originalMessage: Message, replyContent: string) => {
    if (!user || !replyContent.trim()) return;

    try {
      await sendMessage(
        user.id,
        user.name,
        user.role,
        originalMessage.senderId,
        originalMessage.senderName,
        originalMessage.senderRole,
        `Re: ${originalMessage.subject}`,
        replyContent,
        {
          conversationId: originalMessage.conversationId,
          parentMessageId: originalMessage.id,
          messageType: 'message',
          priority: originalMessage.priority,
        }
      );
      
      // Refresh messages
      await loadMessages(originalMessage.conversationId);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    if (!user) return;
    
    try {
      await archiveConversation(conversationId, user.id);
      await loadConversations();
      setSelectedConversation(null);
      setMessages([]);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMessageTypeIcon = (type: string) => {
    const icons = {
      message: MessageSquare,
      notification: Bell,
      alert: AlertCircle,
      reminder: Clock,
    };
    const Icon = icons[type as keyof typeof icons] || MessageSquare;
    return <Icon className="w-4 h-4" />;
  };

  const filteredConversations = conversations.filter(conv =>
    searchTerm === '' ||
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] space-x-4">
        <div className="w-1/3">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex-1">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Message Center</h2>
          <p className="text-muted-foreground">
            Communicate with tenants, agents, and property owners
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {unreadCount} unread
            </Badge>
          )}
          <Button onClick={() => setShowCompose(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex h-[calc(100vh-12rem)] space-x-4">
        {/* Conversations List */}
        <div className="w-1/3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button variant="outline" size="sm" onClick={loadConversations}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations</h3>
                    <p className="text-gray-600 mb-4">Start a new conversation to get started.</p>
                    <Button onClick={() => setShowCompose(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Message
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm truncate">{conversation.subject}</h4>
                          {conversation.unreadCount[user?.id || ''] > 0 && (
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {conversation.unreadCount[user?.id || '']}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          {conversation.participants
                            .filter(p => p.id !== user?.id)
                            .map(participant => (
                              <div key={participant.id} className="flex items-center space-x-1">
                                <User className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{participant.name}</span>
                                <Badge variant="outline" className="text-xs">{participant.role}</Badge>
                              </div>
                            ))
                          }
                        </div>
                        
                        <p className="text-xs text-gray-500 truncate mb-2">
                          {conversation.lastMessage.content}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(conversation.updatedAt.toDate(), { addSuffix: true })}
                          </span>
                          {conversation.relatedResource && (
                            <Badge variant="outline" className="text-xs">
                              <Building className="w-3 h-3 mr-1" />
                              {conversation.relatedResource.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages Panel */}
        <div className="flex-1">
          <Card className="h-full">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedConversation.subject}</CardTitle>
                      <CardDescription>
                        {selectedConversation.participants
                          .filter(p => p.id !== user?.id)
                          .map(p => `${p.name} (${p.role})`)
                          .join(', ')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleArchiveConversation(selectedConversation.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-0">
                  <div className="max-h-[calc(100vh-24rem)] overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-4 ${
                            message.senderId === user?.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-semibold">
                              {message.senderId === user?.id ? 'You' : message.senderName}
                            </span>
                            <Badge className={getPriorityColor(message.priority)}>
                              {message.priority}
                            </Badge>
                            <Badge variant="outline">
                              {getMessageTypeIcon(message.messageType)}
                              <span className="ml-1">{message.messageType}</span>
                            </Badge>
                          </div>
                          
                          <p className="text-sm mb-2">{message.content}</p>
                          
                          <div className="flex items-center justify-between text-xs opacity-75">
                            <span>{format(message.createdAt.toDate(), 'MMM dd, HH:mm')}</span>
                            <div className="flex items-center space-x-1">
                              {message.isRead ? (
                                <Eye className="w-3 h-3" />
                              ) : (
                                <EyeOff className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Reply Box */}
                  <div className="border-t p-4">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const replyContent = formData.get('reply') as string;
                      if (messages.length > 0) {
                        handleReply(messages[messages.length - 1], replyContent);
                        (e.target as HTMLFormElement).reset();
                      }
                    }}>
                      <div className="flex space-x-2">
                        <Textarea
                          name="reply"
                          placeholder="Type your reply..."
                          className="flex-1"
                          rows={2}
                        />
                        <Button type="submit" disabled={sending}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to view messages.</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Compose New Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recipient ID</Label>
                    <Input
                      value={composeData.recipientId}
                      onChange={(e) => setComposeData(prev => ({ ...prev, recipientId: e.target.value }))}
                      placeholder="Enter recipient user ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient Name</Label>
                    <Input
                      value={composeData.recipientName}
                      onChange={(e) => setComposeData(prev => ({ ...prev, recipientName: e.target.value }))}
                      placeholder="Enter recipient name"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={composeData.priority}
                      onValueChange={(value) => setComposeData(prev => ({ ...prev, priority: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={composeData.messageType}
                      onValueChange={(value) => setComposeData(prev => ({ ...prev, messageType: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="message">Message</SelectItem>
                        <SelectItem value="notification">Notification</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter message subject"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Type your message..."
                    rows={6}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sending}>
                    {sending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
