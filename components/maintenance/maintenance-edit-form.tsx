'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

interface MaintenanceEditFormProps {
  maintenanceId: string;
}

export default function MaintenanceEditForm({ maintenanceId }: MaintenanceEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    status: '',
    propertyId: '',
    unitId: '',
    assignedTo: '',
    estimatedCost: '',
    actualCost: '',
    notes: ''
  });

  useEffect(() => {
    setTimeout(() => {
      setFormData({
        title: 'Leaking faucet in kitchen',
        description: 'The kitchen faucet has been leaking for 3 days. Water is dripping constantly and needs immediate attention.',
        category: 'plumbing',
        priority: 'high',
        status: 'in_progress',
        propertyId: 'prop1',
        unitId: 'unit1',
        assignedTo: 'tech1',
        estimatedCost: '150',
        actualCost: '',
        notes: 'Tenant reported the issue during morning hours. High priority due to water waste.'
      });
      setLoading(false);
    }, 1000);
  }, [maintenanceId]);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.push(`/maintenance/${maintenanceId}`);
    }, 1000);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this maintenance request? This action cannot be undone.')) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.push('/maintenance');
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
          <h1 className="text-3xl font-bold">Edit Maintenance Request</h1>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
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
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
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
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectValue />
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unit1">Unit A101</SelectItem>
                  <SelectItem value="unit2">Unit A102</SelectItem>
                  <SelectItem value="unit3">Unit B201</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assigned To</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => setFormData({...formData, assignedTo: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  <SelectItem value="tech1">Mike Johnson - Fix-It Services</SelectItem>
                  <SelectItem value="tech2">Sarah Wilson - Home Repairs Co</SelectItem>
                  <SelectItem value="tech3">Tom Brown - Quick Fix LLC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estimated Cost ($)</Label>
                <Input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                />
              </div>
              <div>
                <Label>Actual Cost ($)</Label>
                <Input
                  type="number"
                  value={formData.actualCost}
                  onChange={(e) => setFormData({...formData, actualCost: e.target.value})}
                />
              </div>
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
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}