'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  Home, 
  DollarSign, 
  Calendar, 
  Edit, 
  RefreshCw,
  Download,
  Mail,
  Phone
} from 'lucide-react';
import Link from 'next/link';

interface LeaseDetailsProps {
  leaseId: string;
}

export default function LeaseDetails({ leaseId }: LeaseDetailsProps) {
  const router = useRouter();
  const [lease, setLease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock lease data - replace with Firebase/API call
    const mockLease = {
      id: leaseId,
      tenantId: 'tenant123',
      unitId: 'unit456',
      propertyName: 'Sunset Apartments',
      unitNumber: 'A101',
      tenant: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+263 77 123 4567',
        idNumber: '12345678901'
      },
      dates: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        signedDate: new Date('2023-12-15')
      },
      terms: {
        rentAmount: 1200,
        currency: 'USD',
        paymentFrequency: 'monthly',
        securityDeposit: 2400,
        lateFeePenalty: 50
      },
      status: 'active',
      documents: [
        { name: 'Lease Agreement.pdf', url: '#', uploadDate: '2023-12-15' },
        { name: 'Property Inspection.pdf', url: '#', uploadDate: '2023-12-20' }
      ],
      paymentHistory: [
        { month: 'November 2024', amount: 1200, status: 'paid', date: '2024-11-01' },
        { month: 'October 2024', amount: 1200, status: 'paid', date: '2024-10-01' },
        { month: 'September 2024', amount: 1200, status: 'paid', date: '2024-09-01' }
      ]
    };
    
    setTimeout(() => {
      setLease(mockLease);
      setLoading(false);
    }, 1000);
  }, [leaseId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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

  if (!lease) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Lease Not Found</h2>
        <p className="text-gray-600 mt-2">The lease you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => router.push('/leases')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leases
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lease Details</h1>
            <p className="text-gray-600">{lease.propertyName} - Unit {lease.unitNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(lease.status)}>
            {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
          </Badge>
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/leases/${leaseId}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          
          <Button size="sm" asChild>
            <Link href={`/leases/${leaseId}/renew`}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Renew
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {lease.terms.currency} {lease.terms.rentAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{lease.terms.paymentFrequency}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Deposit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lease.terms.currency} {lease.terms.securityDeposit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Refundable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lease Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">Until expiry</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tenant">Tenant Info</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lease Terms</CardTitle>
                <CardDescription>Financial and contract details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                    <p className="font-medium">{lease.terms.currency} {lease.terms.rentAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Security Deposit</p>
                    <p className="font-medium">{lease.terms.currency} {lease.terms.securityDeposit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Late Fee</p>
                    <p className="font-medium">{lease.terms.currency} {lease.terms.lateFeePenalty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Frequency</p>
                    <p className="font-medium capitalize">{lease.terms.paymentFrequency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Important Dates</CardTitle>
                <CardDescription>Lease timeline and milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Lease Start Date</p>
                  <p className="font-medium">{formatDate(lease.dates.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lease End Date</p>
                  <p className="font-medium">{formatDate(lease.dates.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Signed Date</p>
                  <p className="font-medium">{formatDate(lease.dates.signedDate)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tenant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Information</CardTitle>
              <CardDescription>Contact details and personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{lease.tenant.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID Number</p>
                    <p className="font-medium">{lease.tenant.idNumber}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{lease.tenant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{lease.tenant.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Recent rent payments and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lease.paymentHistory.map((payment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.month}</p>
                      <p className="text-sm text-muted-foreground">Due: {payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{lease.terms.currency} {payment.amount.toLocaleString()}</p>
                      <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'}>
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
              <CardTitle>Lease Documents</CardTitle>
              <CardDescription>Contract documents and attachments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lease.documents.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">Uploaded: {doc.uploadDate}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
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