'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Phone, 
  Mail,
  MapPin,
  Briefcase,
  Shield,
  Calendar,
  FileText,
  DollarSign,
  Wrench,
  Edit,
  AlertCircle,
  Home,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Tenant } from '@/lib/types';
import { getTenant } from '@/lib/services/tenants';
import { getLeasesByTenant } from '@/lib/services/leases';
import { getTenantPaymentHistory, getTenantMaintenanceRequests } from '@/lib/services/tenants';

interface TenantProfileProps {
  tenantId: string;
}

export default function TenantProfile({ tenantId }: TenantProfileProps) {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [leaseHistory, setLeaseHistory] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTenantData();
  }, [tenantId]);

  const loadTenantData = async () => {
    setLoading(true);
    setError('');

    try {
      // Load tenant details
      const tenantData = await getTenant(tenantId);
      if (!tenantData) {
        setError('Tenant not found');
        return;
      }
      setTenant(tenantData);

      // Load lease history
      const leases = await getLeasesByTenant(tenantId);
      setLeaseHistory(leases);

      // Load payment history (placeholder for now)
      const payments = await getTenantPaymentHistory(tenantId);
      setPaymentHistory(payments);

      // Load maintenance requests (placeholder for now)
      const requests = await getTenantMaintenanceRequests(tenantId);
      setMaintenanceRequests(requests);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      notice_period: 'bg-yellow-100 text-yellow-800',
      former: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Active',
      notice_period: 'Notice Period',
      former: 'Former',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTenantInitials = (tenant: Tenant) => {
    const name = tenant.personalInfo.emergencyContact.name || 'Tenant';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getLeaseStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      notice_given: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
                <Skeleton className="h-6 w-20 mt-2" />
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-6 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Tenant not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentLease = leaseHistory.find(lease => lease.status === 'active');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Tenant Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-medium">
                  {getTenantInitials(tenant)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {tenant.personalInfo.emergencyContact.name || 'Tenant Profile'}
                </h1>
                <p className="text-muted-foreground">
                  ID: {tenant.personalInfo.idNumber}
                </p>
                <Badge className={`mt-2 ${getStatusColor(tenant.status)}`}>
                  {getStatusLabel(tenant.status)}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              {(user?.role === 'admin' || user?.role === 'agent') && (
                <>
                  <Button variant="outline" asChild>
                    <Link href={`/tenants/${tenant.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                  {tenant.status === 'active' && (
                    <Button asChild>
                      <Link href={`/leases/new?tenantId=${tenant.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        New Lease
                      </Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Home className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Current Unit</p>
                <p className="text-2xl font-bold">
                  {tenant.currentUnit ? `Unit ${tenant.currentUnit}` : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Total Leases</p>
                <p className="text-2xl font-bold">{leaseHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-yellow-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Current Rent</p>
                <p className="text-2xl font-bold">
                  {currentLease ? `$${currentLease.terms.rentAmount}` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wrench className="h-4 w-4 text-orange-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Maintenance Requests</p>
                <p className="text-2xl font-bold">{maintenanceRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="leases">Lease History</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID Number</label>
                  <p className="font-medium">{tenant.personalInfo.idNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                  <p className="font-medium">{tenant.personalInfo.nationality}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                  <p className="font-medium">{tenant.personalInfo.occupation}</p>
                </div>
                {tenant.personalInfo.employer && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employer</label>
                    <p className="font-medium">{tenant.personalInfo.employer}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{tenant.personalInfo.emergencyContact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="font-medium">{tenant.personalInfo.emergencyContact.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                  <p className="font-medium capitalize">{tenant.personalInfo.emergencyContact.relationship}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lease History Tab */}
        <TabsContent value="leases">
          <Card>
            <CardHeader>
              <CardTitle>Lease History</CardTitle>
              <CardDescription>
                All lease agreements for this tenant
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaseHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No lease history</h3>
                  <p className="text-gray-600">This tenant has no lease agreements yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaseHistory.map((lease) => (
                    <div key={lease.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Badge className={getLeaseStatusColor(lease.status)}>
                              {lease.status.replace('_', ' ')}
                            </Badge>
                            <span className="font-medium">
                              {format(lease.dates.startDate.toDate(), 'MMM dd, yyyy')} - {format(lease.dates.endDate.toDate(), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Rent: {lease.terms.currency} {lease.terms.rentAmount.toLocaleString()}/{lease.terms.paymentFrequency}
                            {lease.terms.depositAmount > 0 && ` • Deposit: ${lease.terms.currency} ${lease.terms.depositAmount.toLocaleString()}`}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/leases/${lease.id}`}>
                            View Details
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

        {/* Payment History Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Payment record and transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment history coming soon</h3>
                <p className="text-gray-600">
                  Payment tracking will be available in the next phase of development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
              <CardDescription>
                Maintenance and repair request history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Maintenance tracking coming soon</h3>
                <p className="text-gray-600">
                  Maintenance request tracking will be available in the next phase of development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}