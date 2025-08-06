'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  User,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  InspectionReport,
  getInspectionReports,
  getInspectionStatistics
} from '@/lib/services/inspections';
import InspectionReportComponent from '@/components/inspections/inspection-report';

export default function InspectionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const [showNewInspection, setShowNewInspection] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    inspectionType: '',
    condition: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  // Check if user has access to inspections
  if (!['admin', 'agent'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage inspections.</p>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const [inspectionsResult, statisticsResult] = await Promise.all([
        getInspectionReports({
          status: filters.status || undefined,
          inspectionType: filters.inspectionType as any || undefined,
          pageSize: 50,
        }),
        getInspectionStatistics()
      ]);
      
      setInspections(inspectionsResult.reports);
      setStatistics(statisticsResult);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredInspections = inspections.filter(inspection => {
    if (filters.search && !inspection.purpose.toLowerCase().includes(filters.search.toLowerCase()) &&
        !inspection.inspector.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.condition && inspection.overallCondition !== filters.condition) {
      return false;
    }
    
    if (filters.dateFrom) {
      const inspectionDate = inspection.scheduledDate.toDate();
      const fromDate = new Date(filters.dateFrom);
      if (inspectionDate < fromDate) return false;
    }
    
    if (filters.dateTo) {
      const inspectionDate = inspection.scheduledDate.toDate();
      const toDate = new Date(filters.dateTo);
      if (inspectionDate > toDate) return false;
    }
    
    return true;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      scheduled: Calendar,
      in_progress: Clock,
      completed: CheckCircle,
      cancelled: AlertCircle,
    };
    const Icon = icons[status as keyof typeof icons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (selectedInspection) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setSelectedInspection(null)}>
            ← Back to Inspections
          </Button>
        </div>
        <InspectionReportComponent 
          inspectionId={selectedInspection}
        />
      </div>
    );
  }

  if (showNewInspection) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setShowNewInspection(false)}>
            ← Back to Inspections
          </Button>
        </div>
        <InspectionReportComponent 
          onInspectionCreated={(id) => {
            setShowNewInspection(false);
            setSelectedInspection(id);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Property Inspections</h2>
          <p className="text-muted-foreground">
            Manage property inspections and reports
          </p>
        </div>
        <Button onClick={() => setShowNewInspection(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Inspection
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Inspections</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.criticalIssues}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Follow-ups</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.pendingFollowUps.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold">{statistics.totalIssues}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search inspections..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Select value={filters.inspectionType} onValueChange={(value) => handleFilterChange('inspectionType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="move_in">Move In</SelectItem>
                  <SelectItem value="move_out">Move Out</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="damage_assessment">Damage Assessment</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="pre_listing">Pre-Listing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Select value={filters.condition} onValueChange={(value) => handleFilterChange('condition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Conditions</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="From Date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="To Date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspections List */}
      <Card>
        <CardHeader>
          <CardTitle>Inspections ({filteredInspections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInspections.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No inspections found</h3>
              <p className="text-gray-600 mb-4">Create your first property inspection.</p>
              <Button onClick={() => setShowNewInspection(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Inspection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInspections.map((inspection) => (
                <div
                  key={inspection.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedInspection(inspection.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{inspection.purpose}</h4>
                      <p className="text-sm text-muted-foreground">
                        {inspection.inspectionType.replace('_', ' ').toUpperCase()} | Property {inspection.propertyId.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(inspection.status)}>
                        {getStatusIcon(inspection.status)}
                        <span className="ml-1">{inspection.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge className={getConditionColor(inspection.overallCondition)}>
                        {inspection.overallCondition.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(inspection.scheduledDate.toDate(), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {inspection.inspector.name}
                    </div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      {inspection.areas.length} areas, {inspection.issues.length} issues
                    </div>
                  </div>
                  
                  {inspection.followUpRequired && (
                    <div className="mt-3 flex items-center text-orange-600 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Follow-up required
                      {inspection.followUpDate && (
                        <span className="ml-2">
                          by {format(inspection.followUpDate.toDate(), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInspection(inspection.id);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}