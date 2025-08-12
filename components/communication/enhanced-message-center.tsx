'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare,
  Send,
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  Video,
  Paperclip,
  Smile,
  Edit,
  Trash2,
  Reply,
  Users,
  Bell,
  BellOff,
  Pin,
  Archive,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Image,
  FileText,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

import { messageService } from '@/lib/services/message-service';
import { Conversation, Message, MessageAttachment, TypingIndicator } from '@/lib/types/messages';

export default function EnhancedMessageCenter() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    // Subscribe to conversations
    const unsubscribeConversations = messageService.subscribeToConversations(
      user.uid,
      (updatedConversations) => {
        setConversations(updatedConversations);
        setIsLoading(false);
        
        // Auto-select first conversation if none selected
        if (!selectedConversation && updatedConversations.length > 0) {
          setSelectedConversation(updatedConversations[0]);
        }
      }
    );

    return () => {
      unsubscribeConversations();
    };
  }, [user]);

  useEffect(() => {
    if (!selectedConversation) return;

    // Subscribe to messages for selected conversation
    const unsubscribeMessages = messageService.subscribeToMessages(
      selectedConversation.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
        scrollToBottom();
        
        // Mark conversation as read
        if (user) {
          messageService.markConversationAsRead(selectedConversation.id, user.uid);
        }
      }
    );

    // Subscribe to typing indicators
    const unsubscribeTyping = messageService.subscribeToTyping(
      selectedConversation.id,
      (indicators) => {
        setTypingIndicators(indicators.filter(t => t.userId !== user?.uid));
      }
    );

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [selectedConversation, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      await messageService.sendMessage(
        selectedConversation.id,
        newMessage,
        user.uid,
        user.displayName || user.email || 'Unknown User',
        'tenant', // This should come from user data
        {
          type: 'direct',
          priority: 'medium'
        }
      );

      setNewMessage('');
      setIsTyping(false);
      
      // Clear typing indicator
      await messageService.setTyping(selectedConversation.id, user.uid, user.displayName || 'User', false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = async (text: string) => {
    setNewMessage(text);

    if (!selectedConversation || !user) return;

    const isCurrentlyTyping = text.length > 0;
    
    if (isCurrentlyTyping !== isTyping) {
      setIsTyping(isCurrentlyTyping);
      await messageService.setTyping(
        selectedConversation.id, 
        user.uid, 
        user.displayName || 'User', 
        isCurrentlyTyping
      );
    }

    // Clear typing after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      await messageService.setTyping(selectedConversation.id, user.uid, user.displayName || 'User', false);
    }, 3000);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getMessageStatusIcon = (message: Message) => {
    if (message.senderId !== user?.uid) return null;
    
    const userRecipient = message.recipients.find(r => r.id === user?.uid);
    if (!userRecipient) return null;

    switch (userRecipient.status) {
      case 'sent':
        return <Circle className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle2 className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCircle2 className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount[user?.uid || ''] || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </h2>
            <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Conversation title" />
                  <Input placeholder="Add participants..." />
                  <Button className="w-full">Create Conversation</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const unreadCount = getUnreadCount(conversation);
              const isSelected = selectedConversation?.id === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.participants[0]?.avatar} />
                        <AvatarFallback>
                          {conversation.title.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.participants.some(p => p.isOnline) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium truncate ${unreadCount > 0 ? 'font-semibold' : ''}`}>
                          {conversation.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {conversation.lastMessage && (
                        <p className={`text-sm text-gray-600 truncate ${unreadCount > 0 ? 'font-medium' : ''}`}>
                          {conversation.lastMessage.senderName}: {conversation.lastMessage.content}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-1">
                        {conversation.type === 'property' && (
                          <Badge variant="outline" className="text-xs">
                            {conversation.propertyName}
                          </Badge>
                        )}
                        {conversation.type === 'maintenance' && (
                          <Badge variant="outline" className="text-xs">
                            Maintenance
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConversation.participants[0]?.avatar} />
                    <AvatarFallback>
                      {selectedConversation.title.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedConversation.title}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.participants.length} participant{selectedConversation.participants.length !== 1 ? 's' : ''}
                      {selectedConversation.participants.some(p => p.isOnline) && (
                        <span className="text-green-600 ml-2">• Online</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === user?.uid;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        {!isOwnMessage && (
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {message.senderName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-gray-700">
                              {message.senderName}
                            </span>
                          </div>
                        )}
                        
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.replyToMessageId && (
                            <div className="border-l-2 border-gray-300 pl-2 mb-2 text-sm opacity-75">
                              Replying to previous message
                            </div>
                          )}
                          
                          <p className="text-sm">{message.content}</p>
                          
                          {message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center gap-2 p-2 rounded bg-white bg-opacity-20"
                                >
                                  {attachment.type === 'image' ? (
                                    <Image className="w-4 h-4" />
                                  ) : (
                                    <FileText className="w-4 h-4" />
                                  )}
                                  <span className="text-xs">{attachment.name}</span>
                                  <Button size="sm" variant="ghost">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className={`flex items-center gap-2 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(message.createdAt)}
                          </span>
                          {isOwnMessage && getMessageStatusIcon(message)}
                          {message.isEdited && (
                            <span className="text-xs text-gray-400">(edited)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicators */}
                {typingIndicators.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {typingIndicators.map(t => t.userName).join(', ')} {typingIndicators.length === 1 ? 'is' : 'are'} typing...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-3">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[40px] max-h-32 resize-none"
                    rows={1}
                  />
                </div>
                
                <Button variant="ghost" size="sm">
                  <Smile className="w-4 h-4" />
                </Button>
                
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}