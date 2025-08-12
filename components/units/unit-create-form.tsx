'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

export default function UnitCreateForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    unitNumber: '',
    type: 'studio',
    squareFootage: '',
    monthlyRent: '',
    propertyId: ''
  });

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      router.push('/units');
    }, 1000);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create New Unit</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unit Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Unit Number</Label>
              <Input
                placeholder="A101"
                value={formData.unitNumber}
                onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="1br">1 Bedroom</SelectItem>
                  <SelectItem value="2br">2 Bedroom</SelectItem>
                  <SelectItem value="3br">3 Bedroom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Square Footage</Label>
              <Input
                type="number"
                placeholder="850"
                value={formData.squareFootage}
                onChange={(e) => setFormData({...formData, squareFootage: e.target.value})}
              />
            </div>
            <div>
              <Label>Monthly Rent</Label>
              <Input
                type="number"
                placeholder="1200"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Creating...' : 'Create Unit'}
        </Button>
      </div>
    </div>
  );
}