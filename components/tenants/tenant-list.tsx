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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Phone,
  Mail,
  MapPin,
  Briefcase,
  AlertCircle,
  MoreHorizontal,
  Home,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tenant, TenantStatus } from '@/lib/types';
import { getTenants, deleteTenant, searchTenants } from '@/lib/services/tenants';

interface TenantListProps {
  onTenantSelect?: (tenantId: string) => void;
}

export default function TenantList({ onTenantSelect }: TenantListProps) {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all');

  useEffect(() => {
    loadTenants();
  }, [user, statusFilter]);

  const loadTenants = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const filters: any = {};

      // Apply status filter
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const result = await getTenants(filters);
      setTenants(result.tenants);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadTenants();
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchTenants(searchTerm);
      setTenants(searchResults);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTenant(tenantId);
      setTenants(prev => prev.filter(t => t.id !== tenantId));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getStatusColor = (status: TenantStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      notice_period: 'bg-yellow-100 text-yellow-800',
      former: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const getStatusLabel = (status: TenantStatus) => {
    const labels = {
      active: 'Active',
      notice_period: 'Notice Period', 
      former: 'Former',
    };
    return labels[status];
  };

  const getTenantInitials = (tenant: Tenant) => {
    // Since we don't have direct access to user name in tenant record,
    // we'll use emergency contact name as fallback
    const name = tenant.personalInfo.emergencyContact.name || 'Tenant';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  if (loading && tenants.length === 0) {
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
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
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
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">
            Manage tenant profiles and information ({tenants.length} tenants)
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <Button asChild>
            <Link href="/tenants/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
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
                  placeholder="Search by ID number, occupation, or emergency contact..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TenantStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="notice_period">Notice Period</SelectItem>
                <SelectItem value="former">Former</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Grid */}
      {tenants.length === 0 && !loading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenants found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No tenants match your search criteria.' : 'Get started by adding your first tenant.'}
            </p>
            {(user?.role === 'admin' || user?.role === 'agent') && !searchTerm && (
              <Button asChild>
                <Link href="/tenants/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tenant
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-sm font-medium">
                        {getTenantInitials(tenant)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {tenant.personalInfo.emergencyContact.name || 'Tenant'}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        ID: {tenant.personalInfo.idNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(tenant.status)}>
                      {getStatusLabel(tenant.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tenants/${tenant.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        {(user?.role === 'admin' || user?.role === 'agent') && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/tenants/${tenant.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTenant(tenant.id)}
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
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {tenant.personalInfo.occupation}
                      {tenant.personalInfo.employer && ` at ${tenant.personalInfo.employer}`}
                    </span>
                  </div>
                  
                  {tenant.currentUnit && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Unit: {tenant.currentUnit}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {tenant.personalInfo.emergencyContact.phone}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onTenantSelect?.(tenant.id)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <div className="space-x-2">
                      {tenant.status === 'active' && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tenants/${tenant.id}/lease`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            Lease
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading && tenants.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading more tenants...
          </div>
        </div>
      )}
    </div>
  );
}