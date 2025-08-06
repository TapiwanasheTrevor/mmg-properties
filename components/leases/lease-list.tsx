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
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Users,
  Home,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Lease, LeaseStatus } from '@/lib/types';
import { getLeases, deleteLease } from '@/lib/services/leases';

interface LeaseListProps {
  onLeaseSelect?: (leaseId: string) => void;
}

export default function LeaseList({ onLeaseSelect }: LeaseListProps) {
  const { user } = useAuth();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaseStatus | 'all'>('all');

  useEffect(() => {
    loadLeases();
  }, [user, statusFilter]);

  const loadLeases = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const filters: any = {};

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const result = await getLeases(filters);
      setLeases(result.leases);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLease = async (leaseId: string) => {
    if (!confirm('Are you sure you want to delete this lease? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteLease(leaseId);
      setLeases(prev => prev.filter(l => l.id !== leaseId));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const filteredLeases = leases.filter(lease => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return lease.tenantId.toLowerCase().includes(searchLower) ||
           lease.unitId.toLowerCase().includes(searchLower);
  });

  const getStatusColor = (status: LeaseStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      notice_given: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const getStatusLabel = (status: LeaseStatus) => {
    const labels = {
      draft: 'Draft',
      active: 'Active',
      notice_given: 'Notice Given',
      expired: 'Expired',
      terminated: 'Terminated',
    };
    return labels[status];
  };

  if (loading && leases.length === 0) {
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
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-16" />
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
          <h1 className="text-3xl font-bold tracking-tight">Lease Agreements</h1>
          <p className="text-muted-foreground">
            Manage lease agreements and tenant relationships ({leases.length} leases)
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'agent') && (
          <Button asChild>
            <Link href="/leases/new">
              <Plus className="mr-2 h-4 w-4" />
              New Lease
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
                  placeholder="Search by tenant or unit..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LeaseStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="notice_given">Notice Given</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leases Grid */}
      {filteredLeases.length === 0 && !loading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leases found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No leases match your search criteria.' : 'Get started by creating your first lease agreement.'}
            </p>
            {(user?.role === 'admin' || user?.role === 'agent') && !searchTerm && (
              <Button asChild>
                <Link href="/leases/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Lease
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeases.map((lease) => (
            <Card key={lease.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Lease Agreement</h3>
                      <p className="text-sm text-muted-foreground">ID: {lease.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(lease.status)}>
                      {getStatusLabel(lease.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/leases/${lease.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {(user?.role === 'admin' || user?.role === 'agent') && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/leases/${lease.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteLease(lease.id)}
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
                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Tenant: {lease.tenantId.slice(0, 8)}...</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Home className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Unit: {lease.unitId.slice(0, 8)}...</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{lease.terms.currency} {lease.terms.rentAmount.toLocaleString()}/{lease.terms.paymentFrequency}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>
                      {format(lease.dates.startDate.toDate(), 'MMM dd, yyyy')} - {format(lease.dates.endDate.toDate(), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onLeaseSelect?.(lease.id)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <div className="space-x-2">
                      {lease.status === 'active' && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/leases/${lease.id}/renew`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            Renew
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

      {loading && leases.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Loading more leases...
          </div>
        </div>
      )}
    </div>
  );
}