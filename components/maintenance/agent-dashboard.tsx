'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Eye,
  Play,
  User,
  AlertTriangle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { MaintenanceRequest } from '@/lib/types';
import { 
  getAssignedRequests, 
  getPendingRequests, 
  getOverdueRequests,
  getMaintenanceStatistics,
  getAverageResponseTime,
  updateMaintenanceRequestStatus,
  assignMaintenanceRequest 
} from '@/lib/services/maintenance';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [assignedRequests, setAssignedRequests] = useState<MaintenanceRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<MaintenanceRequest[]>([]);
  const [overdueRequests, setOverdueRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'agent') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const [assigned, pending, overdue, statistics, responseTime] = await Promise.all([
        getAssignedRequests(user.id),
        getPendingRequests(),
        getOverdueRequests(),
        getMaintenanceStatistics(),
        getAverageResponseTime(user.id),
      ]);

      setAssignedRequests(assigned);
      setPendingRequests(pending);
      setOverdueRequests(overdue.filter(r => r.assignedTo === user.id));
      setStats(statistics);
      setAvgResponseTime(responseTime);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      await updateMaintenanceRequestStatus(requestId, status as any);
      await loadDashboardData(); // Reload data
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleAssignToMe = async (requestId: string) => {
    if (!user) return;

    try {
      await assignMaintenanceRequest(requestId, user.id);
      await loadDashboardData(); // Reload data
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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

  if (user?.role !== 'agent') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This dashboard is only available for agents.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const myActiveRequests = assignedRequests.filter(r => r.status === 'assigned' || r.status === 'in_progress');
  const myCompletedRequests = assignedRequests.filter(r => r.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your assigned maintenance tasks and track performance
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wrench className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold">{myActiveRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{myCompletedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{avgResponseTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Tasks ({myActiveRequests.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({overdueRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({myCompletedRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Tasks */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Your Active Tasks</CardTitle>
              <CardDescription>
                Maintenance requests currently assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myActiveRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No active tasks</h3>
                  <p className="text-gray-600">Check the available tab for new requests to assign.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myActiveRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getStatusColor(request.status)}>
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
                          
                          <h4 className="font-medium mb-1">{request.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {request.description}
                          </p>
                          
                          <div className="flex items-center text-xs text-muted-foreground space-x-4">
                            <span>
                              Created {formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true })}
                            </span>
                            {request.assignedAt && (
                              <span>
                                Assigned {formatDistanceToNow(request.assignedAt.toDate(), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/maintenance/${request.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          
                          {request.status === 'assigned' && (
                            <Button 
                              size="sm"
                              onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Start
                            </Button>
                          )}
                          
                          {request.status === 'in_progress' && (
                            <Button 
                              size="sm"
                              onClick={() => handleStatusUpdate(request.id, 'completed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Tasks */}
        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Available Requests</CardTitle>
              <CardDescription>
                Unassigned maintenance requests you can take on
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-600">All requests are currently assigned.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority === 'emergency' && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {request.priority}
                            </Badge>
                            <Badge variant="outline">
                              {request.category}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium mb-1">{request.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {request.description}
                          </p>
                          
                          <div className="text-xs text-muted-foreground">
                            Created {formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/maintenance/${request.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          
                          <Button 
                            size="sm"
                            onClick={() => handleAssignToMe(request.id)}
                          >
                            <User className="w-4 h-4 mr-1" />
                            Assign to Me
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overdue Tasks */}
        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Overdue Tasks</CardTitle>
              <CardDescription>
                Tasks that are past their expected completion time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdueRequests.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No overdue tasks</h3>
                  <p className="text-gray-600">Great job staying on top of your assignments!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {overdueRequests.map((request) => (
                    <div key={request.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="bg-red-100 text-red-800">
                              Overdue
                            </Badge>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium mb-1">{request.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.description}
                          </p>
                          
                          <div className="text-xs text-red-600">
                            Assigned {formatDistanceToNow(request.assignedAt!.toDate(), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/maintenance/${request.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          
                          {request.status !== 'completed' && (
                            <Button 
                              size="sm"
                              onClick={() => handleStatusUpdate(request.id, 'completed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Tasks */}
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>
                Your recently completed maintenance requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myCompletedRequests.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed tasks yet</h3>
                  <p className="text-gray-600">Completed tasks will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myCompletedRequests.slice(0, 10).map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                            <Badge variant="outline">
                              {request.category}
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium mb-1">{request.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.description}
                          </p>
                          
                          <div className="text-xs text-muted-foreground">
                            Completed {request.completedAt ? formatDistanceToNow(request.completedAt.toDate(), { addSuffix: true }) : 'recently'}
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/maintenance/${request.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}