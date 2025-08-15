'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bell, 
  Search,
  Filter,
  MarkAsUnreadIcon,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  Notification, 
  getUserNotifications, 
  markNotificationAsRead,
  markNotificationAsUnread,
  deleteNotification,
  markAllNotificationsAsRead,
  createDemoNotifications
} from '@/lib/services/notifications';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      loadNotifications();
    }
  }, [user, authLoading]);

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const userNotifications = await getUserNotifications(user.id);
      
      // If no notifications exist, create demo notifications
      if (userNotifications.length === 0) {
        await createDemoNotifications(user.id);
        const newNotifications = await getUserNotifications(user.id);
        setNotifications(newNotifications);
      } else {
        setNotifications(userNotifications);
      }
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAsUnread = async (notificationId: string) => {
    try {
      await markNotificationAsUnread(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: false } : n)
      );
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleBulkMarkAsRead = async () => {
    for (const id of selectedNotifications) {
      await handleMarkAsRead(id);
    }
    setSelectedNotifications([]);
    setShowBulkActions(false);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedNotifications) {
      await handleDeleteNotification(id);
    }
    setSelectedNotifications([]);
    setShowBulkActions(false);
  };

  const handleSelectNotification = (notificationId: string, selected: boolean) => {
    if (selected) {
      setSelectedNotifications(prev => [...prev, notificationId]);
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return AlertCircle;
      case 'medium':
        return Info;
      default:
        return CheckCircle;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lease_expiring':
      case 'lease_expired':
        return '📋';
      case 'payment_due':
        return '💰';
      case 'maintenance_request':
        return '🔧';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'read' && notification.read) ||
      (filterStatus === 'unread' && !notification.read);

    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  if (authLoading || loading) {
    return (
      <AppLayout title="Notifications">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <AppLayout title="Notifications">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bell className="mr-3 h-8 w-8" />
              Notifications
            </h1>
            <p className="text-gray-600 mt-2">
              Stay updated with important alerts and messages
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {unreadCount} unread
              </Badge>
              <Badge variant="outline">
                {totalCount} total
              </Badge>
            </div>
            <Button onClick={loadNotifications} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="payment_due">Payment Due</SelectItem>
                    <SelectItem value="maintenance_request">Maintenance</SelectItem>
                    <SelectItem value="lease_expiring">Lease Expiring</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>

                {selectedNotifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Actions ({selectedNotifications.length})
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {showBulkActions && selectedNotifications.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {selectedNotifications.length} selected
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleBulkMarkAsRead} variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Mark as Read
                  </Button>
                  <Button onClick={handleBulkDelete} variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedNotifications([]);
                      setShowBulkActions(false);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Notifications</CardTitle>
              {filteredNotifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedNotifications.length === filteredNotifications.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-600">
                  {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const PriorityIcon = getPriorityIcon(notification.priority);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all ${
                        notification.read
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-blue-50 border-blue-200'
                      } ${
                        selectedNotifications.includes(notification.id)
                          ? 'ring-2 ring-blue-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={(checked) =>
                            handleSelectNotification(notification.id, checked as boolean)
                          }
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <span className="text-2xl" title={notification.type}>
                                {getTypeIcon(notification.type)}
                              </span>
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className={`font-semibold ${
                                    notification.read ? 'text-gray-700' : 'text-gray-900'
                                  }`}>
                                    {notification.title}
                                  </h3>
                                  
                                  <div className={`p-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                                    <PriorityIcon className="w-3 h-3" />
                                  </div>
                                  
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                </div>
                                
                                <p className={`mt-1 ${
                                  notification.read ? 'text-gray-600' : 'text-gray-800'
                                }`}>
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-sm text-gray-500">
                                    {format(notification.createdAt.toDate(), 'PPP p')}
                                  </span>
                                  
                                  <Badge variant="outline" className="text-xs">
                                    {notification.type.replace('_', ' ')}
                                  </Badge>
                                  
                                  <Badge 
                                    variant={notification.priority === 'high' ? 'destructive' : 
                                            notification.priority === 'medium' ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {notification.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {notification.read ? (
                                <Button
                                  onClick={() => handleMarkAsUnread(notification.id)}
                                  variant="ghost"
                                  size="sm"
                                  title="Mark as unread"
                                >
                                  <EyeOff className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  variant="ghost"
                                  size="sm"
                                  title="Mark as read"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button
                                onClick={() => handleDeleteNotification(notification.id)}
                                variant="ghost"
                                size="sm"
                                title="Delete notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings Link */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/settings')}
            className="mt-4"
          >
            <Settings className="w-4 h-4 mr-2" />
            Notification Settings
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}