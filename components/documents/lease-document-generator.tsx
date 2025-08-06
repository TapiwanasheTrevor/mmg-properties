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
  Download,
  Send,
  Edit,
  Eye,
  Signature,
  Check,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  Building,
  PenTool,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  LeaseDocument,
  LeaseTemplate,
  generateLeaseDocument,
  getLeaseDocument,
  getLeaseDocuments,
  getLeaseTemplates,
  updateLeaseDocumentStatus,
  addSignatureToDocument,
  generateLeaseDocumentPDF,
  sendDocumentForSignature
} from '@/lib/services/lease-documents';
import { getLeases } from '@/lib/services/leases';

interface LeaseDocumentGeneratorProps {
  leaseId?: string;
  tenantId?: string;
}

export default function LeaseDocumentGenerator({ leaseId, tenantId }: LeaseDocumentGeneratorProps) {
  const { user } = useAuth();
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const [documents, setDocuments] = useState<LeaseDocument[]>([]);
  const [templates, setTemplates] = useState<LeaseTemplate[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<LeaseDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureType, setSignatureType] = useState<'tenant' | 'landlord' | 'witness'>('tenant');
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Generator form state
  const [generatorData, setGeneratorData] = useState({
    leaseId: leaseId || '',
    templateId: 'default',
    customVariables: {} as Record<string, any>,
  });
  
  // Signature form state
  const [signatureData, setSignatureData] = useState({
    signerName: '',
    witnessName: '',
    witnessContact: '',
  });

  useEffect(() => {
    loadData();
  }, [leaseId, tenantId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [documentsResult, templatesResult, leasesResult] = await Promise.all([
        getLeaseDocuments({ leaseId, tenantId }),
        getLeaseTemplates(),
        getLeases({ tenantId }),
      ]);
      
      setDocuments(documentsResult);
      setTemplates(templatesResult);
      setLeases(leasesResult.leases || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setGenerating(true);
    setError('');
    
    try {
      const documentId = await generateLeaseDocument(
        generatorData.leaseId,
        generatorData.templateId,
        generatorData.customVariables,
        user.id,
        user.name
      );
      
      setSuccess('Lease document generated successfully!');
      setShowGenerator(false);
      await loadData();
      
      // Auto-select the new document
      const newDocument = await getLeaseDocument(documentId);
      if (newDocument) {
        setSelectedDocument(newDocument);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusUpdate = async (documentId: string, newStatus: LeaseDocument['status']) => {
    if (!user) return;
    
    try {
      await updateLeaseDocumentStatus(documentId, newStatus, user.id);
      setSuccess('Document status updated successfully!');
      await loadData();
      
      // Update selected document if it's the one being updated
      if (selectedDocument && selectedDocument.id === documentId) {
        const updatedDocument = await getLeaseDocument(documentId);
        setSelectedDocument(updatedDocument);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGeneratePDF = async (documentId: string) => {
    if (!user) return;
    
    try {
      const uploadedDocumentId = await generateLeaseDocumentPDF(documentId, user.id, user.name);
      setSuccess('PDF generated and saved to documents!');
      await loadData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSendForSignature = async (documentId: string, recipientType: 'tenant' | 'landlord') => {
    if (!user) return;
    
    try {
      await sendDocumentForSignature(documentId, recipientType, user.id);
      setSuccess(`Document sent for ${recipientType} signature!`);
      await loadData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Signature canvas functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signatureRef.current) return;
    
    setIsDrawing(true);
    const canvas = signatureRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureRef.current) return;
    
    const canvas = signatureRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!signatureRef.current) return;
    
    const canvas = signatureRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = async () => {
    if (!signatureRef.current || !selectedDocument || !user) return;
    
    const canvas = signatureRef.current;
    const signatureImage = canvas.toDataURL('image/png');
    
    try {
      await addSignatureToDocument(
        selectedDocument.id,
        signatureType,
        {
          signatureImage,
          signerName: signatureData.signerName,
          witnessName: signatureData.witnessName,
          witnessContact: signatureData.witnessContact,
          ipAddress: 'unknown', // In production, get real IP
          userAgent: navigator.userAgent,
        },
        user.id
      );
      
      setSuccess('Signature added successfully!');
      setShowSignature(false);
      clearSignature();
      await loadData();
      
      // Refresh selected document
      const updatedDocument = await getLeaseDocument(selectedDocument.id);
      setSelectedDocument(updatedDocument);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending_signature: 'bg-yellow-100 text-yellow-800',
      signed: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      draft: Edit,
      pending_signature: Clock,
      signed: CheckCircle,
      expired: AlertCircle,
      cancelled: X,
    };
    const Icon = icons[status as keyof typeof icons] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lease Documents</h2>
          <p className="text-muted-foreground">
            Generate, manage, and sign lease agreements
          </p>
        </div>
        <Button onClick={() => setShowGenerator(true)}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Document
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Documents ({documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents</h3>
                  <p className="text-gray-600 mb-4">Generate your first lease document.</p>
                  <Button onClick={() => setShowGenerator(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedDocument?.id === document.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedDocument(document)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm truncate">{document.templateName}</h4>
                        <Badge className={getStatusColor(document.status)}>
                          {getStatusIcon(document.status)}
                          <span className="ml-1">{document.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(document.createdAt.toDate(), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {document.createdByName}
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          {document.documentType.replace('_', ' ')}
                        </div>
                      </div>
                      
                      {/* Signature status */}
                      <div className="flex items-center space-x-2 mt-2">
                        <div className={`flex items-center text-xs ${
                          document.signatures.tenantSignature ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          <Check className="w-3 h-3 mr-1" />
                          Tenant
                        </div>
                        <div className={`flex items-center text-xs ${
                          document.signatures.landlordSignature ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          <Check className="w-3 h-3 mr-1" />
                          Landlord
                        </div>
                        {document.signatures.witnessSignature && (
                          <div className="flex items-center text-xs text-green-600">
                            <Check className="w-3 h-3 mr-1" />
                            Witness
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Document Preview/Details */}
        <div className="lg:col-span-2">
          {selectedDocument ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedDocument.templateName}</CardTitle>
                    <CardDescription>
                      Created {format(selectedDocument.createdAt.toDate(), 'PPP')} by {selectedDocument.createdByName}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(selectedDocument.status)}>
                      {getStatusIcon(selectedDocument.status)}
                      <span className="ml-1">{selectedDocument.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="signatures">Signatures</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview" className="space-y-4">
                    <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div 
                        dangerouslySetInnerHTML={{ __html: selectedDocument.content.html }}
                        className="prose prose-sm max-w-none"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="signatures" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tenant Signature */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Tenant Signature</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDocument.signatures.tenantSignature ? (
                            <div className="space-y-2">
                              <div className="border rounded p-2 bg-green-50">
                                <img 
                                  src={selectedDocument.signatures.tenantSignature.signatureData} 
                                  alt="Tenant Signature" 
                                  className="max-h-16 mx-auto"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Signed: {format(selectedDocument.signatures.tenantSignature.signedAt.toDate(), 'PPp')}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground mb-2">Not signed</p>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSignatureType('tenant');
                                  setShowSignature(true);
                                }}
                              >
                                <PenTool className="w-3 h-3 mr-1" />
                                Sign as Tenant
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      {/* Landlord Signature */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Landlord Signature</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDocument.signatures.landlordSignature ? (
                            <div className="space-y-2">
                              <div className="border rounded p-2 bg-green-50">
                                <img 
                                  src={selectedDocument.signatures.landlordSignature.signatureData} 
                                  alt="Landlord Signature" 
                                  className="max-h-16 mx-auto"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Signed: {format(selectedDocument.signatures.landlordSignature.signedAt.toDate(), 'PPp')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                By: {selectedDocument.signatures.landlordSignature.signedByName}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground mb-2">Not signed</p>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSignatureType('landlord');
                                  setSignatureData(prev => ({ ...prev, signerName: user?.name || '' }));
                                  setShowSignature(true);
                                }}
                              >
                                <PenTool className="w-3 h-3 mr-1" />
                                Sign as Landlord
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Add Witness Signature */}
                    {!selectedDocument.signatures.witnessSignature && (
                      <div className="text-center">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSignatureType('witness');
                            setShowSignature(true);
                          }}
                        >
                          <PenTool className="w-3 h-3 mr-1" />
                          Add Witness Signature
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="actions" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={() => handleGeneratePDF(selectedDocument.id)}
                        disabled={selectedDocument.status !== 'signed'}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generate PDF
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => handleSendForSignature(selectedDocument.id, 'tenant')}
                        disabled={selectedDocument.status !== 'draft'}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send to Tenant
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => handleSendForSignature(selectedDocument.id, 'landlord')}
                        disabled={selectedDocument.status !== 'draft'}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send to Landlord
                      </Button>
                      
                      <Select 
                        value={selectedDocument.status}
                        onValueChange={(value) => handleStatusUpdate(selectedDocument.id, value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending_signature">Pending Signature</SelectItem>
                          <SelectItem value="signed">Signed</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a document</h3>
                  <p className="text-gray-600">Choose a document from the list to view details.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Generate Document Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Generate Lease Document</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Lease *</Label>
                  <Select
                    value={generatorData.leaseId}
                    onValueChange={(value) => setGeneratorData(prev => ({ ...prev, leaseId: value }))}
                    disabled={!!leaseId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lease" />
                    </SelectTrigger>
                    <SelectContent>
                      {leases.map((lease) => (
                        <SelectItem key={lease.id} value={lease.id}>
                          Lease {lease.id.slice(0, 8)}... - {lease.tenantId.slice(0, 8)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Template *</Label>
                  <Select
                    value={generatorData.templateId}
                    onValueChange={(value) => setGeneratorData(prev => ({ ...prev, templateId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">{template.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowGenerator(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={generating}>
                    {generating ? 'Generating...' : 'Generate Document'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Signature Modal */}
      {showSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add {signatureType} Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {signatureType === 'landlord' && (
                <div className="space-y-2">
                  <Label>Signer Name</Label>
                  <Input
                    value={signatureData.signerName}
                    onChange={(e) => setSignatureData(prev => ({ ...prev, signerName: e.target.value }))}
                    placeholder="Enter signer name"
                  />
                </div>
              )}
              
              {signatureType === 'witness' && (
                <>
                  <div className="space-y-2">
                    <Label>Witness Name</Label>
                    <Input
                      value={signatureData.witnessName}
                      onChange={(e) => setSignatureData(prev => ({ ...prev, witnessName: e.target.value }))}
                      placeholder="Enter witness name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Witness Contact</Label>
                    <Input
                      value={signatureData.witnessContact}
                      onChange={(e) => setSignatureData(prev => ({ ...prev, witnessContact: e.target.value }))}
                      placeholder="Enter witness contact"
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label>Signature</Label>
                <div className="border rounded">
                  <canvas
                    ref={signatureRef}
                    width={400}
                    height={200}
                    className="w-full h-32 cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                    Clear
                  </Button>
                  <p className="text-xs text-muted-foreground self-center">
                    Draw your signature above
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowSignature(false)}>
                  Cancel
                </Button>
                <Button onClick={saveSignature}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Signature
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
