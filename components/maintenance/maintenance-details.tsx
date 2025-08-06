'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Wrench, 
  Edit, 
  Clock,
  User,
  Home,
  AlertCircle,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageCircle,
  Send,
  Paperclip,
  Camera,
  DollarSign,
  FileText
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { MaintenanceRequest } from '@/lib/types';
import { 
  getMaintenanceRequest, 
  updateMaintenanceRequestStatus, 
  addMaintenanceComment,
  assignMaintenanceRequest 
} from '@/lib/services/maintenance';

interface MaintenanceDetailsProps {
  requestId: string;
}

export default function MaintenanceDetails({ requestId }: MaintenanceDetailsProps) {
  const { user } = useAuth();
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    setLoading(true);
    setError('');

    try {
      const requestData = await getMaintenanceRequest(requestId);
      if (!requestData) {
        setError('Maintenance request not found');
        return;
      }
      setRequest(requestData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!request) return;

    try {
      await updateMaintenanceRequestStatus(request.id, status as any);
      setRequest(prev => prev ? { ...prev, status: status as any } : null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleAssignToMe = async () => {
    if (!request || !user) return;

    try {
      await assignMaintenanceRequest(request.id, user.id);
      setRequest(prev => prev ? { ...prev, assignedTo: user.id, status: 'assigned' as any } : null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleAddComment = async () => {
    if (!request || !user || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await addMaintenanceComment(request.id, user.id, newComment);
      
      // Add comment to local state
      const comment = {
        userId: user.id,
        message: newComment,
        timestamp: { toDate: () => new Date() } as any,
        attachments: [],
      };
      
      setRequest(prev => prev ? {
        ...prev,
        comments: [...prev.comments, comment]
      } : null);
      
      setNewComment('');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      awaiting_approval: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      assigned: User,
      in_progress: Wrench,
      awaiting_approval: AlertCircle,
      completed: CheckCircle,
      cancelled: XCircle,
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const canEdit = () => {
    if (!request || !user) return false;
    return user.role === 'admin' || 
           user.id === request.submittedBy ||
           (user.role === 'agent' && request.assignedTo === user.id);
  };

  const canManageStatus = () => {
    if (!request || !user) return false;
    return user.role === 'admin' || 
           (user.role === 'agent' && request.assignedTo === user.id);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Request not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(request.status);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Badge className={getStatusColor(request.status)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {request.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(request.priority)}>
                  {request.priority === 'emergency' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {request.priority}
                </Badge>
                <Badge variant="outline">
                  {request.category}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold mb-1">{request.title}</h1>
              <p className="text-muted-foreground">
                Request #{request.id.slice(0, 8)} • Created {formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true })}
              </p>
            </div>
            
            <div className="flex space-x-2">
              {canEdit() && (
                <Button variant="outline" asChild>
                  <Link href={`/maintenance/${request.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              )}
              
              {/* Status Actions */}
              {user?.role === 'agent' && request.status === 'pending' && !request.assignedTo && (
                <Button onClick={handleAssignToMe}>
                  <User className="mr-2 h-4 w-4" />
                  Assign to Me
                </Button>
              )}
              
              {canManageStatus() && request.status === 'assigned' && (
                <Button onClick={() => handleStatusUpdate('in_progress')}>
                  <Wrench className="mr-2 h-4 w-4" />
                  Start Work
                </Button>
              )}
              
              {canManageStatus() && request.status === 'in_progress' && (
                <Button onClick={() => handleStatusUpdate('completed')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">
                Comments ({request.comments.length})
              </TabsTrigger>
              <TabsTrigger value="photos">Photos ({request.images.length})</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{request.description}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                      <p className="mt-1 capitalize">{request.type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                      <p className="mt-1 capitalize">{request.category}</p>
                    </div>
                  </div>
                  
                  {request.estimatedCost && request.estimatedCost > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Estimated Cost</Label>
                        <p className="mt-1 font-medium">${request.estimatedCost.toLocaleString()}</p>
                      </div>
                    </>
                  )}
                  
                  {request.actualCost && request.actualCost > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Actual Cost</Label>
                      <p className="mt-1 font-medium">${request.actualCost.toLocaleString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Comments & Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Existing Comments */}
                    {request.comments.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No comments yet. Be the first to add one!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {request.comments.map((comment, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {comment.userId.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium">
                                    User {comment.userId.slice(0, 8)}...
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(comment.timestamp.toDate(), 'MMM dd, yyyy HH:mm')}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add New Comment */}
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <Label htmlFor="comment">Add Comment</Label>
                        <Textarea
                          id="comment"
                          placeholder="Add a comment or update..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" disabled>
                              <Paperclip className="h-4 w-4 mr-1" />
                              Attach File
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                              <Camera className="h-4 w-4 mr-1" />
                              Add Photo
                            </Button>
                          </div>
                          <Button 
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || submittingComment}
                          >
                            {submittingComment ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Post Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos">
              <Card>
                <CardHeader>
                  <CardTitle>Photos & Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  {request.images.length === 0 ? (
                    <div className="text-center py-8">
                      <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No photos uploaded</h3>
                      <p className="text-gray-600">Photos help us understand and resolve issues faster.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {request.images.map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg border">
                          <img
                            src={image}
                            alt={`Request photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Completion Proof */}
                  {request.completionProof.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Completion Photos</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {request.completionProof.map((image, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg border">
                            <img
                              src={image}
                              alt={`Completion photo ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-4">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Request Created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(request.createdAt.toDate(), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              {request.assignedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Assigned to Agent</p>
                    <p className="text-xs text-muted-foreground">
                      {format(request.assignedAt.toDate(), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}
              
              {request.completedAt && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-xs text-muted-foreground">
                      {format(request.completedAt.toDate(), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Submitted By</Label>
                <p className="mt-1 text-sm">User {request.submittedBy.slice(0, 8)}...</p>
              </div>
              
              {request.assignedTo ? (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Assigned To</Label>
                  <p className="mt-1 text-sm">Agent {request.assignedTo.slice(0, 8)}...</p>
                </div>
              ) : (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <p className="mt-1 text-sm">Unassigned</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Property</Label>
                <p className="mt-1 text-sm">Property {request.propertyId.slice(0, 8)}...</p>
              </div>
              
              {request.unitId && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Unit</Label>
                  <p className="mt-1 text-sm">Unit {request.unitId.slice(0, 8)}...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}