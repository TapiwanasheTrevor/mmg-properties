'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Square, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  DollarSign, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Building,
  MapPin
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface Unit {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  type: 'studio' | '1br' | '2br' | '3br' | '4br+' | 'commercial';
  status: 'occupied' | 'vacant' | 'maintenance' | 'reserved';
  squareFootage: number;
  monthlyRent: number;
  isOccupied: boolean;
  currentTenant?: {
    name: string;
    email: string;
    phone: string;
  };
  amenities: string[];
}

export default function UnitsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [units, setUnits] = useState<Unit[]>([]);

  // Mock data - replace with Firebase/API calls
  useEffect(() => {
    const mockUnits: Unit[] = [
      {
        id: '1',
        propertyId: 'prop1',
        propertyName: 'Sunset Apartments',
        unitNumber: 'A101',
        type: '2br',
        status: 'occupied',
        squareFootage: 850,
        monthlyRent: 1200,
        isOccupied: true,
        currentTenant: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+263 77 123 4567'
        },
        amenities: ['AC', 'Parking', 'Balcony']
      },
      {
        id: '2',
        propertyId: 'prop1',
        propertyName: 'Sunset Apartments',
        unitNumber: 'A102',
        type: '1br',
        status: 'vacant',
        squareFootage: 650,
        monthlyRent: 900,
        isOccupied: false,
        amenities: ['AC', 'Parking']
      },
      {
        id: '3',
        propertyId: 'prop2',
        propertyName: 'Downtown Lofts',
        unitNumber: 'L301',
        type: '3br',
        status: 'maintenance',
        squareFootage: 1100,
        monthlyRent: 1500,
        isOccupied: false,
        amenities: ['AC', 'Parking', 'Balcony', 'City View']
      },
      {
        id: '4',
        propertyId: 'prop2',
        propertyName: 'Downtown Lofts',
        unitNumber: 'L302',
        type: '2br',
        status: 'reserved',
        squareFootage: 900,
        monthlyRent: 1300,
        isOccupied: false,
        amenities: ['AC', 'Parking', 'City View']
      }
    ];
    setUnits(mockUnits);
  }, []);

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

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.currentTenant?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    const matchesType = typeFilter === 'all' || unit.type === typeFilter;
    const matchesProperty = propertyFilter === 'all' || unit.propertyId === propertyFilter;

    return matchesSearch && matchesStatus && matchesType && matchesProperty;
  });

  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'occupied').length;
  const vacantUnits = units.filter(u => u.status === 'vacant').length;
  const maintenanceUnits = units.filter(u => u.status === 'maintenance').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const totalRent = units.filter(u => u.status === 'occupied').reduce((sum, u) => sum + u.monthlyRent, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Units Management</h1>
          <p className="text-gray-600">Manage and track all property units</p>
        </div>
        
        <Button asChild>
          <Link href="/units/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Square className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">Across all properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{occupiedUnits}</div>
            <p className="text-xs text-muted-foreground">{occupancyRate}% occupancy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant</CardTitle>
            <Square className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{vacantUnits}</div>
            <p className="text-xs text-muted-foreground">Available for rent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Square className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{maintenanceUnits}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From occupied units</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Units</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search units, properties, tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="1br">1 Bedroom</SelectItem>
                <SelectItem value="2br">2 Bedroom</SelectItem>
                <SelectItem value="3br">3 Bedroom</SelectItem>
                <SelectItem value="4br+">4+ Bedroom</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="prop1">Sunset Apartments</SelectItem>
                <SelectItem value="prop2">Downtown Lofts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnits.map((unit) => (
          <Card key={unit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{unit.unitNumber}</CardTitle>
                <Badge className={getStatusColor(unit.status)}>
                  {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                </Badge>
              </div>
              <CardDescription className="flex items-center">
                <Building className="w-4 h-4 mr-1" />
                {unit.propertyName}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{getTypeDisplay(unit.type)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">{unit.squareFootage} sq ft</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monthly Rent</p>
                  <p className="font-medium text-green-600">${unit.monthlyRent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}</p>
                </div>
              </div>

              {unit.currentTenant && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Current Tenant</p>
                  <p className="text-sm text-gray-600">{unit.currentTenant.name}</p>
                  <p className="text-xs text-gray-500">{unit.currentTenant.email}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {unit.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/units/${unit.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </Button>
                
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/units/${unit.id}/edit`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Mark as Vacant</DropdownMenuItem>
                    <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                    <DropdownMenuItem>View History</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUnits.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Square className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No units found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || propertyFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first unit.'}
            </p>
            {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && propertyFilter === 'all' && (
              <Button asChild>
                <Link href="/units/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Unit
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}