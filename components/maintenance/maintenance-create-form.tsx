'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

export default function MaintenanceCreateForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'pending',
    propertyId: '',
    unitId: '',
    assignedTo: '',
    estimatedCost: '',
    notes: ''
  });

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.push('/maintenance');
    }, 1000);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create Maintenance Request</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={4}
                placeholder="Detailed description of the maintenance issue..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="appliances">Appliances</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Property</Label>
              <Select value={formData.propertyId} onValueChange={(value) => setFormData({...formData, propertyId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prop1">Sunset Apartments</SelectItem>
                  <SelectItem value="prop2">Downtown Complex</SelectItem>
                  <SelectItem value="prop3">Garden View Condos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unit</Label>
              <Select value={formData.unitId} onValueChange={(value) => setFormData({...formData, unitId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit1">Unit A101</SelectItem>
                  <SelectItem value="unit2">Unit A102</SelectItem>
                  <SelectItem value="unit3">Unit B201</SelectItem>
                  <SelectItem value="unit4">Unit B202</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assign To (Optional)</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => setFormData({...formData, assignedTo: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Leave unassigned or select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  <SelectItem value="tech1">Mike Johnson - Fix-It Services</SelectItem>
                  <SelectItem value="tech2">Sarah Wilson - Home Repairs Co</SelectItem>
                  <SelectItem value="tech3">Tom Brown - Quick Fix LLC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estimated Cost ($) (Optional)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={4}
              placeholder="Add any additional notes or comments about this maintenance request..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Creating...' : 'Create Request'}
        </Button>
      </div>
    </div>
  );
}