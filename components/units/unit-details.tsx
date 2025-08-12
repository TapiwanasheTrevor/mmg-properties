'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Square, 
  Users, 
  DollarSign, 
  Edit, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  Wrench
} from 'lucide-react';
import Link from 'next/link';

interface UnitDetailsProps {
  unitId: string;
}

export default function UnitDetails({ unitId }: UnitDetailsProps) {
  const router = useRouter();
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock unit data - replace with Firebase/API call
    const mockUnit = {
      id: unitId,
      propertyId: 'prop1',
      propertyName: 'Sunset Apartments',
      unitNumber: 'A101',
      type: '2br',
      status: 'occupied',
      squareFootage: 850,
      monthlyRent: 1200,
      isOccupied: true,
      currentTenant: {
        id: 'tenant1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+263 77 123 4567',
        idNumber: '12345678901',
        leaseStart: '2024-01-01',
        leaseEnd: '2024-12-31'
      },
      amenities: ['AC', 'Parking', 'Balcony', 'Dishwasher'],
      description: 'Spacious 2-bedroom apartment with modern amenities',
      images: [
        '/placeholder.svg?height=300&width=400',
        '/placeholder.svg?height=300&width=400'
      ],
      maintenanceHistory: [
        {
          id: '1',
          title: 'Fixed leaking faucet',
          date: '2024-01-15',
          status: 'completed',
          cost: 150
        },
        {
          id: '2',
          title: 'AC maintenance',
          date: '2024-02-10',
          status: 'completed',
          cost: 200
        }
      ]
    };
    
    setTimeout(() => {
      setUnit(mockUnit);
      setLoading(false);
    }, 1000);
  }, [unitId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 text-green-800';
      case 'vacant': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'studio': return 'Studio';
      case '1br': return '1 Bedroom';
      case '2br': return '2 Bedroom';
      case '3br': return '3 Bedroom';
      case '4br+': return '4+ Bedroom';
      case 'commercial': return 'Commercial';
      default: return type;
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

  if (!unit) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Unit Not Found</h2>
        <p className="text-gray-600 mt-2">The unit you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => router.push('/units')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Units
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
            <h1 className="text-3xl font-bold text-gray-900">Unit {unit.unitNumber}</h1>
            <p className="text-gray-600">{unit.propertyName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(unit.status)}>
            {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
          </Badge>
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/units/${unitId}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
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
              ${unit.monthlyRent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Size</CardTitle>
            <Square className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unit.squareFootage}</div>
            <p className="text-xs text-muted-foreground">sq ft</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
            <Square className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTypeDisplay(unit.type)}</div>
            <p className="text-xs text-muted-foreground">unit type</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unit.isOccupied ? 'Occupied' : 'Vacant'}</div>
            <p className="text-xs text-muted-foreground">current status</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tenant">Current Tenant</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Unit Information</CardTitle>
                <CardDescription>Basic unit details and specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Unit Number</p>
                    <p className="font-medium">{unit.unitNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Property</p>
                    <p className="font-medium">{unit.propertyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{getTypeDisplay(unit.type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium">{unit.squareFootage} sq ft</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{unit.description}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Amenities</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {unit.amenities.map((amenity: string) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
                <CardDescription>Rental and financial details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <p className="font-medium text-green-600">${unit.monthlyRent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price per sq ft</p>
                  <p className="font-medium">${(unit.monthlyRent / unit.squareFootage).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual Rent</p>
                  <p className="font-medium">${(unit.monthlyRent * 12).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(unit.status)}>
                    {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tenant" className="space-y-4">
          {unit.currentTenant ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Tenant</CardTitle>
                <CardDescription>Tenant information and lease details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{unit.currentTenant.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ID Number</p>
                      <p className="font-medium">{unit.currentTenant.idNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{unit.currentTenant.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{unit.currentTenant.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Lease Start</p>
                      <p className="font-medium">{new Date(unit.currentTenant.leaseStart).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lease End</p>
                      <p className="font-medium">{new Date(unit.currentTenant.leaseEnd).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Current Tenant</h3>
                <p className="text-gray-600 mb-4">This unit is currently vacant.</p>
                <Button asChild>
                  <Link href="/tenants/new">
                    Add Tenant
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>Past maintenance requests and repairs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unit.maintenanceHistory.map((maintenance: any) => (
                  <div key={maintenance.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Wrench className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{maintenance.title}</p>
                        <p className="text-sm text-muted-foreground">{new Date(maintenance.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${maintenance.cost}</p>
                      <Badge variant="default">
                        {maintenance.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unit Images</CardTitle>
              <CardDescription>Photos and visual documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unit.images.map((image: string, index: number) => (
                  <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Unit ${unit.unitNumber} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
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