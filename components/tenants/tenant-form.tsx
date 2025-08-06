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
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  AlertCircle, 
  Check, 
  Loader2, 
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Shield
} from 'lucide-react';
import { Tenant, TenantStatus } from '@/lib/types';
import { createTenant, updateTenant } from '@/lib/services/tenants';

interface TenantFormProps {
  tenant?: Tenant;
  onSuccess?: (tenantId: string) => void;
  onCancel?: () => void;
}

export default function TenantForm({ tenant, onSuccess, onCancel }: TenantFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    // User account info (if creating new tenant)
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Personal information
    idNumber: tenant?.personalInfo.idNumber || '',
    nationality: tenant?.personalInfo.nationality || 'Zimbabwean',
    occupation: tenant?.personalInfo.occupation || '',
    employer: tenant?.personalInfo.employer || '',
    
    // Emergency contact
    emergencyName: tenant?.personalInfo.emergencyContact.name || '',
    emergencyPhone: tenant?.personalInfo.emergencyContact.phone || '',
    emergencyRelationship: tenant?.personalInfo.emergencyContact.relationship || '',
    
    // Status
    status: tenant?.status || 'active' as TenantStatus,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!tenant) {
      // New tenant validation
      if (!formData.firstName.trim()) {
        setError('First name is required');
        return false;
      }
      
      if (!formData.lastName.trim()) {
        setError('Last name is required');
        return false;
      }
      
      if (!formData.email.trim()) {
        setError('Email is required');
        return false;
      }
    }

    if (!formData.idNumber.trim()) {
      setError('ID number is required');
      return false;
    }
    
    if (!formData.occupation.trim()) {
      setError('Occupation is required');
      return false;
    }
    
    if (!formData.emergencyName.trim()) {
      setError('Emergency contact name is required');
      return false;
    }
    
    if (!formData.emergencyPhone.trim()) {
      setError('Emergency contact phone is required');
      return false;
    }
    
    if (!formData.emergencyRelationship.trim()) {
      setError('Emergency contact relationship is required');
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
      let tenantId = tenant?.id;

      if (tenant) {
        // Update existing tenant
        await updateTenant(tenant.id, {
          personalInfo: {
            idNumber: formData.idNumber,
            nationality: formData.nationality,
            occupation: formData.occupation,
            employer: formData.employer,
            emergencyContact: {
              name: formData.emergencyName,
              phone: formData.emergencyPhone,
              relationship: formData.emergencyRelationship,
            },
          },
          status: formData.status,
        });
      } else {
        // Create new tenant
        tenantId = await createTenant({
          userId: 'temp-user-id', // Would be created during registration
          personalInfo: {
            idNumber: formData.idNumber,
            nationality: formData.nationality,
            occupation: formData.occupation,
            employer: formData.employer,
            emergencyContact: {
              name: formData.emergencyName,
              phone: formData.emergencyPhone,
              relationship: formData.emergencyRelationship,
            },
          },
          leaseHistory: [],
          paymentHistory: [],
          requestHistory: [],
          status: formData.status,
        });
      }

      setSuccess(tenant ? 'Tenant updated successfully!' : 'Tenant created successfully!');
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(tenantId!);
        } else {
          router.push('/tenants');
        }
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TenantStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      notice_period: 'bg-yellow-100 text-yellow-800',
      former: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <User className="mr-2 h-6 w-6" />
            {tenant ? 'Edit Tenant' : 'Add New Tenant'}
          </CardTitle>
          <CardDescription>
            {tenant ? 'Update tenant information and details' : 'Create a new tenant profile'}
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
            {/* User Account Information (for new tenants) */}
            {!tenant && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Account Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="e.g., John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="e.g., Smith"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.smith@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+263 77 123 4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number *</Label>
                  <Input
                    id="idNumber"
                    placeholder="e.g., 63-123456A63"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    placeholder="e.g., Zimbabwean"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    placeholder="e.g., Software Engineer"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employer">Employer</Label>
                  <Input
                    id="employer"
                    placeholder="e.g., Tech Company Ltd"
                    value={formData.employer}
                    onChange={(e) => handleInputChange('employer', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Emergency Contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Contact Name *</Label>
                  <Input
                    id="emergencyName"
                    placeholder="e.g., Jane Smith"
                    value={formData.emergencyName}
                    onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Phone *</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    placeholder="+263 77 987 6543"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergencyRelationship">Relationship *</Label>
                <Select 
                  value={formData.emergencyRelationship} 
                  onValueChange={(value) => handleInputChange('emergencyRelationship', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="colleague">Colleague</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tenant Status (for existing tenants) */}
            {tenant && (
              <>
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tenant Status</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange('status', value as TenantStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="notice_period">Notice Period</SelectItem>
                        <SelectItem value="former">Former Tenant</SelectItem>
                      </SelectContent>
                    </Select>
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
                    {tenant ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {tenant ? 'Update Tenant' : 'Create Tenant'}
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