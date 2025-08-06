'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText,
  Calendar,
  Clock,
  Users,
  Download,
  Send,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Settings,
  Eye,
  Archive,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import {
  ScheduledReport,
  GeneratedReport,
  createScheduledReport,
  getScheduledReports,
  updateScheduledReport,
  deleteScheduledReport,
  generateReport,
  getGeneratedReports,
  getReportStatistics
} from '@/lib/services/report-generator';

export default function ReportsManager() {
  const { user } = useAuth();
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('scheduled');
  const [showNewReport, setShowNewReport] = useState(false);
  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);

  // Form states
  const [scheduledReportForm, setScheduledReportForm] = useState({
    name: '',
    description: '',
    reportType: 'portfolio' as const,
    frequency: 'monthly' as const,
    recipients: [{ email: '', name: '', role: '' }],
    settings: {
      includeCharts: true,
      includeRawData: false,
      dateRange: 'last_month' as const,
      format: 'pdf' as const,
    },
    schedule: {
      dayOfMonth: 1,
      time: '09:00',
      timezone: 'UTC',
    },
    isActive: true,
  });

  const [generateReportForm, setGenerateReportForm] = useState({
    name: '',
    reportType: 'portfolio' as const,
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    includeCharts: true,
    includeRawData: false,
    format: 'pdf' as const,
    recipients: [''],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scheduled, generated, stats] = await Promise.all([
        getScheduledReports(),
        getGeneratedReports(undefined, undefined, 50),
        getReportStatistics()
      ]);
      
      setScheduledReports(scheduled);
      setGeneratedReports(generated);
      setStatistics(stats);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScheduledReport = async () => {
    if (!user) return;
    
    setSaving(true);
    setError('');
    
    try {
      await createScheduledReport(scheduledReportForm, user.id, user.name);
      setSuccess('Scheduled report created successfully!');
      setShowNewReport(false);
      resetScheduledReportForm();
      await loadData();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateScheduledReport = async () => {
    if (!user || !editingReport) return;
    
    setSaving(true);
    setError('');
    
    try {
      await updateScheduledReport(editingReport.id, scheduledReportForm, user.id);
      setSuccess('Scheduled report updated successfully!');
      setEditingReport(null);
      setShowNewReport(false);
      await loadData();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScheduledReport = async (reportId: string) => {
    if (!user || !confirm('Are you sure you want to delete this scheduled report?')) return;
    
    try {
      await deleteScheduledReport(reportId, user.id);
      setSuccess('Scheduled report deleted successfully!');
      await loadData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleToggleReportStatus = async (reportId: string, isActive: boolean) => {
    if (!user) return;
    
    try {
      await updateScheduledReport(reportId, { isActive: !isActive }, user.id);
      setSuccess(`Report ${!isActive ? 'activated' : 'deactivated'} successfully!`);
      await loadData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGenerateReport = async () => {
    if (!user) return;
    
    setSaving(true);
    setError('');
    
    try {
      const dateRange = {
        start: new Date(generateReportForm.dateRange.start),
        end: new Date(generateReportForm.dateRange.end),
      };
      
      const recipients = generateReportForm.recipients.filter(email => email.trim() !== '');
      
      await generateReport(
        generateReportForm.reportType,
        {
          name: generateReportForm.name,
          dateRange,
          includeCharts: generateReportForm.includeCharts,
          includeRawData: generateReportForm.includeRawData,
          format: generateReportForm.format,
          recipients: recipients.length > 0 ? recipients : undefined,
        },
        user.id,
        user.name
      );
      
      setSuccess('Report generated successfully!');
      setShowGenerateReport(false);
      resetGenerateReportForm();
      await loadData();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const resetScheduledReportForm = () => {
    setScheduledReportForm({
      name: '',
      description: '',
      reportType: 'portfolio',
      frequency: 'monthly',
      recipients: [{ email: '', name: '', role: '' }],
      settings: {
        includeCharts: true,
        includeRawData: false,
        dateRange: 'last_month',
        format: 'pdf',
      },
      schedule: {
        dayOfMonth: 1,
        time: '09:00',
        timezone: 'UTC',
      },
      isActive: true,
    });
  };

  const resetGenerateReportForm = () => {
    setGenerateReportForm({
      name: '',
      reportType: 'portfolio',
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      includeCharts: true,
      includeRawData: false,
      format: 'pdf',
      recipients: [''],
    });
  };

  const addRecipient = () => {
    setScheduledReportForm(prev => ({
      ...prev,
      recipients: [...prev.recipients, { email: '', name: '', role: '' }]
    }));
  };

  const removeRecipient = (index: number) => {
    setScheduledReportForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateRecipient = (index: number, field: string, value: string) => {
    setScheduledReportForm(prev => ({
      ...prev,
      recipients: prev.recipients.map((recipient, i) => 
        i === index ? { ...recipient, [field]: value } : recipient
      )
    }));
  };

  const editScheduledReport = (report: ScheduledReport) => {
    setEditingReport(report);
    setScheduledReportForm({
      name: report.name,
      description: report.description,
      reportType: report.reportType,
      frequency: report.frequency,
      recipients: report.recipients,
      settings: report.settings,
      schedule: report.schedule,
      isActive: report.isActive,
    });
    setShowNewReport(true);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      generating: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      sent: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getFrequencyColor = (frequency: string) => {
    const colors = {
      daily: 'bg-blue-100 text-blue-800',
      weekly: 'bg-green-100 text-green-800',
      monthly: 'bg-purple-100 text-purple-800',
      quarterly: 'bg-orange-100 text-orange-800',
    };
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports Manager</h2>
          <p className="text-muted-foreground">
            Generate and schedule automated reports for your property portfolio
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowGenerateReport(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button onClick={() => setShowNewReport(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Report
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scheduled Reports</p>
                  <p className="text-2xl font-bold">{statistics.totalScheduled}</p>
                  <p className="text-xs text-muted-foreground">
                    {statistics.activeScheduled} active
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Generated Reports</p>
                  <p className="text-2xl font-bold">{statistics.totalGenerated}</p>
                  <p className="text-xs text-muted-foreground">
                    {statistics.recentlyGenerated} in last 24h
                  </p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Most Popular</p>
                  <p className="text-xl font-bold">
                    {Object.entries(statistics.byType).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.totalGenerated > 0 
                      ? Math.round(((statistics.byStatus.completed || 0) + (statistics.byStatus.sent || 0)) / statistics.totalGenerated * 100)
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scheduled">Scheduled Reports ({scheduledReports.length})</TabsTrigger>
          <TabsTrigger value="generated">Generated Reports ({generatedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledReports.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-muted-foreground">No scheduled reports yet</p>
                  <Button className="mt-2" onClick={() => setShowNewReport(true)}>
                    Create your first scheduled report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {scheduledReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getFrequencyColor(report.frequency)}>
                          {report.frequency}
                        </Badge>
                        <Badge variant={report.isActive ? 'default' : 'secondary'}>
                          {report.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Report Type:</strong> {report.reportType.replace('_', ' ').toUpperCase()}
                      </div>
                      <div>
                        <strong>Next Run:</strong> {format(report.nextRun.toDate(), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div>
                        <strong>Recipients:</strong> {report.recipients.length}
                      </div>
                    </div>

                    {report.lastRun && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <strong>Last Run:</strong> {format(report.lastRun.toDate(), 'MMM dd, yyyy HH:mm')}
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleReportStatus(report.id, report.isActive)}
                      >
                        {report.isActive ? (
                          <>
                            <Pause className="w-3 h-3 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editScheduledReport(report)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteScheduledReport(report.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="generated" className="space-y-4">
          {generatedReports.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-muted-foreground">No generated reports yet</p>
                  <Button className="mt-2" onClick={() => setShowGenerateReport(true)}>
                    Generate your first report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {generatedReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.reportType.replace('_', ' ').toUpperCase()} Report
                        </p>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <strong>Generated:</strong> {format(report.generatedAt.toDate(), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div>
                        <strong>By:</strong> {report.generatedByName}
                      </div>
                      <div>
                        <strong>Records:</strong> {report.metadata.recordCount.toLocaleString()}
                      </div>
                      <div>
                        <strong>Processing:</strong> {(report.metadata.processingTime / 1000).toFixed(2)}s
                      </div>
                    </div>

                    {report.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Error:</strong> {report.errorMessage}
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-4">
                      {report.fileUrls.pdf && (
                        <Button variant="outline" size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          PDF
                        </Button>
                      )}
                      {report.fileUrls.csv && (
                        <Button variant="outline" size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          CSV
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule Report Modal */}
      {showNewReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingReport ? 'Edit Scheduled Report' : 'Create Scheduled Report'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input
                    value={scheduledReportForm.name}
                    onChange={(e) => setScheduledReportForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Weekly Portfolio Report"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select
                    value={scheduledReportForm.reportType}
                    onValueChange={(value) => setScheduledReportForm(prev => ({ ...prev, reportType: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portfolio">Portfolio Overview</SelectItem>
                      <SelectItem value="financial">Financial Performance</SelectItem>
                      <SelectItem value="tenant">Tenant Analytics</SelectItem>
                      <SelectItem value="maintenance">Maintenance Analytics</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={scheduledReportForm.description}
                  onChange={(e) => setScheduledReportForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this report covers..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={scheduledReportForm.frequency}
                    onValueChange={(value) => setScheduledReportForm(prev => ({ ...prev, frequency: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scheduledReportForm.frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label>Day of Month</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={scheduledReportForm.schedule.dayOfMonth}
                      onChange={(e) => setScheduledReportForm(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, dayOfMonth: parseInt(e.target.value) || 1 }
                      }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduledReportForm.schedule.time}
                    onChange={(e) => setScheduledReportForm(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, time: e.target.value }
                    }))}
                  />
                </div>
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Recipients</Label>
                  <Button variant="outline" size="sm" onClick={addRecipient}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Recipient
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {scheduledReportForm.recipients.map((recipient, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Input
                          placeholder="Email"
                          value={recipient.email}
                          onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Name"
                          value={recipient.name}
                          onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Role"
                          value={recipient.role}
                          onChange={(e) => updateRecipient(index, 'role', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRecipient(index)}
                          disabled={scheduledReportForm.recipients.length === 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select
                    value={scheduledReportForm.settings.dateRange}
                    onValueChange={(value) => setScheduledReportForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, dateRange: value as any }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="last_quarter">Last Quarter</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select
                    value={scheduledReportForm.settings.format}
                    onValueChange={(value) => setScheduledReportForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, format: value as any }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Only</SelectItem>
                      <SelectItem value="csv">CSV Only</SelectItem>
                      <SelectItem value="both">Both PDF & CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeCharts"
                    checked={scheduledReportForm.settings.includeCharts}
                    onChange={(e) => setScheduledReportForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, includeCharts: e.target.checked }
                    }))}
                  />
                  <Label htmlFor="includeCharts">Include Charts</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeRawData"
                    checked={scheduledReportForm.settings.includeRawData}
                    onChange={(e) => setScheduledReportForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, includeRawData: e.target.checked }
                    }))}
                  />
                  <Label htmlFor="includeRawData">Include Raw Data</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={scheduledReportForm.isActive}
                    onChange={(e) => setScheduledReportForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewReport(false);
                    setEditingReport(null);
                    resetScheduledReportForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={editingReport ? handleUpdateScheduledReport : handleCreateScheduledReport}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingReport ? 'Update Report' : 'Create Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input
                  value={generateReportForm.name}
                  onChange={(e) => setGenerateReportForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Monthly Portfolio Report - March 2024"
                />
              </div>

              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select
                  value={generateReportForm.reportType}
                  onValueChange={(value) => setGenerateReportForm(prev => ({ ...prev, reportType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portfolio">Portfolio Overview</SelectItem>
                    <SelectItem value="financial">Financial Performance</SelectItem>
                    <SelectItem value="tenant">Tenant Analytics</SelectItem>
                    <SelectItem value="maintenance">Maintenance Analytics</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={generateReportForm.dateRange.start}
                    onChange={(e) => setGenerateReportForm(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={generateReportForm.dateRange.end}
                    onChange={(e) => setGenerateReportForm(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={generateReportForm.format}
                  onValueChange={(value) => setGenerateReportForm(prev => ({ ...prev, format: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Only</SelectItem>
                    <SelectItem value="csv">CSV Only</SelectItem>
                    <SelectItem value="both">Both PDF & CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="genIncludeCharts"
                    checked={generateReportForm.includeCharts}
                    onChange={(e) => setGenerateReportForm(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  />
                  <Label htmlFor="genIncludeCharts">Include Charts</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="genIncludeRawData"
                    checked={generateReportForm.includeRawData}
                    onChange={(e) => setGenerateReportForm(prev => ({ ...prev, includeRawData: e.target.checked }))}
                  />
                  <Label htmlFor="genIncludeRawData">Include Raw Data</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowGenerateReport(false);
                    resetGenerateReportForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleGenerateReport} disabled={saving}>
                  {saving ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}