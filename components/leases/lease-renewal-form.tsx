'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, RefreshCw, Info } from 'lucide-react';

interface LeaseRenewalFormProps {
  leaseId: string;
}

export default function LeaseRenewalForm({ leaseId }: LeaseRenewalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [currentLease, setCurrentLease] = useState<any>(null);
  const [renewalData, setRenewalData] = useState({
    newStartDate: '',
    newEndDate: '',
    newRentAmount: '',
    rentIncreasePercentage: '',
    renewalPeriod: '12',
    currency: 'USD'
  });

  useEffect(() => {
    // Mock current lease data - replace with Firebase/API call
    const mockLease = {
      id: leaseId,
      currentRentAmount: 1200,
      currency: 'USD',
      currentEndDate: '2024-12-31',
      tenant: {
        name: 'John Smith',
        email: 'john.smith@email.com'
      },
      property: {
        name: 'Sunset Apartments',
        unitNumber: 'A101'
      }
    };
    
    // Calculate suggested new dates and rent
    const endDate = new Date(mockLease.currentEndDate);
    const newStartDate = new Date(endDate);
    newStartDate.setDate(endDate.getDate() + 1);
    
    const newEndDate = new Date(newStartDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    
    const suggestedIncrease = 5; // 5% increase
    const newRentAmount = Math.round(mockLease.currentRentAmount * (1 + suggestedIncrease / 100));
    
    setTimeout(() => {
      setCurrentLease(mockLease);
      setRenewalData({
        newStartDate: newStartDate.toISOString().split('T')[0],
        newEndDate: newEndDate.toISOString().split('T')[0],
        newRentAmount: newRentAmount.toString(),
        rentIncreasePercentage: suggestedIncrease.toString(),
        renewalPeriod: '12',
        currency: mockLease.currency
      });
      setLoading(false);
    }, 1000);
  }, [leaseId]);

  const handleInputChange = (field: string, value: string) => {
    setRenewalData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate new rent when percentage changes
      if (field === 'rentIncreasePercentage' && currentLease) {
        const percentage = parseFloat(value) || 0;
        const newRentAmount = Math.round(currentLease.currentRentAmount * (1 + percentage / 100));
        updated.newRentAmount = newRentAmount.toString();
      }
      
      // Auto-calculate end date when period changes
      if (field === 'renewalPeriod') {
        const months = parseInt(value) || 12;
        const startDate = new Date(updated.newStartDate);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + months);
        updated.newEndDate = endDate.toISOString().split('T')[0];
      }
      
      // Auto-calculate end date when start date changes
      if (field === 'newStartDate') {
        const months = parseInt(updated.renewalPeriod) || 12;
        const startDate = new Date(value);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + months);
        updated.newEndDate = endDate.toISOString().split('T')[0];
      }
      
      return updated;
    });
  };

  const handleRenewLease = async () => {
    setRenewing(true);
    
    // Mock renewal operation - replace with Firebase/API call
    setTimeout(() => {
      setRenewing(false);
      router.push(`/leases/${leaseId}`);
    }, 2000);
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

  if (!currentLease) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Lease Not Found</h2>
        <p className="text-gray-600 mt-2">Unable to load lease information for renewal.</p>
        <Button className="mt-4" onClick={() => router.push('/leases')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leases
        </Button>
      </div>
    );
  }

  const rentIncreaseAmount = parseFloat(renewalData.newRentAmount) - currentLease.currentRentAmount;
  const rentIncreasePercentage = ((rentIncreaseAmount / currentLease.currentRentAmount) * 100).toFixed(1);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Renew Lease</h1>
          <p className="text-gray-600">{currentLease.property.name} - Unit {currentLease.property.unitNumber}</p>
        </div>
      </div>

      {/* Current Lease Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Current lease expires on <strong>{new Date(currentLease.currentEndDate).toLocaleDateString()}</strong> with 
          rent of <strong>{currentLease.currency} {currentLease.currentRentAmount.toLocaleString()}</strong> for tenant <strong>{currentLease.tenant.name}</strong>.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Renewal Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Renewal Terms</CardTitle>
            <CardDescription>Set new lease period and rental terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="renewalPeriod">Renewal Period (Months)</Label>
                <Select value={renewalData.renewalPeriod} onValueChange={(value) => handleInputChange('renewalPeriod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="18">18 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={renewalData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
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
              <Label htmlFor="newStartDate">New Start Date</Label>
              <Input
                id="newStartDate"
                type="date"
                value={renewalData.newStartDate}
                onChange={(e) => handleInputChange('newStartDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEndDate">New End Date</Label>
              <Input
                id="newEndDate"
                type="date"
                value={renewalData.newEndDate}
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground">
                Automatically calculated based on start date and renewal period
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rent Adjustment */}
        <Card>
          <CardHeader>
            <CardTitle>Rent Adjustment</CardTitle>
            <CardDescription>Set new rental amount and increase percentage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rentIncreasePercentage">Rent Increase (%)</Label>
              <Input
                id="rentIncreasePercentage"
                type="number"
                placeholder="5"
                step="0.1"
                value={renewalData.rentIncreasePercentage}
                onChange={(e) => handleInputChange('rentIncreasePercentage', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newRentAmount">New Monthly Rent</Label>
              <Input
                id="newRentAmount"
                type="number"
                value={renewalData.newRentAmount}
                onChange={(e) => handleInputChange('newRentAmount', e.target.value)}
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Rent:</span>
                <span className="font-medium">{currentLease.currency} {currentLease.currentRentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>New Rent:</span>
                <span className="font-medium">{renewalData.currency} {parseInt(renewalData.newRentAmount || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span>Increase:</span>
                <span className={`font-medium ${rentIncreaseAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {rentIncreaseAmount >= 0 ? '+' : ''}{renewalData.currency} {Math.abs(rentIncreaseAmount).toLocaleString()} ({rentIncreasePercentage}%)
                </span>
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
        <Button onClick={handleRenewLease} disabled={renewing}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {renewing ? 'Processing Renewal...' : 'Renew Lease'}
        </Button>
      </div>
    </div>
  );
}