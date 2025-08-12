'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

interface LeaseEditFormProps {
  leaseId: string;
}

export default function LeaseEditForm({ leaseId }: LeaseEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    rentAmount: '',
    currency: 'USD',
    paymentFrequency: 'monthly',
    securityDeposit: '',
    lateFeePenalty: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    // Mock data loading - replace with Firebase/API call
    const mockLease = {
      rentAmount: '1200',
      currency: 'USD',
      paymentFrequency: 'monthly',
      securityDeposit: '2400',
      lateFeePenalty: '50',
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    };
    
    setTimeout(() => {
      setFormData(mockLease);
      setLoading(false);
    }, 1000);
  }, [leaseId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Mock save operation - replace with Firebase/API call
    setTimeout(() => {
      setSaving(false);
      router.push(`/leases/${leaseId}`);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Lease</h1>
          <p className="text-gray-600">Modify lease terms and conditions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Terms</CardTitle>
            <CardDescription>Update rent and deposit amounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentAmount">Monthly Rent</Label>
                <Input
                  id="rentAmount"
                  type="number"
                  placeholder="1200"
                  value={formData.rentAmount}
                  onChange={(e) => handleInputChange('rentAmount', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="ZWL">ZWL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentFrequency">Payment Frequency</Label>
              <Select value={formData.paymentFrequency} onValueChange={(value) => handleInputChange('paymentFrequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="securityDeposit">Security Deposit</Label>
                <Input
                  id="securityDeposit"
                  type="number"
                  placeholder="2400"
                  value={formData.securityDeposit}
                  onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateFeePenalty">Late Fee</Label>
                <Input
                  id="lateFeePenalty"
                  type="number"
                  placeholder="50"
                  value={formData.lateFeePenalty}
                  onChange={(e) => handleInputChange('lateFeePenalty', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lease Period */}
        <Card>
          <CardHeader>
            <CardTitle>Lease Period</CardTitle>
            <CardDescription>Update lease start and end dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>

            <div className="pt-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Lease Duration:</strong> {
                    formData.startDate && formData.endDate
                      ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))
                      : '0'
                  } days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}