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
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Share,
  FolderOpen,
  Image,
  FileImage,
  File,
  FilePdf,
  FileSpreadsheet,
  FileVideo,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Tag,
  Lock,
  Unlock,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  Document, 
  DocumentCategory,
  uploadDocument, 
  getDocuments, 
  deleteDocument,
  updateDocument,
  searchDocuments,
  getDocumentStatistics,
  hasDocumentPermission
} from '@/lib/services/documents';

const documentCategories: { value: DocumentCategory; label: string; description: string }[] = [
  { value: 'lease_agreement', label: 'Lease Agreements', description: 'Rental agreements and contracts' },
  { value: 'tenant_application', label: 'Tenant Applications', description: 'Application forms and background checks' },
  { value: 'property_documents', label: 'Property Documents', description: 'Deeds, titles, and property papers' },
  { value: 'maintenance_reports', label: 'Maintenance Reports', description: 'Repair and maintenance documentation' },
  { value: 'financial_records', label: 'Financial Records', description: 'Receipts, invoices, and financial documents' },
  { value: 'inspection_reports', label: 'Inspection Reports', description: 'Property inspection and assessment reports' },
  { value: 'legal_documents', label: 'Legal Documents', description: 'Legal notices, court documents, and contracts' },
  { value: 'insurance_documents', label: 'Insurance Documents', description: 'Insurance policies and claims' },
  { value: 'certificates', label: 'Certificates', description: 'Permits, licenses, and certificates' },
  { value: 'photos', label: 'Photos', description: 'Property and unit photographs' },
  { value: 'other', label: 'Other', description: 'Miscellaneous documents' },
];

interface DocumentManagerProps {
  relatedResource?: {
    type: 'property' | 'unit' | 'tenant' | 'lease' | 'maintenance' | 'transaction';
    id: string;
    name: string;
  };
  category?: DocumentCategory;
}

export default function DocumentManager({ relatedResource, category }: DocumentManagerProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  // Upload form state
  const [uploadData, setUploadData] = useState({
    files: [] as File[],
    name: '',
    description: '',
    category: category || 'other' as DocumentCategory,
    tags: '',
    accessLevel: 'private' as 'public' | 'private' | 'restricted',
  });
  
  // Edit form state
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    category: 'other' as DocumentCategory,
    tags: '',
    accessLevel: 'private' as 'public' | 'private' | 'restricted',
  });

  useEffect(() => {
    loadDocuments();
    loadStatistics();
  }, [selectedCategory, relatedResource]);

  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    
    try {
      let result;
      
      if (searchTerm) {
        result = await searchDocuments(searchTerm, user!.id, {
          category: selectedCategory !== 'all' ? selectedCategory as DocumentCategory : undefined,
        });
        setDocuments(result);
      } else {
        result = await getDocuments({
          category: selectedCategory !== 'all' ? selectedCategory as DocumentCategory : undefined,
          relatedResourceType: relatedResource?.type,
          relatedResourceId: relatedResource?.id,
          isActive: true,
          pageSize: 100,
        });
        
        // Filter by permissions
        const accessibleDocuments = result.documents.filter(doc => 
          hasDocumentPermission(doc, user!.id, 'view')
        );
        
        setDocuments(accessibleDocuments);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getDocumentStatistics(user?.id);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDocuments();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadData(prev => ({ ...prev, files }));
    
    // Auto-set name from first file if not set
    if (files.length > 0 && !uploadData.name) {
      setUploadData(prev => ({ 
        ...prev, 
        name: files[0].name.replace(/\.[^/.]+$/, '') // Remove extension
      }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || uploadData.files.length === 0) return;

    setUploading(true);
    setError('');
    
    try {
      const uploadPromises = uploadData.files.map(async (file, index) => {
        const fileName = uploadData.files.length > 1 
          ? `${uploadData.name} (${index + 1})` 
          : uploadData.name;
        
        return await uploadDocument(
          file,
          {
            name: fileName,
            description: uploadData.description,
            category: uploadData.category,
            tags: uploadData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            relatedResource,
            accessLevel: uploadData.accessLevel,
          },
          user.id,
          user.name,
          user.role
        );
      });
      
      await Promise.all(uploadPromises);
      
      setSuccess(`Successfully uploaded ${uploadData.files.length} document(s)!`);
      setShowUpload(false);
      setUploadData({
        files: [],
        name: '',
        description: '',
        category: category || 'other',
        tags: '',
        accessLevel: 'private',
      });
      
      // Refresh documents
      await loadDocuments();
      await loadStatistics();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDocument) return;

    try {
      await updateDocument(
        selectedDocument.id,
        {
          name: editData.name,
          description: editData.description,
          category: editData.category,
          tags: editData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          accessLevel: editData.accessLevel,
        },
        user.id,
        user.role
      );
      
      setSuccess('Document updated successfully!');
      setShowEdit(false);
      setSelectedDocument(null);
      await loadDocuments();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDelete = async (document: Document) => {
    if (!user || !confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDocument(document.id, user.id, user.role);
      setSuccess('Document deleted successfully!');
      await loadDocuments();
      await loadStatistics();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const openEditModal = (document: Document) => {
    setSelectedDocument(document);
    setEditData({
      name: document.name,
      description: document.description || '',
      category: document.category,
      tags: document.tags.join(', '),
      accessLevel: document.accessLevel,
    });
    setShowEdit(true);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (mimeType === 'application/pdf') return <FilePdf className="w-5 h-5" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getAccessLevelIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'public': return <Globe className="w-4 h-4 text-green-600" />;
      case 'restricted': return <Lock className="w-4 h-4 text-red-600" />;
      default: return <Unlock className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && documents.length === 0) {
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
          <h2 className="text-2xl font-bold tracking-tight">Document Manager</h2>
          <p className="text-muted-foreground">
            {relatedResource 
              ? `Documents for ${relatedResource.name}` 
              : 'Manage all documents and files'}
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Documents
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

      {/* Statistics Cards */}
      {statistics && !relatedResource && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-blue-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Upload className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Total Size</p>
                  <p className="text-2xl font-bold">{formatFileSize(statistics.totalSize)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-purple-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Public Docs</p>
                  <p className="text-2xl font-bold">{statistics.byAccessLevel.public || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-orange-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-muted-foreground">Recent Uploads</p>
                  <p className="text-2xl font-bold">{statistics.recentUploads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {documentCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({documents.length})</CardTitle>
          <CardDescription>
            {selectedCategory !== 'all' 
              ? `Showing ${documentCategories.find(c => c.value === selectedCategory)?.label} documents`
              : 'All documents'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'No documents match your search criteria.'
                  : 'No documents have been uploaded yet.'}
              </p>
              <Button onClick={() => setShowUpload(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload First Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {documents.map((document) => (
                <div key={document.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(document.mimeType)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{document.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{document.fileName}</p>
                      </div>
                    </div>
                    {getAccessLevelIcon(document.accessLevel)}
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge className="text-xs">
                        {documentCategories.find(c => c.value === document.category)?.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(document.fileSize)}
                      </span>
                    </div>
                    
                    {document.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {document.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {document.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{document.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {document.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {document.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{document.uploadedByName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(document.createdAt.toDate(), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(document.downloadUrl, '_blank')}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = document.downloadUrl;
                          link.download = document.fileName;
                          link.click();
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {hasDocumentPermission(document, user!.id, 'edit') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditModal(document)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                      {hasDocumentPermission(document, user!.id, 'delete') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(document)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label>Files *</Label>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.ppt,.pptx"
                    required
                  />
                  {uploadData.files.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Selected {uploadData.files.length} file(s): {uploadData.files.map(f => f.name).join(', ')}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Document Name *</Label>
                  <Input
                    value={uploadData.name}
                    onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter document name"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={uploadData.category}
                      onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value as DocumentCategory }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Access Level</Label>
                    <Select
                      value={uploadData.accessLevel}
                      onValueChange={(value) => setUploadData(prev => ({ ...prev, accessLevel: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Tags (Optional)</Label>
                  <Input
                    value={uploadData.tags}
                    onChange={(e) => setUploadData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags separated by commas"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter document description"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Documents'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Document</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Name *</Label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={editData.category}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, category: value as DocumentCategory }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Access Level</Label>
                    <Select
                      value={editData.accessLevel}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, accessLevel: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input
                    value={editData.tags}
                    onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags separated by commas"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
