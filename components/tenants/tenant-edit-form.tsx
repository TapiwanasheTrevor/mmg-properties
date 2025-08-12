'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

interface TenantEditFormProps {
  tenantId: string;
}

export default function TenantEditForm({ tenantId }: TenantEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    dateOfBirth: '',
    nationality: 'Zimbabwean',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Zimbabwe'
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    status: 'active'
  });

  useEffect(() => {
    setTimeout(() => {
      setFormData({
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+263 77 123 4567',
        idNumber: '12345678901',
        dateOfBirth: '1985-03-15',
        nationality: 'Zimbabwean',
        address: {
          street: '123 Main Street',
          city: 'Harare',
          postalCode: '10001',
          country: 'Zimbabwe'
        },
        emergencyContact: {
          name: 'Jane Smith',
          phone: '+263 77 987 6543',
          relationship: 'Sister'
        },
        status: 'active'
      });
      setLoading(false);
    }, 1000);
  }, [tenantId]);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.push(`/tenants/${tenantId}`);
    }, 1000);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this tenant? This action cannot be undone.')) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.push('/tenants');
    }, 1000);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Tenant</h1>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ID Number</Label>
                <Input
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nationality</Label>
                <Select value={formData.nationality} onValueChange={(value) => setFormData({...formData, nationality: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zimbabwean">Zimbabwean</SelectItem>
                    <SelectItem value="South African">South African</SelectItem>
                    <SelectItem value="Botswanan">Botswanan</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Street Address</Label>
              <Input
                value={formData.address.street}
                onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={formData.address.city}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  value={formData.address.postalCode}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, postalCode: e.target.value}})}
                />
              </div>
            </div>
            <div>
              <Label>Country</Label>
              <Select 
                value={formData.address.country} 
                onValueChange={(value) => setFormData({...formData, address: {...formData.address, country: value}})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Botswana">Botswana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, name: e.target.value}})}
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, phone: e.target.value}})}
                />
              </div>
              <div>
                <Label>Relationship</Label>
                <Select 
                  value={formData.emergencyContact.relationship} 
                  onValueChange={(value) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, relationship: value}})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}