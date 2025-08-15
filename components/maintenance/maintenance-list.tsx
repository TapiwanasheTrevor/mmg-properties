'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Wrench, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  User,
  Home,
  AlertCircle,
  MoreHorizontal,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { getMaintenanceRequests, deleteMaintenanceRequest, assignMaintenanceRequest, updateMaintenanceRequestStatus } from '@/lib/services/maintenance';

// Types
type RequestStatus = 'pending' | 'submitted' | 'assigned' | 'in_progress' | 'awaiting_approval' | 'completed' | 'cancelled';
type RequestPriority = 'low' | 'medium' | 'high' | 'emergency';  
type RequestCategory = 'plumbing' | 'electrical' | 'hvac' | 'structural' | 'appliance' | 'cleaning' | 'other';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  propertyId: string;
  unitId: string;
  tenantId: string;
  submittedBy?: string;
  assignedTo?: string;
  estimatedCost?: number;
  createdAt: { toDate: () => Date };
  tenant?: {
    name: string;
    email: string;
    phone: string;
  };
  property?: {
    name: string;
    address: string;
  };
  unit?: {
    number: string;
  };
}

interface MaintenanceListProps {
  onRequestSelect?: (requestId: string) => void;
  propertyId?: string;
  unitId?: string;
  showFilters?: boolean;
}

export default function MaintenanceList({ 
  onRequestSelect, 
  propertyId, 
  unitId, 
  showFilters = true 
}: MaintenanceListProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<RequestCategory | 'all'>('all');

  useEffect(() => {
    loadRequests();
  }, [user, statusFilter, priorityFilter, categoryFilter, propertyId, unitId]);

  const loadRequests = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const filters: any = {};

      // Apply filters
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (propertyId) filters.propertyId = propertyId;
      if (unitId) filters.unitId = unitId;

      // Role-based filtering
      if (user.role === 'tenant') {
        filters.submittedBy = user.id;
      } else if (user.role === 'agent') {
        // For agents, show requests they submitted or are assigned to
        // This would require a more complex query in production
        filters.assignedTo = user.id;
      }

      // Load real data from Firebase
      const result = await getMaintenanceRequests(filters);
      setRequests(result.requests);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this maintenance request? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMaintenanceRequest(requestId);
      // Remove from local state
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: RequestStatus) => {
    try {
      await updateMaintenanceRequestStatus(requestId, status);
      // Update local state
      setRequests(prev => 
        prev.map(r => r.id === requestId ? { ...r, status } : r)
      );
    } catch (error: any) {
      setError(error.message);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return request.title.toLowerCase().includes(searchLower) ||
           request.description.toLowerCase().includes(searchLower) ||
           request.category.toLowerCase().includes(searchLower);
  });

  const getStatusColor = (status: RequestStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      awaiting_approval: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: RequestStatus) => {
    const icons = {
      pending: Clock,
      submitted: Clock,
      assigned: User,
      in_progress: Wrench,
      awaiting_approval: AlertCircle,
      completed: CheckCircle,
      cancelled: XCircle,
    };
    return icons[status] || Clock;
  };

  const getPriorityColor = (priority: RequestPriority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800',
    };
    return colors[priority];
  };

  const getPriorityIcon = (priority: RequestPriority) => {
    if (priority === 'emergency') return AlertTriangle;
    return null;
  };

  const canEditRequest = (request: MaintenanceRequest) => {
    return user?.role === 'admin' || 
           user?.id === request.submittedBy ||
           (user?.role === 'agent' && request.assignedTo === user.id);
  };

  const canDeleteRequest = (request: MaintenanceRequest) => {
    return user?.role === 'admin' || 
           (user?.id === request.submittedBy && request.status === 'pending');
  };

  if (loading && requests.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-5 w-64 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Requests</h1>
          <p className="text-muted-foreground">
            Manage maintenance and service requests ({requests.length} requests)
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'agent' || user?.role === 'tenant') && (
          <Button asChild>
            <Link href="/maintenance/new">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search requests by title, description, or category..." 
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RequestStatus | 'all')}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as RequestPriority | 'all')}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as RequestCategory | 'all')}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="appliance">Appliance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      {filteredRequests.length === 0 && !loading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No maintenance requests found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No requests match your search criteria.' : 'Get started by submitting a maintenance request.'}
            </p>
            {!searchTerm && (user?.role === 'admin' || user?.role === 'agent' || user?.role === 'tenant') && (
              <Button asChild>
                <Link href="/maintenance/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            const PriorityIcon = getPriorityIcon(request.priority);

            return (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header with badges */}
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getStatusColor(request.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {request.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(request.priority)}>
                          {PriorityIcon && <PriorityIcon className="w-3 h-3 mr-1" />}
                          {request.priority}
                        </Badge>
                        <Badge variant="outline">
                          {request.category}
                        </Badge>
                      </div>

                      {/* Title and description */}
                      <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                        {request.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {request.description}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>
                            {formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true })}
                          </span>
                        </div>
                        
                        {request.unitId && (
                          <div className="flex items-center">
                            <Home className="w-4 h-4 mr-1" />
                            <span>Unit {request.unitId.slice(0, 8)}...</span>
                          </div>
                        )}
                        
                        {request.assignedTo && (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>Assigned</span>
                          </div>
                        )}

                        {request.estimatedCost && request.estimatedCost > 0 && (
                          <div className="flex items-center">
                            <span className="font-medium">
                              ${request.estimatedCost.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRequestSelect?.(request.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/maintenance/${request.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          
                          {canEditRequest(request) && (
                            <DropdownMenuItem asChild>
                              <Link href={`/maintenance/${request.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                          )}
                          
                          {(user?.role === 'admin' || user?.role === 'agent') && request.status === 'pending' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(request.id, 'assigned')}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Assign to Me
                            </DropdownMenuItem>
                          )}
                          
                          {request.assignedTo === user?.id && request.status === 'assigned' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                            >
                              <Wrench className="mr-2 h-4 w-4" />
                              Start Work
                            </DropdownMenuItem>
                          )}
                          
                          {request.assignedTo === user?.id && request.status === 'in_progress' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(request.id, 'completed')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          
                          {canDeleteRequest(request) && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRequest(request.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {loading && requests.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading more requests...
          </div>
        </div>
      )}
    </div>
  );
}