'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Save, 
  AlertCircle, 
  Check, 
  Loader2, 
  FileText,
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  Home
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { Lease, LeaseStatus, PaymentFrequency, Currency, Tenant, Unit } from '@/lib/types';
import { createLease, updateLease } from '@/lib/services/leases';
import { getTenants } from '@/lib/services/tenants';
import { getVacantUnits } from '@/lib/services/units';
import { Timestamp } from 'firebase/firestore';

interface LeaseFormProps {
  lease?: Lease;
  preselectedTenantId?: string;
  preselectedUnitId?: string;
  onSuccess?: (leaseId: string) => void;
  onCancel?: () => void;
}

export default function LeaseForm({ lease, preselectedTenantId, preselectedUnitId, onSuccess, onCancel }: LeaseFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(
    lease?.dates.startDate ? lease.dates.startDate.toDate() : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    lease?.dates.endDate ? lease.dates.endDate.toDate() : undefined
  );

  const [formData, setFormData] = useState({
    tenantId: lease?.tenantId || preselectedTenantId || '',
    unitId: lease?.unitId || preselectedUnitId || '',
    rentAmount: lease?.terms.rentAmount || 0,
    currency: lease?.terms.currency || 'USD' as Currency,
    paymentFrequency: lease?.terms.paymentFrequency || 'monthly' as PaymentFrequency,
    paymentDueDate: lease?.terms.paymentDueDate || 1,
    depositAmount: lease?.terms.depositAmount || 0,
    leasePeriod: lease?.terms.leasePeriod || 12,
    status: lease?.status || 'draft' as LeaseStatus,
  });

  useEffect(() => {
    loadTenants();
    loadAvailableUnits();
  }, []);

  useEffect(() => {
    // Auto-calculate end date when start date or lease period changes
    if (startDate && formData.leasePeriod) {
      const calculatedEndDate = addMonths(startDate, formData.leasePeriod);
      setEndDate(calculatedEndDate);
    }
  }, [startDate, formData.leasePeriod]);

  const loadTenants = async () => {
    try {
      const result = await getTenants({ status: 'active' });
      setTenants(result.tenants);
    } catch (error: any) {
      console.error('Error loading tenants:', error);
    }
  };

  const loadAvailableUnits = async () => {
    try {
      const units = await getVacantUnits();
      setAvailableUnits(units);
    } catch (error: any) {
      console.error('Error loading available units:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.tenantId) {
      setError('Please select a tenant');
      return false;
    }
    
    if (!formData.unitId) {
      setError('Please select a unit');
      return false;
    }
    
    if (!startDate) {
      setError('Please select a start date');
      return false;
    }
    
    if (!endDate) {
      setError('Please select an end date');
      return false;
    }
    
    if (formData.rentAmount <= 0) {
      setError('Please enter a valid rent amount');
      return false;
    }
    
    if (formData.depositAmount < 0) {
      setError('Please enter a valid deposit amount');
      return false;
    }
    
    if (formData.leasePeriod <= 0) {
      setError('Please enter a valid lease period');
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
      let leaseId = lease?.id;

      const leaseData = {
        tenantId: formData.tenantId,
        unitId: formData.unitId,
        propertyId: availableUnits.find(u => u.id === formData.unitId)?.propertyId || '',
        terms: {
          rentAmount: formData.rentAmount,
          currency: formData.currency,
          paymentFrequency: formData.paymentFrequency,
          paymentDueDate: formData.paymentDueDate,
          depositAmount: formData.depositAmount,
          leasePeriod: formData.leasePeriod,
        },
        dates: {
          startDate: Timestamp.fromDate(startDate!),
          endDate: Timestamp.fromDate(endDate!),
        },
        documents: {
          leaseAgreement: '',
          signedBy: {
            tenant: { signed: false },
            owner: { signed: false },
          },
        },
        status: formData.status,
        renewalHistory: lease?.renewalHistory || [],
      };

      if (lease) {
        // Update existing lease
        await updateLease(lease.id, leaseData);
      } else {
        // Create new lease
        leaseId = await createLease(leaseData);
      }

      setSuccess(lease ? 'Lease updated successfully!' : 'Lease created successfully!');
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(leaseId!);
        } else {
          router.push('/leases');
        }
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedTenant = () => {
    return tenants.find(t => t.id === formData.tenantId);
  };

  const getSelectedUnit = () => {
    return availableUnits.find(u => u.id === formData.unitId);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <FileText className="mr-2 h-6 w-6" />
            {lease ? 'Edit Lease Agreement' : 'Create New Lease'}
          </CardTitle>
          <CardDescription>
            {lease ? 'Update lease terms and conditions' : 'Create a lease agreement between tenant and unit'}
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
            {/* Tenant and Unit Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Tenant & Unit Selection
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Select Tenant *</Label>
                  <Select 
                    value={formData.tenantId} 
                    onValueChange={(value) => handleInputChange('tenantId', value)}
                    disabled={!!preselectedTenantId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          <div className="flex flex-col">
                            <span>{tenant.personalInfo.emergencyContact.name || 'Unnamed Tenant'}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {tenant.personalInfo.idNumber}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unitId">Select Unit *</Label>
                  <Select 
                    value={formData.unitId} 
                    onValueChange={(value) => handleInputChange('unitId', value)}
                    disabled={!!preselectedUnitId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          <div className="flex flex-col">
                            <span>Unit {unit.label} - {unit.type.replace('_', ' ')}</span>
                            <span className="text-xs text-muted-foreground">
                              ${unit.rentAmount}/month
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Show selected tenant and unit info */}
              {(getSelectedTenant() || getSelectedUnit()) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  {getSelectedTenant() && (
                    <div>
                      <h4 className="font-medium mb-2">Selected Tenant</h4>
                      <p className="text-sm text-muted-foreground">
                        {getSelectedTenant()!.personalInfo.emergencyContact.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getSelectedTenant()!.personalInfo.occupation}
                      </p>
                    </div>
                  )}
                  {getSelectedUnit() && (
                    <div>
                      <h4 className="font-medium mb-2">Selected Unit</h4>
                      <p className="text-sm text-muted-foreground">
                        Unit {getSelectedUnit()!.label} - {getSelectedUnit()!.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${getSelectedUnit()!.rentAmount}/month
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Lease Terms */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Lease Terms
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rentAmount">Monthly Rent *</Label>
                  <Input
                    id="rentAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1200.00"
                    value={formData.rentAmount}
                    onChange={(e) => handleInputChange('rentAmount', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="ZWL">ZWL (Z$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Security Deposit</Label>
                  <Input
                    id="depositAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1200.00"
                    value={formData.depositAmount}
                    onChange={(e) => handleInputChange('depositAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                  <Select value={formData.paymentFrequency} onValueChange={(value) => handleInputChange('paymentFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentDueDate">Payment Due Date</Label>
                  <Select value={formData.paymentDueDate.toString()} onValueChange={(value) => handleInputChange('paymentDueDate', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={day.toString()}>
                          {day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`} of each month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="leasePeriod">Lease Period (months)</Label>
                  <Input
                    id="leasePeriod"
                    type="number"
                    min="1"
                    max="60"
                    placeholder="12"
                    value={formData.leasePeriod}
                    onChange={(e) => handleInputChange('leasePeriod', parseInt(e.target.value) || 12)}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Lease Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Lease Dates
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(date) => startDate ? date <= startDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Lease Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Lease Status</h3>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="notice_given">Notice Given</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
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
                    {lease ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {lease ? 'Update Lease' : 'Create Lease'}
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