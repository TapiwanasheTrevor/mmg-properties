'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  FileText, 
  DollarSign,
  Calendar,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

interface TenantDetailsProps {
  tenantId: string;
}

export default function TenantDetails({ tenantId }: TenantDetailsProps) {
  const router = useRouter();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockTenant = {
      id: tenantId,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+263 77 123 4567',
      emergencyContact: {
        name: 'Jane Smith',
        phone: '+263 77 987 6543',
        relationship: 'Sister'
      },
      idNumber: '12345678901',
      dateOfBirth: '1985-03-15',
      nationality: 'Zimbabwean',
      address: {
        street: '123 Main Street',
        city: 'Harare',
        postalCode: '10001',
        country: 'Zimbabwe'
      },
      status: 'active',
      createdAt: '2024-01-15',
      currentLease: {
        id: 'lease1',
        unitId: 'unit1',
        unitNumber: 'A101',
        propertyName: 'Sunset Apartments',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        monthlyRent: 1200,
        deposit: 2400,
        status: 'active'
      },
      paymentHistory: [
        {
          id: '1',
          date: '2024-01-01',
          amount: 1200,
          type: 'rent',
          status: 'paid',
          method: 'bank_transfer'
        },
        {
          id: '2',
          date: '2024-02-01',
          amount: 1200,
          type: 'rent',
          status: 'paid',
          method: 'cash'
        },
        {
          id: '3',
          date: '2024-03-01',
          amount: 1200,
          type: 'rent',
          status: 'pending',
          method: 'bank_transfer'
        }
      ],
      documents: [
        {
          id: '1',
          name: 'ID Copy',
          type: 'identification',
          uploadDate: '2024-01-15'
        },
        {
          id: '2',
          name: 'Lease Agreement',
          type: 'lease',
          uploadDate: '2024-01-15'
        }
      ]
    };
    
    setTimeout(() => {
      setTenant(mockTenant);
      setLoading(false);
    }, 1000);
  }, [tenantId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Tenant Not Found</h2>
        <p className="text-gray-600 mt-2">The tenant you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => router.push('/tenants')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tenants
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {tenant.firstName} {tenant.lastName}
            </h1>
            <p className="text-gray-600">{tenant.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(tenant.status)}>
            {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
          </Badge>
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/tenants/${tenantId}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${tenant.currentLease?.monthlyRent?.toLocaleString() || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lease Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenant.currentLease?.status || 'No Lease'}
            </div>
            <p className="text-xs text-muted-foreground">current lease</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unit</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenant.currentLease?.unitNumber || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">{tenant.currentLease?.propertyName || 'No property'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenant Since</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(tenant.createdAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">join date</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="lease">Current Lease</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Primary contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{tenant.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{tenant.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">
                      {tenant.address.street}, {tenant.address.city}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Identity and personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{tenant.firstName} {tenant.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Number</p>
                  <p className="font-medium">{tenant.idNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(tenant.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{tenant.nationality}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Emergency contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{tenant.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{tenant.emergencyContact.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Relationship</p>
                  <p className="font-medium">{tenant.emergencyContact.relationship}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lease" className="space-y-4">
          {tenant.currentLease ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Lease</CardTitle>
                <CardDescription>Active lease information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Property</p>
                      <p className="font-medium">{tenant.currentLease.propertyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unit</p>
                      <p className="font-medium">{tenant.currentLease.unitNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Rent</p>
                      <p className="font-medium text-green-600">${tenant.currentLease.monthlyRent.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Lease Start</p>
                      <p className="font-medium">{new Date(tenant.currentLease.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lease End</p>
                      <p className="font-medium">{new Date(tenant.currentLease.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Security Deposit</p>
                      <p className="font-medium">${tenant.currentLease.deposit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Lease</h3>
                <p className="text-gray-600 mb-4">This tenant doesn't have an active lease.</p>
                <Button asChild>
                  <Link href="/leases/new">
                    Create Lease
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Recent payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenant.paymentHistory.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} Payment
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString()} • {payment.method.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${payment.amount.toLocaleString()}</p>
                      <Badge variant="outline" className={getPaymentStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Uploaded tenant documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenant.documents.map((document: any) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {document.type} • Uploaded {new Date(document.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}