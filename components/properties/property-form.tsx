'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  AlertCircle, 
  Check, 
  Loader2, 
  Upload, 
  X,
  MapPin,
  Building,
  DollarSign
} from 'lucide-react';
import { PropertyType, PropertyStatus, Property } from '@/lib/types';
import { createProperty, updateProperty, uploadPropertyImages } from '@/lib/services/properties';

interface PropertyFormProps {
  property?: Property;
  onSuccess?: (propertyId: string) => void;
  onCancel?: () => void;
}

export default function PropertyForm({ property, onSuccess, onCancel }: PropertyFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: property?.name || '',
    type: property?.type || 'apartment_complex' as PropertyType,
    description: property?.description || '',
    street: property?.address.street || '',
    suburb: property?.address.suburb || '',
    city: property?.address.city || '',
    country: property?.address.country || 'Zimbabwe',
    status: property?.status || 'active' as PropertyStatus,
    monthlyIncome: property?.monthlyIncome || 0,
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Only image files are allowed.');
    }

    // Limit to 10 images total
    const totalImages = imageFiles.length + validFiles.length;
    if (totalImages > 10) {
      setError('Maximum 10 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Property name is required');
      return false;
    }

    if (!formData.street.trim()) {
      setError('Street address is required');
      return false;
    }

    if (!formData.suburb.trim()) {
      setError('Suburb is required');
      return false;
    }

    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      let propertyId = property?.id;

      if (property) {
        // Update existing property
        await updateProperty(property.id, {
          name: formData.name,
          type: formData.type,
          description: formData.description,
          address: {
            street: formData.street,
            suburb: formData.suburb,
            city: formData.city,
            country: formData.country,
          },
          status: formData.status,
          monthlyIncome: formData.monthlyIncome,
        });
      } else {
        // Create new property
        propertyId = await createProperty({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          address: {
            street: formData.street,
            suburb: formData.suburb,
            city: formData.city,
            country: formData.country,
          },
          ownerId: user.id,
          assignedAgents: [],
          images: [],
          totalUnits: 0,
          occupiedUnits: 0,
          monthlyIncome: formData.monthlyIncome,
          status: formData.status,
        });
      }

      // Upload images if any
      if (imageFiles.length > 0 && propertyId) {
        const uploadedUrls = await uploadPropertyImages(propertyId, imageFiles);
        
        // Update property with image URLs
        const existingImages = property?.images || [];
        await updateProperty(propertyId, {
          images: [...existingImages, ...uploadedUrls],
        });
      }

      setSuccess(property ? 'Property updated successfully!' : 'Property created successfully!');
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(propertyId!);
        } else {
          router.push('/properties');
        }
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyTypeLabel = (type: PropertyType) => {
    const labels: Record<PropertyType, string> = {
      house: 'Single House',
      apartment_complex: 'Apartment Complex',
      commercial: 'Commercial Property',
      mixed_use: 'Mixed Use Building',
    };
    return labels[type];
  };

  const getStatusColor = (status: PropertyStatus) => {
    const colors: Record<PropertyStatus, string> = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Building className="mr-2 h-6 w-6" />
            {property ? 'Edit Property' : 'Add New Property'}
          </CardTitle>
          <CardDescription>
            {property ? 'Update property information and settings' : 'Create a new property in your portfolio'}
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
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Sunset Apartments"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Property Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">Single House</SelectItem>
                      <SelectItem value="apartment_complex">Apartment Complex</SelectItem>
                      <SelectItem value="commercial">Commercial Property</SelectItem>
                      <SelectItem value="mixed_use">Mixed Use Building</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the property, amenities, and special features..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Address Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  placeholder="e.g., 123 Main Street"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="suburb">Suburb *</Label>
                  <Input
                    id="suburb"
                    placeholder="e.g., Avondale"
                    value={formData.suburb}
                    onChange={(e) => handleInputChange('suburb', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Harare"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Property Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Expected Monthly Income ($)</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Property Images</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> property images
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB each (max 10 images)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Existing Images */}
                {property && property.images && property.images.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Existing Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {property.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                    {property ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {property ? 'Update Property' : 'Create Property'}
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