'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  AlertCircle, 
  Check, 
  Loader2, 
  Wrench,
  Upload,
  X,
  Camera,
  AlertTriangle
} from 'lucide-react';
import { MaintenanceRequest, RequestType, RequestCategory, RequestPriority, Property, Unit } from '@/lib/types';
import { createMaintenanceRequest, updateMaintenanceRequest } from '@/lib/services/maintenance';
import { getProperties } from '@/lib/services/properties';
import { getUnits } from '@/lib/services/units';

interface MaintenanceFormProps {
  request?: MaintenanceRequest;
  preselectedPropertyId?: string;
  preselectedUnitId?: string;
  onSuccess?: (requestId: string) => void;
  onCancel?: () => void;
}

const requestTypes: { value: RequestType; label: string }[] = [
  { value: 'repair', label: 'Repair' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'complaint', label: 'Complaint' },
];

const requestCategories: { value: RequestCategory; label: string; description: string }[] = [
  { value: 'plumbing', label: 'Plumbing', description: 'Water, pipes, fixtures' },
  { value: 'electrical', label: 'Electrical', description: 'Wiring, outlets, lighting' },
  { value: 'structural', label: 'Structural', description: 'Walls, floors, roofing' },
  { value: 'appliance', label: 'Appliance', description: 'Stove, fridge, washing machine' },
  { value: 'cleaning', label: 'Cleaning', description: 'Deep cleaning, pest control' },
  { value: 'other', label: 'Other', description: 'General issues' },
];

const priorities: { value: RequestPriority; label: string; color: string; description: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800', description: 'Can wait weeks' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800', description: 'Should be done within days' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', description: 'Urgent, within 48 hours' },
  { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-800', description: 'Immediate attention required' },
];

export default function MaintenanceForm({ 
  request, 
  preselectedPropertyId, 
  preselectedUnitId, 
  onSuccess, 
  onCancel 
}: MaintenanceFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    type: request?.type || 'repair' as RequestType,
    category: request?.category || 'other' as RequestCategory,
    title: request?.title || '',
    description: request?.description || '',
    priority: request?.priority || 'medium' as RequestPriority,
    propertyId: request?.propertyId || preselectedPropertyId || '',
    unitId: request?.unitId || preselectedUnitId || '',
    estimatedCost: request?.estimatedCost || 0,
  });

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (formData.propertyId) {
      loadUnits(formData.propertyId);
    }
  }, [formData.propertyId]);

  const loadProperties = async () => {
    try {
      const result = await getProperties();
      setProperties(result.properties);
    } catch (error: any) {
      console.error('Error loading properties:', error);
    }
  };

  const loadUnits = async (propertyId: string) => {
    try {
      const result = await getUnits({ propertyId });
      setUnits(result.units);
    } catch (error: any) {
      console.error('Error loading units:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + selectedImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Please enter a title for the request');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Please provide a description');
      return false;
    }
    
    if (!formData.propertyId) {
      setError('Please select a property');
      return false;
    }
    
    if (formData.priority === 'emergency' && !formData.description.toLowerCase().includes('emergency')) {
      setError('Emergency requests must include "emergency" in the description');
      return false;
    }
    
    return true;
  };

  const uploadImages = async (): Promise<string[]> => {
    // In a real implementation, you would upload images to Firebase Storage
    // For now, return empty array
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      let requestId = request?.id;

      // Upload images first
      const imageUrls = await uploadImages();

      const requestData = {
        type: formData.type,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        propertyId: formData.propertyId,
        unitId: formData.unitId || undefined,
        submittedBy: user.id,
        images: imageUrls,
        videos: [],
        completionProof: [],
        estimatedCost: formData.estimatedCost > 0 ? formData.estimatedCost : undefined,
      };

      if (request) {
        // Update existing request
        await updateMaintenanceRequest(request.id, requestData);
      } else {
        // Create new request
        requestId = await createMaintenanceRequest(requestData);
      }

      setSuccess(request ? 'Request updated successfully!' : 'Request submitted successfully!');
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(requestId!);
        } else {
          router.push('/maintenance');
        }
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityDetails = (priority: RequestPriority) => {
    return priorities.find(p => p.value === priority);
  };

  const getCategoryDetails = (category: RequestCategory) => {
    return requestCategories.find(c => c.value === category);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Wrench className="mr-2 h-6 w-6" />
            {request ? 'Update Maintenance Request' : 'Submit Maintenance Request'}
          </CardTitle>
          <CardDescription>
            {request ? 'Update the details of your maintenance request' : 'Report an issue or request maintenance service'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6">
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type and Category */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Request Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Request Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div>
                            <div className="font-medium">{category.label}</div>
                            <div className="text-sm text-muted-foreground">{category.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getCategoryDetails(formData.category) && (
                    <p className="text-sm text-muted-foreground">
                      {getCategoryDetails(formData.category)!.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyId">Property *</Label>
                  <Select 
                    value={formData.propertyId} 
                    onValueChange={(value) => handleInputChange('propertyId', value)}
                    disabled={!!preselectedPropertyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unitId">Unit (Optional)</Label>
                  <Select 
                    value={formData.unitId} 
                    onValueChange={(value) => handleInputChange('unitId', value)}
                    disabled={!!preselectedUnitId || !formData.propertyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific unit</SelectItem>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          Unit {unit.label} - {unit.type.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Description</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of the issue"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue, including when it started, severity, and any relevant details..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={5}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Priority */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Priority Level</h3>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex items-center space-x-2">
                          <Badge className={priority.color}>
                            {priority.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {priority.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getPriorityDetails(formData.priority) && (
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityDetails(formData.priority)!.color}>
                      {getPriorityDetails(formData.priority)!.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getPriorityDetails(formData.priority)!.description}
                    </span>
                  </div>
                )}
              </div>
              
              {formData.priority === 'emergency' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Emergency requests receive immediate attention. Please ensure this is truly urgent.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Photos (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                Upload photos to help us understand the issue better. Maximum 5 images.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={selectedImages.length >= 5}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Add Photos
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedImages.length}/5 images
                  </span>
                </div>
                
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Estimated Cost (Admin/Owner only) */}
            {(user?.role === 'admin' || user?.role === 'owner') && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Cost Estimate (Optional)</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estimatedCost">Estimated Cost (USD)</Label>
                    <Input
                      id="estimatedCost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.estimatedCost}
                      onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {request ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {request ? 'Update Request' : 'Submit Request'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}