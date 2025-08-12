'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  MapPin,
  Calendar,
  Phone,
  Mail,
  Eye
} from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { usePropertyDashboard, useRealtimeProperties } from '@/hooks/useRealtimeProperties';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

interface OwnerDashboardProps {
  className?: string;
}

export default function OwnerDashboard({ className }: OwnerDashboardProps) {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<'USD' | 'ZWL'>('USD');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  
  // Real-time dashboard data
  const { dashboardData, loading: dashboardLoading, error } = usePropertyDashboard(user?.id || '');
  const { properties, loading: propertiesLoading } = useRealtimeProperties(user?.id);

  // Currency conversion rates (in a real app, fetch from API)
  const exchangeRate = 1320; // 1 USD = 1320 ZWL (example rate)
  
  const convertCurrency = (amount: number) => {
    if (currency === 'ZWL') {
      return amount * exchangeRate;
    }
    return amount;
  };

  const formatAmount = (amount: number) => {
    const converted = convertCurrency(amount);
    return formatCurrency(converted, currency);
  };

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading dashboard data. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Portfolio</h1>
          <p className="text-gray-600">Welcome back, {user?.profile.firstName}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={currency} onValueChange={(value: 'USD' | 'ZWL') => setCurrency(value)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="ZWL">ZWL</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Owner Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardData.totalProperties}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.totalUnits} total units
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatAmount(dashboardData.monthlyIncome)}
                </div>
                <p className="text-xs text-green-600">
                  Rate: 1 USD = {exchangeRate.toLocaleString()} ZWL
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardData.occupiedUnits}/{dashboardData.totalUnits}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((dashboardData.occupiedUnits / dashboardData.totalUnits) * 100)}% occupancy
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-8 w-8" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardData.pendingMaintenance}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.pendingMaintenance > 0 ? 'Require attention' : 'All resolved'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>Property Portfolio</CardTitle>
            <CardDescription>Your properties and their performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {propertiesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No properties found</p>
                <Link href="/properties/new">
                  <Button className="mt-4">Add Your First Property</Button>
                </Link>
              </div>
            ) : (
              properties.map((property) => {
                const occupancyRate = property.totalUnits > 0 
                  ? Math.round((property.occupiedUnits / property.totalUnits) * 100) 
                  : 0;
                
                return (
                  <div key={property.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{property.name}</h4>
                          <Link href={`/properties/${property.id}`}>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.location?.city}, Zimbabwe
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {property.totalUnits} units • Type: {property.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatAmount(property.monthlyIncome || 0)}/mo
                        </p>
                        <Badge
                          variant={
                            occupancyRate >= 90 ? "default" : 
                            occupancyRate >= 70 ? "secondary" : "destructive"
                          }
                        >
                          {occupancyRate}% occupied
                        </Badge>
                      </div>
                    </div>
                    <Progress value={occupancyRate} className="h-2" />
                    
                    {/* Agent Contact */}
                    {property.agentInfo && (
                      <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
                        <p>Agent: {property.agentInfo.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {property.agentInfo.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {property.agentInfo.email}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Skeleton className="w-2 h-2 rounded-full mt-2" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            ) : dashboardData.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              dashboardData.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "payment"
                        ? "bg-green-500"
                        : activity.type === "maintenance"
                          ? "bg-yellow-500"
                          : activity.type === "lease"
                            ? "bg-blue-500"
                            : "bg-purple-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.createdAt)} • {activity.propertyName}
                    </p>
                  </div>
                  {activity.amount && (
                    <Badge variant="outline" className="text-green-600">
                      {formatAmount(activity.amount)}
                    </Badge>
                  )}
                  {activity.status && (
                    <Badge 
                      variant={
                        activity.status === 'completed' ? 'default' :
                        activity.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {activity.status}
                    </Badge>
                  )}
                </div>
              ))
            )}
            
            {/* Quick Actions */}
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <Link href="/maintenance">
                  <Button variant="outline" size="sm">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    View All Issues ({dashboardData.pendingMaintenance})
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="outline" size="sm">
                    <Mail className="w-3 h-3 mr-1" />
                    Messages
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Income and expenses overview for this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(dashboardData.monthlyIncome)}
                </div>
                <p className="text-sm text-muted-foreground">Total Income</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatAmount(dashboardData.monthlyExpenses || 0)}
                </div>
                <p className="text-sm text-muted-foreground">Expenses</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatAmount((dashboardData.monthlyIncome || 0) - (dashboardData.monthlyExpenses || 0))}
                </div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <Link href="/financials/reports">
                <Button>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Detailed Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/properties/new" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Add New Property
              </Button>
            </Link>
            <Link href="/tenants" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Manage Tenants
              </Button>
            </Link>
            <Link href="/maintenance" className="block">
              <Button className="w-full justify-start" variant="outline">
                <AlertCircle className="w-4 h-4 mr-2" />
                Maintenance Requests
              </Button>
            </Link>
            <Link href="/financials" className="block">
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Financial Reports
              </Button>
            </Link>
            <Link href="/messages" className="block">
              <Button className="w-full justify-start" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </Link>
            
            {/* Emergency Contact */}
            <div className="pt-3 border-t text-center">
              <p className="text-xs text-muted-foreground mb-2">Emergency Contact</p>
              <Button variant="destructive" size="sm" className="w-full">
                <Phone className="w-3 h-3 mr-1" />
                +263 123 456 789
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
