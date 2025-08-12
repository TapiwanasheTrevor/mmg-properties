'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Shield,
  Activity,
  Database,
  Wifi,
  WifiOff,
  UserCheck,
  UserX,
  BarChart3,
  FileText,
  Settings,
  Map,
  Phone,
  MessageCircle,
  Eye,
  UserPlus,
  AlertCircle
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useAgentLocations } from '@/hooks/useLocationTracking';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { collection, onSnapshot, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminDashboardProps {
  className?: string;
}

interface SystemMetrics {
  totalProperties: number;
  totalUnits: number;
  activeUsers: number;
  monthlyRevenue: number;
  occupancyRate: number;
  pendingRequests: number;
  activeAgents: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'property_added' | 'maintenance_request' | 'payment' | 'system_alert';
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  userId?: string;
  propertyId?: string;
}

export default function AdminDashboard({ className }: AdminDashboardProps) {
  const { user } = useAuth();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalProperties: 0,
    totalUnits: 0,
    activeUsers: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    pendingRequests: 0,
    activeAgents: 0,
    systemHealth: 'healthy'
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [currency, setCurrency] = useState<'USD' | 'ZWL'>('USD');
  
  // Real-time agent locations
  const { agentLocations } = useAgentLocations();

  // Currency conversion
  const exchangeRate = 1320;
  const convertCurrency = (amount: number) => {
    return currency === 'ZWL' ? amount * exchangeRate : amount;
  };

  // Load real-time system metrics
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Listen to properties
    unsubscribers.push(
      onSnapshot(collection(db, 'properties'), (snapshot) => {
        const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const totalUnits = properties.reduce((sum, property) => sum + (property.totalUnits || 0), 0);
        const occupiedUnits = properties.reduce((sum, property) => sum + (property.occupiedUnits || 0), 0);
        const monthlyRevenue = properties.reduce((sum, property) => sum + (property.monthlyIncome || 0), 0);
        
        setSystemMetrics(prev => ({
          ...prev,
          totalProperties: properties.length,
          totalUnits,
          occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
          monthlyRevenue
        }));
      })
    );

    // Listen to users
    unsubscribers.push(
      onSnapshot(collection(db, 'users'), (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const activeUsers = users.filter(user => user.isActive).length;
        const activeAgents = users.filter(user => user.role === 'agent' && user.isActive).length;
        
        setSystemMetrics(prev => ({
          ...prev,
          activeUsers,
          activeAgents
        }));
      })
    );

    // Listen to maintenance requests
    unsubscribers.push(
      onSnapshot(
        query(
          collection(db, 'maintenance_requests'),
          where('status', 'in', ['submitted', 'assigned', 'in_progress'])
        ),
        (snapshot) => {
          setSystemMetrics(prev => ({
            ...prev,
            pendingRequests: snapshot.size
          }));
        }
      )
    );

    // Listen to recent activity
    unsubscribers.push(
      onSnapshot(
        query(
          collection(db, 'system_activity'),
          orderBy('timestamp', 'desc'),
          limit(20)
        ),
        (snapshot) => {
          const activities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate()
          })) as RecentActivity[];
          
          setRecentActivity(activities);
        }
      )
    );

    setLoading(false);

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Calculate system health based on metrics
  useEffect(() => {
    let health: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (systemMetrics.pendingRequests > 20) health = 'warning';
    if (systemMetrics.pendingRequests > 50) health = 'critical';
    if (systemMetrics.occupancyRate < 80) health = 'warning';
    if (systemMetrics.occupancyRate < 60) health = 'critical';
    
    setSystemMetrics(prev => ({ ...prev, systemHealth: health }));
  }, [systemMetrics.pendingRequests, systemMetrics.occupancyRate]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return UserPlus;
      case 'property_added': return Building2;
      case 'maintenance_request': return Wrench;
      case 'payment': return DollarSign;
      case 'system_alert': return AlertTriangle;
      default: return Activity;
    }
  };
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600">MMG Properties Platform Control Center</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemMetrics.systemHealth === 'healthy' ? 'bg-green-500' :
              systemMetrics.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm font-medium ${getHealthColor(systemMetrics.systemHealth)}`}>
              System {systemMetrics.systemHealth}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/admin/users">
                <Users className="w-4 h-4 mr-1" />
                User Management
              </Link>
            </Button>
            
            <Button size="sm" variant="outline" asChild>
              <Link href="/admin/system">
                <Settings className="w-4 h-4 mr-1" />
                System Settings
              </Link>
            </Button>
          </div>
          
          <Select value={currency} onValueChange={(value: 'USD' | 'ZWL') => setCurrency(value)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="ZWL">ZWL</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedTimeRange} onValueChange={(value: '24h' | '7d' | '30d') => setSelectedTimeRange(value)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">{systemMetrics.totalProperties}</div>
                <p className="text-xs text-muted-foreground">{systemMetrics.totalUnits} units</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold">{systemMetrics.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Active accounts</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(convertCurrency(systemMetrics.monthlyRevenue), currency)}
                </div>
                <p className="text-xs text-muted-foreground">Monthly total</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">Overall rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agentLocations.filter(agent => agent.workStatus !== 'offline').length}
            </div>
            <p className="text-xs text-muted-foreground">Active now</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenance Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Maintenance Requests</CardTitle>
            <CardDescription>Latest requests requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                id: 1,
                title: "Leaking faucet in Unit A2",
                property: "Sunset Apartments",
                priority: "high",
                status: "pending",
              },
              {
                id: 2,
                title: "Broken AC in Unit B5",
                property: "Downtown Complex",
                priority: "medium",
                status: "in_progress",
              },
              {
                id: 3,
                title: "Electrical issue in lobby",
                property: "Garden View",
                priority: "high",
                status: "pending",
              },
              {
                id: 4,
                title: "Painting request for Unit C1",
                property: "Riverside Homes",
                priority: "low",
                status: "completed",
              },
            ].map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{request.title}</p>
                  <p className="text-sm text-muted-foreground">{request.property}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      request.priority === "high"
                        ? "destructive"
                        : request.priority === "medium"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {request.priority}
                  </Badge>
                  <Badge
                    variant={
                      request.status === "completed"
                        ? "default"
                        : request.status === "in_progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {request.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                    {request.status === "in_progress" && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {request.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {request.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Property Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>Occupancy rates by property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Sunset Apartments", occupancy: 95, units: "19/20" },
              { name: "Downtown Complex", occupancy: 88, units: "22/25" },
              { name: "Garden View", occupancy: 92, units: "11/12" },
              { name: "Riverside Homes", occupancy: 85, units: "17/20" },
            ].map((property) => (
              <div key={property.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{property.name}</span>
                  <span className="text-muted-foreground">{property.units} occupied</span>
                </div>
                <Progress value={property.occupancy} className="h-2" />
                <div className="text-right text-sm text-muted-foreground">{property.occupancy}%</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col" asChild>
                <Link href="/properties/new">
                  <Building2 className="w-6 h-6 mb-2" />
                  Add Property
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent" asChild>
                <Link href="/tenants/new">
                  <Users className="w-6 h-6 mb-2" />
                  Add Tenant
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent" asChild>
                <Link href="/maintenance/new">
                  <Wrench className="w-6 h-6 mb-2" />
                  Create Request
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent" asChild>
                <Link href="/reports">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  Generate Report
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-green-600" />
                <span className="text-sm">Database</span>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Online
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm">Firebase</span>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm">Security</span>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Agent Tracking</span>
              </div>
              <Badge variant="secondary">
                {agentLocations.filter(agent => agent.workStatus !== 'offline').length} Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Tools</CardTitle>
          <CardDescription>System management and monitoring tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-16 flex-col" asChild>
              <Link href="/admin/users">
                <Users className="w-5 h-5 mb-1" />
                <span className="text-xs">User Management</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col" asChild>
              <Link href="/properties">
                <Building2 className="w-5 h-5 mb-1" />
                <span className="text-xs">Properties</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col" asChild>
              <Link href="/financials">
                <DollarSign className="w-5 h-5 mb-1" />
                <span className="text-xs">Financials</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col" asChild>
              <Link href="/analytics">
                <BarChart3 className="w-5 h-5 mb-1" />
                <span className="text-xs">Analytics</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col" asChild>
              <Link href="/admin/system">
                <Settings className="w-5 h-5 mb-1" />
                <span className="text-xs">Settings</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col" asChild>
              <Link href="/admin/agent-tracking">
                <Map className="w-5 h-5 mb-1" />
                <span className="text-xs">Agent Tracking</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
