'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
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
import { Property, PropertyType, PropertyStatus } from '@/lib/types';
import { getProperties, deleteProperty, searchProperties } from '@/lib/services/properties';

interface PropertyListProps {
  onPropertySelect?: (propertyId: string) => void;
}

export default function PropertyList({ onPropertySelect }: PropertyListProps) {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');

  useEffect(() => {
    loadProperties();
  }, [user, typeFilter, statusFilter]);

  const loadProperties = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const filters: any = {};

      // Apply role-based filtering
      if (user.role === 'owner') {
        filters.ownerId = user.id;
      } else if (user.role === 'agent') {
        filters.assignedAgentId = user.id;
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        filters.type = typeFilter;
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const result = await getProperties(filters);
      setProperties(result.properties);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadProperties();
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchProperties(searchTerm);
      setProperties(searchResults);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProperty(propertyId);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getStatusColor = (status: PropertyStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const getTypeLabel = (type: PropertyType) => {
    const labels = {
      house: 'Single House',
      apartment_complex: 'Apartment Complex',
      commercial: 'Commercial',
      mixed_use: 'Mixed Use',
    };
    return labels[type];
  };

  const calculateOccupancyRate = (property: Property) => {
    if (property.totalUnits === 0) return 0;
    return Math.round((property.occupiedUnits / property.totalUnits) * 100);
  };

  if (loading && properties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between pt-4">
                    <Skeleton className="h-8 w-16" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">
            Manage your property portfolio ({properties.length} properties)
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'owner') && (
          <Button asChild>
            <Link href="/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search properties by name..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as PropertyType | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="house">Single House</SelectItem>
                <SelectItem value="apartment_complex">Apartment Complex</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="mixed_use">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PropertyStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      {properties.length === 0 && !loading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No properties match your search criteria.' : 'Get started by adding your first property.'}
            </p>
            {(user?.role === 'admin' || user?.role === 'owner') && !searchTerm && (
              <Button asChild>
                <Link href="/properties/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{property.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {property.address.suburb}, {property.address.city}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Badge className={getStatusColor(property.status)}>
                      {property.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/properties/${property.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {(user?.role === 'admin' || user?.role === 'owner') && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/properties/${property.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProperty(property.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{getTypeLabel(property.type)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      Occupancy:
                    </span>
                    <span className="font-medium">
                      {property.occupiedUnits}/{property.totalUnits} units
                      <span className="text-muted-foreground ml-1">
                        ({calculateOccupancyRate(property)}%)
                      </span>
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Monthly Income:
                    </span>
                    <span className="font-medium text-green-600">
                      ${(property.monthlyIncome || 0).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onPropertySelect?.(property.id)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/properties/${property.id}/units`}>
                          <Building2 className="w-3 h-3 mr-1" />
                          Units
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading && properties.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading more properties...
          </div>
        </div>
      )}
    </div>
  );
}