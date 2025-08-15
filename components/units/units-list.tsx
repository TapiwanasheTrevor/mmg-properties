'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Square, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign, 
  MapPin,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { Unit, UnitStatus, UnitType } from '@/lib/types';
import { 
  getUnitsByProperty, 
  deleteUnit, 
  getUnitsByStatus,
  getVacantUnits,
  getOccupiedUnits 
} from '@/lib/services/units';
import { getProperties } from '@/lib/services/properties';

interface Property {
  id: string;
  name: string;
}

export default function UnitsList() {
  const { user } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUnitsAndProperties();
  }, [user, statusFilter, propertyFilter]);

  const loadUnitsAndProperties = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Load properties first
      const propertiesResult = await getProperties();
      setProperties(propertiesResult.properties);

      // Load units based on filters
      let unitsResult: Unit[] = [];
      
      if (propertyFilter !== 'all') {
        unitsResult = await getUnitsByProperty(propertyFilter);
      } else if (statusFilter !== 'all') {
        unitsResult = await getUnitsByStatus(statusFilter);
      } else {
        // Load all units from all properties
        const allUnits: Unit[] = [];
        for (const property of propertiesResult.properties) {
          const propertyUnits = await getUnitsByProperty(property.id);
          allUnits.push(...propertyUnits);
        }
        unitsResult = allUnits;
      }

      setUnits(unitsResult);
    } catch (error: any) {
      setError(error.message);
      console.error('Error loading units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return;

    setDeleting(true);
    try {
      await deleteUnit(unitToDelete.id);
      
      // Remove from local state
      setUnits(prev => prev.filter(unit => unit.id !== unitToDelete.id));
      
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
    } catch (error: any) {
      setError(`Failed to delete unit: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (unit: Unit) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = searchTerm === '' || 
      unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.tenantId && searchTerm.toLowerCase().includes('tenant'));

    return matchesSearch;
  });

  const getStatusColor = (status: UnitStatus) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 text-green-800';
      case 'vacant': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: UnitType) => {
    switch (type) {
      case 'studio': return 'Studio';
      case '1br': return '1 Bedroom';
      case '2br': return '2 Bedroom';
      case '3br': return '3 Bedroom';
      case '4br': return '4 Bedroom';
      case '5br': return '5+ Bedroom';
      case 'commercial': return 'Commercial';
      default: return type;
    }
  };

  // Calculate stats
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'occupied').length;
  const vacantUnits = units.filter(u => u.status === 'vacant').length;
  const maintenanceUnits = units.filter(u => u.status === 'maintenance').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const totalRent = units
    .filter(u => u.status === 'occupied')
    .reduce((sum, u) => sum + u.monthlyRent, 0);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UnitStatus | 'all')}>
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

            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by property" />
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
        </CardContent>
      </Card>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnits.map((unit) => (
          <Card key={unit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Unit {unit.unitNumber}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {properties.find(p => p.id === unit.propertyId)?.name || 'Unknown Property'}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/units/${unit.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/units/${unit.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Unit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => openDeleteDialog(unit)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Unit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <Badge className={getStatusColor(unit.status)}>
                  {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                </Badge>
                <span className="text-sm font-medium">{getTypeLabel(unit.type)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Monthly Rent</span>
                  <div className="font-semibold text-green-600">
                    ${unit.monthlyRent.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Square Ft</span>
                  <div className="font-semibold">
                    {unit.squareFootage?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              </div>

              {unit.status === 'occupied' && unit.tenantId && (
                <div className="pt-2 border-t">
                  <span className="text-sm text-gray-600">Current Tenant</span>
                  <div className="text-sm font-medium">Tenant ID: {unit.tenantId}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUnits.length === 0 && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <Square className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No units found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || propertyFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by adding your first unit.'}
            </p>
            <Button asChild>
              <Link href="/units/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete unit {unitToDelete?.unitNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUnit}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Unit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}