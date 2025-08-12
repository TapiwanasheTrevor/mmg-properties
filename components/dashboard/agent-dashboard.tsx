'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Star, 
  Calendar,
  MapPin,
  Camera,
  Navigation,
  Phone,
  MessageSquare,
  FileText,
  Wrench,
  Eye,
  Route,
  Wifi,
  WifiOff
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useAgentDashboard, useRealtimeMaintenanceRequests } from '@/hooks/useRealtimeProperties';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface AgentDashboardProps {
  className?: string;
}

export default function AgentDashboard({ className }: AgentDashboardProps) {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [workStatus, setWorkStatus] = useState<'available' | 'busy' | 'offline'>('available');
  
  // Real-time agent data
  const { agentData, loading: agentLoading, error } = useAgentDashboard(user?.id || '');
  const { requests: myMaintenanceRequests, loading: requestsLoading } = useRealtimeMaintenanceRequests({
    agentId: user?.id,
    status: 'assigned'
  });

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get current location for GPS tracking
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  const toggleWorkStatus = () => {
    setWorkStatus(current => {
      switch (current) {
        case 'available': return 'busy';
        case 'busy': return 'offline';
        case 'offline': return 'available';
        default: return 'available';
      }
    });
  };

  const getDirections = (propertyAddress: string) => {
    if (currentLocation) {
      const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${encodeURIComponent(propertyAddress)}`;
      window.open(url, '_blank');
    }
  };

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading agent data. Please check your connection and refresh.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Field Agent Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <Badge 
                variant={workStatus === 'available' ? 'default' : workStatus === 'busy' ? 'secondary' : 'destructive'}
                className="cursor-pointer"
                onClick={toggleWorkStatus}
              >
                {workStatus === 'available' && '🟢 Available'}
                {workStatus === 'busy' && '🟡 Busy'}
                {workStatus === 'offline' && '🔴 Off Duty'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {currentLocation && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  GPS Active
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {new Date().toLocaleTimeString('en-ZW', { 
                  timeZone: 'Africa/Harare',
                  hour12: true 
                })} CAT
              </span>
            </div>
          </div>
          
          <div className="text-xs text-gray-600">
            Field Agent: {user?.profile.firstName} {user?.profile.lastName} • ID: {user?.id?.slice(-6)}
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {agentLoading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <>
                <div className="text-2xl font-bold">{agentData.assignedProperties.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active assignments
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <>
                <div className="text-2xl font-bold">{myMaintenanceRequests.length}</div>
                <p className="text-xs text-muted-foreground">
                  {myMaintenanceRequests.filter(r => r.priority === 'high').length} high priority
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentData.todayTasks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">Agent rating</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Maintenance requests assigned to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                id: 1,
                title: "Fix leaking faucet",
                property: "Sunset Apartments - Unit A2",
                priority: "high",
                status: "in_progress",
                dueDate: "Today",
                tenant: "John Smith",
              },
              {
                id: 2,
                title: "Replace broken window",
                property: "Downtown Complex - Unit B5",
                priority: "medium",
                status: "pending",
                dueDate: "Tomorrow",
                tenant: "Mary Johnson",
              },
              {
                id: 3,
                title: "Electrical inspection",
                property: "Garden View - Lobby",
                priority: "high",
                status: "overdue",
                dueDate: "Yesterday",
                tenant: "Building Management",
              },
            ].map((task) => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.property}</p>
                    <p className="text-xs text-muted-foreground">Tenant: {task.tenant}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge
                      variant={
                        task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                    <Badge
                      variant={
                        task.status === "overdue"
                          ? "destructive"
                          : task.status === "in_progress"
                            ? "default"
                            : "outline"
                      }
                    >
                      {task.status === "in_progress" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {task.status === "overdue" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {task.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Due: {task.dueDate}</span>
                  <Button size="sm">Update Status</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Assigned Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Properties</CardTitle>
            <CardDescription>Properties under your management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Sunset Apartments", units: 20, occupied: 19, issues: 2 },
              { name: "Downtown Complex", units: 25, occupied: 22, issues: 3 },
              { name: "Garden View", units: 12, occupied: 11, issues: 1 },
              { name: "Riverside Homes", units: 8, occupied: 7, issues: 2 },
            ].map((property) => (
              <div key={property.name} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{property.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {property.occupied}/{property.units} units occupied
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {property.issues > 0 && <Badge variant="destructive">{property.issues} issues</Badge>}
                    <Badge variant="outline">{Math.round((property.occupied / property.units) * 100)}%</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View Details
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your appointments and tasks for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "9:00 AM", task: "Property inspection - Sunset Apartments Unit A5", type: "inspection" },
              { time: "11:30 AM", task: "Meet with new tenant - Downtown Complex", type: "meeting" },
              { time: "2:00 PM", task: "Maintenance follow-up - Garden View", type: "maintenance" },
              { time: "4:00 PM", task: "Property showing - Riverside Homes Unit 3", type: "showing" },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.task}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
                <Badge variant="outline">{item.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
