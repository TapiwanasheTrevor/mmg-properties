'use client';

import { useState, useEffect, useRef } from 'react';
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
  Camera,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Save,
  X,
  Eye,
  PenTool,
  User,
  Calendar,
  Building,
  AlertTriangle,
  Star,
  Plus,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  InspectionReport,
  InspectionArea,
  InspectionItem,
  InspectionIssue,
  InspectionType,
  createInspectionReport,
  getInspectionReport,
  updateInspectionReport,
  uploadInspectionPhoto,
  updateInspectionArea,
  updateInspectionItem,
  addInspectionIssue,
  updateInspectionIssue,
  completeInspection,
  generateInspectionReportPDF
} from '@/lib/services/inspections';

interface InspectionReportComponentProps {
  inspectionId?: string;
  propertyId?: string;
  unitId?: string;
  onInspectionCreated?: (inspectionId: string) => void;
}

export default function InspectionReportComponent({ 
  inspectionId, 
  propertyId, 
  unitId,
  onInspectionCreated 
}: InspectionReportComponentProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLCanvasElement>(null);
  
  const [inspection, setInspection] = useState<InspectionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Form states
  const [newInspectionData, setNewInspectionData] = useState({
    inspectionType: 'routine' as InspectionType,
    scheduledDate: new Date().toISOString().split('T')[0],
    purpose: '',
    inspector: {
      name: user?.name || '',
      contact: '',
    },
    tenant: {
      name: '',
      present: false,
    },
  });
  
  const [newIssue, setNewIssue] = useState({
    severity: 'medium' as const,
    category: 'maintenance' as const,
    title: '',
    description: '',
    location: '',
    estimatedCost: 0,
    priority: 5,
    requiresImmediateAttention: false,
    recommendedAction: '',
  });
  
  const [completionData, setCompletionData] = useState({
    overallCondition: 'good' as const,
    recommendations: '',
    followUpRequired: false,
    followUpDate: '',
    followUpNotes: '',
  });

  useEffect(() => {
    if (inspectionId) {
      loadInspection();
    }
  }, [inspectionId]);

  const loadInspection = async () => {
    if (!inspectionId) return;
    
    setLoading(true);
    try {
      const inspectionData = await getInspectionReport(inspectionId);
      setInspection(inspectionData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInspection = async () => {
    if (!user || !propertyId) return;
    
    setSaving(true);
    setError('');
    
    try {
      const inspectionData = {
        propertyId,
        unitId,
        inspectionType: newInspectionData.inspectionType,
        status: 'in_progress' as const,
        scheduledDate: new Date(newInspectionData.scheduledDate) as any,
        inspector: {
          id: user.id,
          name: newInspectionData.inspector.name,
          role: user.role,
          contact: newInspectionData.inspector.contact,
        },
        tenant: newInspectionData.tenant.name ? {
          id: 'unknown',
          name: newInspectionData.tenant.name,
          present: newInspectionData.tenant.present,
        } : undefined,
        purpose: newInspectionData.purpose,
        overallCondition: 'good' as const,
        recommendations: '',
        followUpRequired: false,
        reportGenerated: false,
      };
      
      const newInspectionId = await createInspectionReport(inspectionData, user.id, user.name);
      setSuccess('Inspection created successfully!');
      
      if (onInspectionCreated) {
        onInspectionCreated(newInspectionId);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAreaUpdate = async (areaId: string, updates: Partial<InspectionArea>) => {
    if (!inspection || !user) return;
    
    try {
      await updateInspectionArea(inspection.id, areaId, updates, user.id);
      await loadInspection();
      setSuccess('Area updated successfully!');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleItemUpdate = async (areaId: string, itemId: string, updates: Partial<InspectionItem>) => {
    if (!inspection || !user) return;
    
    try {
      await updateInspectionItem(inspection.id, areaId, itemId, updates, user.id);
      await loadInspection();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handlePhotoUpload = async (file: File, areaId?: string, itemId?: string) => {
    if (!inspection || !user) return;
    
    try {
      await uploadInspectionPhoto(
        inspection.id,
        file,
        { areaId, itemId, caption: '' },
        user.id
      );
      await loadInspection();
      setSuccess('Photo uploaded successfully!');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleAddIssue = async () => {
    if (!inspection || !user) return;
    
    try {
      await addInspectionIssue(inspection.id, {
        ...newIssue,
        photos: [],
      }, user.id);
      
      setNewIssue({
        severity: 'medium',
        category: 'maintenance',
        title: '',
        description: '',
        location: '',
        estimatedCost: 0,
        priority: 5,
        requiresImmediateAttention: false,
        recommendedAction: '',
      });
      setShowNewIssue(false);
      await loadInspection();
      setSuccess('Issue added successfully!');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCompleteInspection = async () => {
    if (!inspection || !user) return;
    
    try {
      await completeInspection(
        inspection.id,
        {
          ...completionData,
          followUpDate: completionData.followUpDate ? new Date(completionData.followUpDate) : undefined,
        },
        user.id
      );
      await loadInspection();
      setSuccess('Inspection completed successfully!');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGeneratePDF = async () => {
    if (!inspection || !user) return;
    
    try {
      await generateInspectionReportPDF(inspection.id, user.id);
      setSuccess('PDF report generated successfully!');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
      not_applicable: 'bg-gray-100 text-gray-800',
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inspectionId || !inspection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Inspection</CardTitle>
          <CardDescription>Schedule and conduct a property inspection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inspection Type</Label>
              <Select
                value={newInspectionData.inspectionType}
                onValueChange={(value) => setNewInspectionData(prev => ({ 
                  ...prev, 
                  inspectionType: value as InspectionType 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
              <Label>Scheduled Date</Label>
              <Input
                type="date"
                value={newInspectionData.scheduledDate}
                onChange={(e) => setNewInspectionData(prev => ({ 
                  ...prev, 
                  scheduledDate: e.target.value 
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Inspector Name</Label>
              <Input
                value={newInspectionData.inspector.name}
                onChange={(e) => setNewInspectionData(prev => ({ 
                  ...prev, 
                  inspector: { ...prev.inspector, name: e.target.value }
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Inspector Contact</Label>
              <Input
                value={newInspectionData.inspector.contact}
                onChange={(e) => setNewInspectionData(prev => ({ 
                  ...prev, 
                  inspector: { ...prev.inspector, contact: e.target.value }
                }))}
                placeholder="Phone or email"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tenant Name (Optional)</Label>
              <Input
                value={newInspectionData.tenant.name}
                onChange={(e) => setNewInspectionData(prev => ({ 
                  ...prev, 
                  tenant: { ...prev.tenant, name: e.target.value }
                }))}
                placeholder="If tenant will be present"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Textarea
                value={newInspectionData.purpose}
                onChange={(e) => setNewInspectionData(prev => ({ 
                  ...prev, 
                  purpose: e.target.value 
                }))}
                placeholder="Describe the purpose of this inspection"
              />
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
          
          <div className="flex justify-end">
            <Button onClick={handleCreateInspection} disabled={saving}>
              {saving ? 'Creating...' : 'Create Inspection'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inspection Report</h2>
          <p className="text-muted-foreground">
            {inspection.purpose} - {format(inspection.scheduledDate.toDate(), 'PPP')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getConditionColor(inspection.overallCondition)}>
            {inspection.overallCondition.toUpperCase()}
          </Badge>
          <Badge variant={inspection.status === 'completed' ? 'default' : 'secondary'}>
            {inspection.status.replace('_', ' ').toUpperCase()}
          </Badge>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="areas">Areas</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="complete">Complete</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Inspector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{inspection.inspector.name}</p>
                  <p className="text-sm text-muted-foreground">{inspection.inspector.role}</p>
                  {inspection.inspector.contact && (
                    <p className="text-sm text-muted-foreground">{inspection.inspector.contact}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {inspection.tenant && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tenant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">{inspection.tenant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {inspection.tenant.present ? 'Present during inspection' : 'Not present'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Areas:</span>
                    <span className="font-medium">{inspection.areas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Issues:</span>
                    <span className="font-medium">{inspection.issues.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Photos:</span>
                    <span className="font-medium">{inspection.photos.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {inspection.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {inspection.photos.map((photo) => (
                    <div key={photo.id} className="space-y-2">
                      <img 
                        src={photo.url} 
                        alt={photo.caption || 'Inspection photo'}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      {photo.caption && (
                        <p className="text-xs text-muted-foreground">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="areas" className="space-y-4">
          {inspection.areas.map((area) => (
            <Card key={area.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{area.name}</CardTitle>
                  <Badge className={getConditionColor(area.condition)}>
                    {area.condition.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {area.items.map((item) => (
                    <div 
                      key={item.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <Select
                          value={item.condition}
                          onValueChange={(value) => handleItemUpdate(area.id, item.id, { 
                            condition: value as any 
                          })}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="not_applicable">N/A</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Badge className={getConditionColor(item.condition)} size="sm">
                        {item.condition.replace('_', ' ').toUpperCase()}
                      </Badge>
                      
                      {item.requiresAttention && (
                        <div className="flex items-center text-orange-600 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Requires Attention
                        </div>
                      )}
                      
                      {item.notes && (
                        <p className="text-xs text-muted-foreground">{item.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file, area.id);
                    }}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Add Photo
                  </Button>
                  
                  <Select
                    value={area.condition}
                    onValueChange={(value) => handleAreaUpdate(area.id, { 
                      condition: value as any 
                    })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="issues" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Issues ({inspection.issues.length})</h3>
            <Button onClick={() => setShowNewIssue(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Issue
            </Button>
          </div>
          
          {inspection.issues.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                  <p className="text-muted-foreground">No issues found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {inspection.issues.map((issue) => (
                <Card key={issue.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{issue.title}</h4>
                        <p className="text-sm text-muted-foreground">{issue.location}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {issue.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3">{issue.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Recommended Action:</strong> {issue.recommendedAction}
                      </div>
                      {issue.estimatedCost && (
                        <div>
                          <strong>Estimated Cost:</strong> ${issue.estimatedCost}
                        </div>
                      )}
                      <div>
                        <strong>Priority:</strong> {issue.priority}/10
                      </div>
                      {issue.requiresImmediateAttention && (
                        <div className="text-red-600 font-medium">
                          ⚠️ Requires Immediate Attention
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {showNewIssue && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Issue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={newIssue.title}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Issue title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={newIssue.location}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Where is this issue located?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select
                      value={newIssue.severity}
                      onValueChange={(value) => setNewIssue(prev => ({ ...prev, severity: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newIssue.category}
                      onValueChange={(value) => setNewIssue(prev => ({ ...prev, category: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="cosmetic">Cosmetic</SelectItem>
                        <SelectItem value="structural">Structural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Estimated Cost</Label>
                    <Input
                      type="number"
                      value={newIssue.estimatedCost}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Priority (1-10)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newIssue.priority}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, priority: parseInt(e.target.value) || 5 }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newIssue.description}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the issue"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Recommended Action</Label>
                  <Textarea
                    value={newIssue.recommendedAction}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, recommendedAction: e.target.value }))}
                    placeholder="What should be done to resolve this issue?"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="immediate"
                    checked={newIssue.requiresImmediateAttention}
                    onChange={(e) => setNewIssue(prev => ({ ...prev, requiresImmediateAttention: e.target.checked }))}
                  />
                  <Label htmlFor="immediate">Requires immediate attention</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewIssue(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddIssue}>
                    Add Issue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="complete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Inspection</CardTitle>
              <CardDescription>
                Finalize the inspection with overall assessment and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Overall Condition</Label>
                  <Select
                    value={completionData.overallCondition}
                    onValueChange={(value) => setCompletionData(prev => ({ 
                      ...prev, 
                      overallCondition: value as any 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Follow-up Required</Label>
                  <Select
                    value={completionData.followUpRequired.toString()}
                    onValueChange={(value) => setCompletionData(prev => ({ 
                      ...prev, 
                      followUpRequired: value === 'true' 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {completionData.followUpRequired && (
                  <div className="space-y-2">
                    <Label>Follow-up Date</Label>
                    <Input
                      type="date"
                      value={completionData.followUpDate}
                      onChange={(e) => setCompletionData(prev => ({ 
                        ...prev, 
                        followUpDate: e.target.value 
                      }))}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Recommendations</Label>
                <Textarea
                  value={completionData.recommendations}
                  onChange={(e) => setCompletionData(prev => ({ 
                    ...prev, 
                    recommendations: e.target.value 
                  }))}
                  placeholder="Overall recommendations and summary"
                  rows={4}
                />
              </div>
              
              {completionData.followUpRequired && (
                <div className="space-y-2">
                  <Label>Follow-up Notes</Label>
                  <Textarea
                    value={completionData.followUpNotes}
                    onChange={(e) => setCompletionData(prev => ({ 
                      ...prev, 
                      followUpNotes: e.target.value 
                    }))}
                    placeholder="Notes about the follow-up required"
                    rows={3}
                  />
                </div>
              )}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleGeneratePDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF
                </Button>
                
                <Button 
                  onClick={handleCompleteInspection}
                  disabled={inspection.status === 'completed'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {inspection.status === 'completed' ? 'Completed' : 'Complete Inspection'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}