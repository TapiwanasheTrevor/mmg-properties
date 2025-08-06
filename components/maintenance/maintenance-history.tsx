'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wrench, 
  Calendar, 
  Eye, 
  Clock,
  CheckCircle,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Filter
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { MaintenanceRequest } from '@/lib/types';
import { getRequestsByUnit, getRequestsByProperty, getMaintenanceStatistics } from '@/lib/services/maintenance';

interface MaintenanceHistoryProps {
  unitId?: string;
  propertyId?: string;
  showStats?: boolean;
}

export default function MaintenanceHistory({ unitId, propertyId, showStats = true }: MaintenanceHistoryProps) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMaintenanceHistory();
  }, [unitId, propertyId]);

  const loadMaintenanceHistory = async () => {
    setLoading(true);
    setError('');

    try {
      let historyRequests: MaintenanceRequest[] = [];
      
      if (unitId) {
        historyRequests = await getRequestsByUnit(unitId);
      } else if (propertyId) {
        historyRequests = await getRequestsByProperty(propertyId);
      }

      // Sort by creation date (most recent first)
      historyRequests.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
      
      setRequests(historyRequests);

      // Load stats if requested
      if (showStats) {
        const statistics = await getMaintenanceStatistics(propertyId);
        setStats(statistics);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
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
      assigned: Clock,
      in_progress: Wrench,
      awaiting_approval: AlertCircle,
      completed: CheckCircle,
      cancelled: AlertCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="w-4 h-4" />;
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

  const calculateStats = () => {
    if (requests.length === 0) return null;

    const completedRequests = requests.filter(r => r.status === 'completed');
    const totalCost = completedRequests.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost || 0), 0);
    const avgResponseTime = completedRequests.filter(r => r.assignedAt && r.completedAt).length > 0 ?
      completedRequests
        .filter(r => r.assignedAt && r.completedAt)
        .reduce((sum, r) => {
          const assignedTime = r.assignedAt!.toDate().getTime();
          const completedTime = r.completedAt!.toDate().getTime();
          return sum + (completedTime - assignedTime);
        }, 0) / completedRequests.filter(r => r.assignedAt && r.completedAt).length / (1000 * 60 * 60) : 0;

    return {
      total: requests.length,
      completed: completedRequests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      inProgress: requests.filter(r => r.status === 'in_progress').length,
      totalCost,
      avgResponseTime: Math.round(avgResponseTime),
      completionRate: requests.length > 0 ? Math.round((completedRequests.length / requests.length) * 100) : 0,
    };
  };

  const localStats = calculateStats();

  if (loading) {
    return (
      <div className="space-y-6">
        {showStats && (
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
        )}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance History</h2>
          <p className="text-muted-foreground">
            {unitId ? 'Unit maintenance history' : propertyId ? 'Property maintenance history' : 'All maintenance requests'} 
            ({requests.length} requests)
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {showStats && localStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Wrench className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{localStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{localStats.completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">{localStats.avgResponseTime}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">${localStats.totalCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>
            Chronological list of all maintenance requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No maintenance history</h3>
              <p className="text-gray-600">
                {unitId ? 'This unit has no maintenance requests yet.' : 
                 propertyId ? 'This property has no maintenance requests yet.' : 
                 'No maintenance requests found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status.replace('_', ' ')}</span>
                        </Badge>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge variant="outline">
                          {request.category}
                        </Badge>
                      </div>
                      
                      <h4 className="font-semibold text-lg mb-1">{request.title}</h4>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {request.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Created {format(request.createdAt.toDate(), 'MMM dd, yyyy')}</span>
                        </div>
                        
                        {request.completedAt && (
                          <div className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            <span>Completed {format(request.completedAt.toDate(), 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                        
                        {(request.actualCost || request.estimatedCost) && (
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            <span>${(request.actualCost || request.estimatedCost || 0).toLocaleString()}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <span>Type: {request.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/maintenance/${request.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}