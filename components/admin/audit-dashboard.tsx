'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle,
  Activity,
  Users,
  Eye,
  Search,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { AuditLog, AuditAction, getAuditLogs, getAuditStats } from '@/lib/security/audit-logger';

export default function AuditDashboard() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditStats, setAuditStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7_days');
  const [showFailuresOnly, setShowFailuresOnly] = useState(false);

  useEffect(() => {
    loadAuditData();
  }, [selectedAction, selectedResource, selectedUser, dateRange, showFailuresOnly]);

  const loadAuditData = async () => {
    setLoading(true);
    setError('');

    try {
      const { dateFrom, dateTo } = getDateRangeFilter(dateRange);
      
      // Load audit logs
      const logs = await getAuditLogs({
        action: selectedAction !== 'all' ? selectedAction as AuditAction : undefined,
        resource: selectedResource !== 'all' ? selectedResource : undefined,
        userId: selectedUser !== 'all' ? selectedUser : undefined,
        dateFrom,
        dateTo,
        successOnly: showFailuresOnly ? false : undefined,
        pageSize: 100,
      });

      // Filter out failures if showing failures only
      const filteredLogs = showFailuresOnly ? logs.filter(log => !log.success) : logs;
      setAuditLogs(filteredLogs);

      // Load audit statistics
      const stats = await getAuditStats(dateFrom, dateTo);
      setAuditStats(stats);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeFilter = (range: string) => {
    const now = new Date();
    
    switch (range) {
      case '1_day':
        return { dateFrom: startOfDay(now), dateTo: endOfDay(now) };
      case '7_days':
        return { dateFrom: subDays(now, 7), dateTo: now };
      case '30_days':
        return { dateFrom: subDays(now, 30), dateTo: now };
      case '90_days':
        return { dateFrom: subDays(now, 90), dateTo: now };
      default:
        return { dateFrom: subDays(now, 7), dateTo: now };
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('terminate')) {
      return 'bg-red-100 text-red-800';
    }
    if (action.includes('create') || action.includes('record')) {
      return 'bg-green-100 text-green-800';
    }
    if (action.includes('update') || action.includes('assign')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (action.includes('access') || action.includes('export')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getResourceIcon = (resource: string) => {
    const icons = {
      user: Users,
      property: Shield,
      transaction: BarChart3,
      maintenance: AlertTriangle,
      tenant: Users,
      lease: FileText,
      report: BarChart3,
    };
    const Icon = icons[resource as keyof typeof icons] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const exportAuditLogs = () => {
    const csvContent = [
      'Timestamp,User ID,Role,Action,Resource,Resource ID,Success,Details',
      ...auditLogs.map(log => [
        format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss'),
        log.userId,
        log.userRole,
        log.action,
        log.resource,
        log.resourceId,
        log.success ? 'Success' : 'Failed',
        JSON.stringify(log.details).replace(/,/g, ';') // Replace commas to avoid CSV issues
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredLogs = auditLogs.filter(log => 
    searchTerm === '' || 
    log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resourceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !auditStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Audit Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor system activity and security events
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadAuditData}>
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportAuditLogs}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {auditStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{auditStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{auditStats.successful}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{auditStats.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-purple-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{auditStats.topUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Audit Logs ({filteredLogs.length})</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="security">Security Analysis</TabsTrigger>
        </TabsList>

        {/* Audit Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                {/* Action Filter */}
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="user_login">User Login</SelectItem>
                      <SelectItem value="transaction_create">Transaction Create</SelectItem>
                      <SelectItem value="property_update">Property Update</SelectItem>
                      <SelectItem value="data_export">Data Export</SelectItem>
                      <SelectItem value="sensitive_data_access">Sensitive Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Resource Filter */}
                <div className="space-y-2">
                  <Label>Resource</Label>
                  <Select value={selectedResource} onValueChange={setSelectedResource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      <SelectItem value="user">Users</SelectItem>
                      <SelectItem value="transaction">Transactions</SelectItem>
                      <SelectItem value="property">Properties</SelectItem>
                      <SelectItem value="tenant">Tenants</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_day">Today</SelectItem>
                      <SelectItem value="7_days">Last 7 Days</SelectItem>
                      <SelectItem value="30_days">Last 30 Days</SelectItem>
                      <SelectItem value="90_days">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Failures Only */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={showFailuresOnly ? 'failures' : 'all'} 
                    onValueChange={(value) => setShowFailuresOnly(value === 'failures')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="failures">Failures Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" onClick={loadAuditData}>
                    <Filter className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Events</CardTitle>
              <CardDescription>
                Detailed log of all system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit logs found</h3>
                  <p className="text-gray-600">No events match your current filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`border rounded-lg p-4 ${
                        !log.success ? 'border-red-200 bg-red-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getActionColor(log.action)}>
                              {getResourceIcon(log.resource)}
                              <span className="ml-1">{log.action.replace('_', ' ')}</span>
                            </Badge>
                            <Badge variant="outline">
                              {log.resource}
                            </Badge>
                            <Badge className={log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {log.success ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                              {log.success ? 'Success' : 'Failed'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">User</p>
                              <p className="font-medium">{log.userId}</p>
                              <p className="text-xs text-muted-foreground">{log.userRole}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Resource ID</p>
                              <p className="font-mono text-xs">{log.resourceId}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Timestamp</p>
                              <p className="font-medium">{format(log.timestamp.toDate(), 'PPp')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">IP Address</p>
                              <p className="font-mono text-xs">{log.ipAddress || 'N/A'}</p>
                            </div>
                          </div>
                          
                          {log.error && (
                            <div className="mt-3 p-2 bg-red-100 rounded text-sm text-red-800">
                              Error: {log.error}
                            </div>
                          )}
                          
                          {Object.keys(log.details).length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-1">Details:</p>
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          {auditStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditStats.topActions.map((item: any, index: number) => (
                      <div key={item.action} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">{item.action.replace('_', ' ')}</span>
                        </div>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditStats.topUsers.map((item: any, index: number) => (
                      <div key={item.userId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs flex items-center justify-center font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">{item.userId}</span>
                        </div>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Security Analysis Tab */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Recent Failures</CardTitle>
                <CardDescription>Security events that failed</CardDescription>
              </CardHeader>
              <CardContent>
                {auditStats?.recentFailures.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
                    <p className="text-sm text-muted-foreground">No recent failures</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditStats?.recentFailures.slice(0, 5).map((log: AuditLog) => (
                      <div key={log.id} className="border border-red-200 rounded p-3 bg-red-50">
                        <div className="flex items-center justify-between mb-1">
                          <Badge className="bg-red-100 text-red-800">{log.action}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(log.timestamp.toDate(), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{log.userId}</p>
                        {log.error && (
                          <p className="text-xs text-red-600 mt-1">{log.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">Security Recommendations</CardTitle>
                <CardDescription>Suggested security improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border rounded p-3">
                    <h4 className="font-medium text-sm mb-1">Failed Login Monitoring</h4>
                    <p className="text-xs text-muted-foreground">
                      Monitor for repeated failed login attempts from the same IP address.
                    </p>
                  </div>
                  <div className="border rounded p-3">
                    <h4 className="font-medium text-sm mb-1">Sensitive Data Access</h4>
                    <p className="text-xs text-muted-foreground">
                      Review all sensitive data access events for unusual patterns.
                    </p>
                  </div>
                  <div className="border rounded p-3">
                    <h4 className="font-medium text-sm mb-1">Data Export Tracking</h4>
                    <p className="text-xs text-muted-foreground">
                      All data exports should be logged and reviewed regularly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
