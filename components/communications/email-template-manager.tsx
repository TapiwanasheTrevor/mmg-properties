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
  Mail, 
  Plus,
  Edit,
  Eye,
  Copy,
  Trash2,
  Send,
  Settings,
  AlertCircle,
  CheckCircle,
  FileText,
  MessageSquare,
  Users,
  Calendar,
  Wrench,
  Home,
  CreditCard,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  EmailTemplate,
  EmailNotification,
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  getEmailNotifications,
  sendEmailNotification,
  processEmailTemplate
} from '@/lib/services/email-templates';

export default function EmailTemplateManager() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('templates');
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendTest, setShowSendTest] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
  });
  
  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: 'general' as const,
    subject: '',
    htmlContent: '',
    textContent: '',
    variables: [] as any[],
    isActive: true,
  });
  
  const [testEmailForm, setTestEmailForm] = useState({
    recipientEmail: user?.email || '',
    recipientName: user?.name || '',
    testVariables: {} as Record<string, any>,
  });
  
  const [previewVariables, setPreviewVariables] = useState({} as Record<string, any>);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesResult, notificationsResult] = await Promise.all([
        getEmailTemplates(),
        getEmailNotifications({ limit: 50 })
      ]);
      
      setTemplates(templatesResult);
      setNotifications(notificationsResult);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!user) return;
    
    setSaving(true);
    setError('');
    
    try {
      await createEmailTemplate({
        ...templateForm,
        isSystem: false,
        createdBy: user.id,
        createdByName: user.name,
      });
      
      setSuccess('Email template created successfully!');
      setShowNewTemplate(false);
      setTemplateForm({
        name: '',
        description: '',
        category: 'general',
        subject: '',
        htmlContent: '',
        textContent: '',
        variables: [],
        isActive: true,
      });
      await loadData();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!user || !selectedTemplate) return;
    
    setSaving(true);
    setError('');
    
    try {
      await updateEmailTemplate(selectedTemplate.id, templateForm, user.id);
      setSuccess('Email template updated successfully!');
      await loadData();
      
      // Refresh selected template
      const updatedTemplate = await getEmailTemplate(selectedTemplate.id);
      setSelectedTemplate(updatedTemplate);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!user || !selectedTemplate) return;
    
    try {
      await sendEmailNotification(
        selectedTemplate.id,
        testEmailForm.recipientEmail,
        testEmailForm.recipientName,
        testEmailForm.testVariables,
        {
          category: 'test',
          priority: 'low',
        },
        user.id
      );
      
      setSuccess('Test email sent successfully!');
      setShowSendTest(false);
      await loadData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    
    // Initialize preview variables with default values
    const defaultVariables: Record<string, any> = {};
    template.variables.forEach(variable => {
      defaultVariables[variable.name] = variable.defaultValue || `[${variable.label}]`;
    });
    setPreviewVariables(defaultVariables);
    setShowPreview(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      category: template.category,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      variables: template.variables,
      isActive: template.isActive,
    });
    setShowNewTemplate(true);
  };

  const addVariable = () => {
    setTemplateForm(prev => ({
      ...prev,
      variables: [
        ...prev.variables,
        { name: '', label: '', description: '', required: true, defaultValue: '' }
      ]
    }));
  };

  const updateVariable = (index: number, field: string, value: any) => {
    setTemplateForm(prev => ({
      ...prev,
      variables: prev.variables.map((variable, i) => 
        i === index ? { ...variable, [field]: value } : variable
      )
    }));
  };

  const removeVariable = (index: number) => {
    setTemplateForm(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      notification: MessageSquare,
      reminder: Calendar,
      welcome: Users,
      maintenance: Wrench,
      lease: Home,
      payment: CreditCard,
      inspection: FileText,
      general: Mail,
    };
    const Icon = icons[category as keyof typeof icons] || Mail;
    return <Icon className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      notification: 'bg-blue-100 text-blue-800',
      reminder: 'bg-orange-100 text-orange-800',
      welcome: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      lease: 'bg-purple-100 text-purple-800',
      payment: 'bg-red-100 text-red-800',
      inspection: 'bg-indigo-100 text-indigo-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      bounced: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredTemplates = templates.filter(template => {
    if (filters.search && !template.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !template.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.category && template.category !== filters.category) {
      return false;
    }
    
    return true;
  });

  const filteredNotifications = notifications.filter(notification => {
    if (filters.search && !notification.subject.toLowerCase().includes(filters.search.toLowerCase()) &&
        !notification.recipientEmail.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.status && notification.status !== filters.status) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Email Templates & Communications</h2>
          <p className="text-muted-foreground">
            Manage email templates and view communication history
          </p>
        </div>
        <Button onClick={() => setShowNewTemplate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Email Templates ({templates.length})</TabsTrigger>
          <TabsTrigger value="notifications">Email History ({notifications.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search templates..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="lease">Lease</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Badge className={getCategoryColor(template.category)}>
                        {getCategoryIcon(template.category)}
                        <span className="ml-1">{template.category}</span>
                      </Badge>
                      {template.isSystem && (
                        <Badge variant="outline">System</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <strong>Subject:</strong> {template.subject}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Variables: {template.variables.length} | 
                      Created: {format(template.createdAt.toDate(), 'MMM dd, yyyy')}
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        
                        {!template.isSystem && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                      
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Mail className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-muted-foreground">No templates found</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search emails..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="bounced">Bounced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{notification.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        To: {notification.recipientName} ({notification.recipientEmail})
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(notification.status)}>
                        {notification.status.toUpperCase()}
                      </Badge>
                      <Badge className={getCategoryColor(notification.metadata.category)}>
                        {notification.metadata.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong>Sent:</strong> {format(notification.createdAt.toDate(), 'MMM dd, yyyy HH:mm')}
                    </div>
                    {notification.sentAt && (
                      <div>
                        <strong>Delivered:</strong> {format(notification.sentAt.toDate(), 'MMM dd, yyyy HH:mm')}
                      </div>
                    )}
                    <div>
                      <strong>Priority:</strong> {notification.metadata.priority}
                    </div>
                  </div>
                  
                  {notification.errorMessage && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Error:</strong> {notification.errorMessage}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredNotifications.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Mail className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-muted-foreground">No email notifications found</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* New/Edit Template Modal */}
      {showNewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedTemplate ? 'Edit Email Template' : 'Create New Email Template'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={templateForm.category}
                    onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="lease">Lease</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this template"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject (use {{variable}} for dynamic content)"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>HTML Content</Label>
                  <Textarea
                    value={templateForm.htmlContent}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, htmlContent: e.target.value }))}
                    placeholder="HTML email content"
                    rows={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Text Content</Label>
                  <Textarea
                    value={templateForm.textContent}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, textContent: e.target.value }))}
                    placeholder="Plain text email content"
                    rows={8}
                  />
                </div>
              </div>
              
              {/* Variables Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Variables</Label>
                  <Button variant="outline" size="sm" onClick={addVariable}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Variable
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {templateForm.variables.map((variable, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-3">
                        <Input
                          placeholder="Variable name"
                          value={variable.name}
                          onChange={(e) => updateVariable(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Display label"
                          value={variable.label}
                          onChange={(e) => updateVariable(index, 'label', e.target.value)}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          placeholder="Description"
                          value={variable.description}
                          onChange={(e) => updateVariable(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={variable.required}
                          onChange={(e) => updateVariable(index, 'required', e.target.checked)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariable(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={templateForm.isActive}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <Label htmlFor="isActive">Template is active</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : selectedTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Preview: {selectedTemplate.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedTemplate(selectedTemplate);
                      setShowSendTest(true);
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Test
                  </Button>
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Variable inputs for preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable.name} className="space-y-2">
                    <Label>{variable.label}</Label>
                    <Input
                      placeholder={variable.description}
                      value={previewVariables[variable.name] || ''}
                      onChange={(e) => setPreviewVariables(prev => ({
                        ...prev,
                        [variable.name]: e.target.value
                      }))}
                    />
                  </div>
                ))}
              </div>
              
              {/* Preview content */}
              <div className="space-y-4">
                <div>
                  <Label>Subject</Label>
                  <div className="p-3 bg-gray-50 rounded border">
                    {processEmailTemplate(selectedTemplate, previewVariables).subject}
                  </div>
                </div>
                
                <div>
                  <Label>HTML Preview</Label>
                  <div 
                    className="p-4 bg-white border rounded max-h-96 overflow-y-auto"
                    dangerouslySetInnerHTML={{ 
                      __html: processEmailTemplate(selectedTemplate, previewVariables).htmlContent 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Send Test Email Modal */}
      {showSendTest && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input
                  type="email"
                  value={testEmailForm.recipientEmail}
                  onChange={(e) => setTestEmailForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  placeholder="test@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input
                  value={testEmailForm.recipientName}
                  onChange={(e) => setTestEmailForm(prev => ({ ...prev, recipientName: e.target.value }))}
                  placeholder="Test User"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Test Variables (JSON format)</Label>
                <Textarea
                  value={JSON.stringify(testEmailForm.testVariables, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setTestEmailForm(prev => ({ ...prev, testVariables: parsed }));
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  placeholder='{"tenantName": "John Doe", "propertyName": "Test Property"}'
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSendTest(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendTestEmail}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}