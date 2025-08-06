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
  DollarSign,
  Upload,
  X,
  FileText,
  Calendar,
  CreditCard
} from 'lucide-react';
import { TransactionType, PaymentMethod, Currency, Tenant, Lease, Property, Unit } from '@/lib/types';
import { 
  recordRentPayment, 
  recordDepositPayment, 
  recordMaintenanceExpense,
  createTransaction 
} from '@/lib/services/transactions';
import { getTenants } from '@/lib/services/tenants';
import { getLeases } from '@/lib/services/leases';
import { getProperties } from '@/lib/services/properties';
import { getUnits } from '@/lib/services/units';

interface PaymentFormProps {
  transactionType?: TransactionType;
  preselectedTenantId?: string;
  preselectedLeaseId?: string;
  preselectedRequestId?: string;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
}

const transactionTypes: { value: TransactionType; label: string; description: string }[] = [
  { value: 'rent_payment', label: 'Rent Payment', description: 'Monthly rent payment from tenant' },
  { value: 'deposit', label: 'Security Deposit', description: 'Security deposit payment' },
  { value: 'refund', label: 'Refund', description: 'Refund to tenant' },
  { value: 'maintenance_cost', label: 'Maintenance Expense', description: 'Property maintenance cost' },
  { value: 'service_fee', label: 'Service Fee', description: 'Management or service fee' },
];

const paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'mobile_money', label: 'Mobile Money', icon: '📱' },
  { value: 'card', label: 'Card Payment', icon: '💳' },
];

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollars', symbol: '$' },
  { value: 'ZWL', label: 'Zimbabwe Dollars', symbol: 'Z$' },
];

export default function PaymentForm({ 
  transactionType = 'rent_payment',
  preselectedTenantId,
  preselectedLeaseId,
  preselectedRequestId,
  onSuccess,
  onCancel 
}: PaymentFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedProofs, setSelectedProofs] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    type: transactionType,
    amount: 0,
    currency: 'USD' as Currency,
    tenantId: preselectedTenantId || '',
    leaseId: preselectedLeaseId || '',
    propertyId: '',
    unitId: '',
    requestId: preselectedRequestId || '',
    paymentMethod: 'bank_transfer' as PaymentMethod,
    reference: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.tenantId) {
      loadTenantLeases(formData.tenantId);
    }
  }, [formData.tenantId]);

  useEffect(() => {
    if (formData.propertyId) {
      loadPropertyUnits(formData.propertyId);
    }
  }, [formData.propertyId]);

  const loadData = async () => {
    try {
      const [tenantsResult, propertiesResult] = await Promise.all([
        getTenants({ status: 'active' }),
        getProperties(),
      ]);
      
      setTenants(tenantsResult.tenants);
      setProperties(propertiesResult.properties);
    } catch (error: any) {
      console.error('Error loading data:', error);
    }
  };

  const loadTenantLeases = async (tenantId: string) => {
    try {
      const result = await getLeases({ tenantId });
      setLeases(result.leases);
      
      // Auto-select active lease if available
      const activeLease = result.leases.find(l => l.status === 'active');
      if (activeLease && !formData.leaseId) {
        setFormData(prev => ({
          ...prev,
          leaseId: activeLease.id,
          propertyId: activeLease.propertyId,
          unitId: activeLease.unitId,
        }));
      }
    } catch (error: any) {
      console.error('Error loading tenant leases:', error);
    }
  };

  const loadPropertyUnits = async (propertyId: string) => {
    try {
      const result = await getUnits({ propertyId });
      setUnits(result.units);
    } catch (error: any) {
      console.error('Error loading property units:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProofSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (imageFiles.length + selectedProofs.length > 3) {
      setError('Maximum 3 proof documents allowed');
      return;
    }
    
    setSelectedProofs(prev => [...prev, ...imageFiles]);
  };

  const removeProof = (index: number) => {
    setSelectedProofs(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (formData.amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (!formData.reference.trim()) {
      setError('Please enter a payment reference');
      return false;
    }
    
    if (formData.type === 'rent_payment' || formData.type === 'deposit') {
      if (!formData.tenantId) {
        setError('Please select a tenant');
        return false;
      }
      
      if (!formData.leaseId) {
        setError('Please select a lease');
        return false;
      }
    }
    
    if (formData.type === 'maintenance_cost' && !formData.requestId) {
      setError('Please provide a maintenance request ID');
      return false;
    }
    
    if (!formData.propertyId) {
      setError('Please select a property');
      return false;
    }
    
    return true;
  };

  const uploadProofs = async (): Promise<string[]> => {
    // In a real implementation, upload to Firebase Storage
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
      // Upload proof documents
      const proofUrls = await uploadProofs();

      let transactionId: string;

      switch (formData.type) {
        case 'rent_payment':
          transactionId = await recordRentPayment(
            formData.tenantId,
            formData.leaseId,
            formData.unitId,
            formData.propertyId,
            formData.amount,
            formData.currency,
            formData.paymentMethod,
            formData.reference,
            formData.description || undefined,
            proofUrls
          );
          break;
          
        case 'deposit':
          transactionId = await recordDepositPayment(
            formData.tenantId,
            formData.leaseId,
            formData.unitId,
            formData.propertyId,
            formData.amount,
            formData.currency,
            formData.paymentMethod,
            formData.reference,
            formData.description || undefined,
            proofUrls
          );
          break;
          
        case 'maintenance_cost':
          transactionId = await recordMaintenanceExpense(
            formData.requestId,
            formData.propertyId,
            formData.unitId || undefined,
            formData.amount,
            formData.currency,
            formData.description || 'Maintenance expense',
            proofUrls
          );
          break;
          
        default:
          // Generic transaction
          transactionId = await createTransaction({
            type: formData.type,
            amount: formData.type === 'refund' ? -formData.amount : formData.amount,
            currency: formData.currency,
            tenantId: formData.tenantId || undefined,
            propertyId: formData.propertyId,
            unitId: formData.unitId || undefined,
            leaseId: formData.leaseId || undefined,
            paymentMethod: formData.paymentMethod,
            reference: formData.reference,
            description: formData.description,
            proof: proofUrls,
            allocatedTo: {
              owner: formData.amount * 0.85,
              mmg: formData.amount * 0.15,
            },
          });
      }

      setSuccess('Payment recorded successfully!');
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(transactionId);
        } else {
          router.push('/financial');
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

  const getSelectedLease = () => {
    return leases.find(l => l.id === formData.leaseId);
  };

  const getTransactionTypeDetails = (type: TransactionType) => {
    return transactionTypes.find(t => t.value === type);
  };

  const isExpense = formData.type === 'maintenance_cost' || formData.type === 'service_fee' || formData.type === 'refund';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <DollarSign className="mr-2 h-6 w-6" />
            Record Payment
          </CardTitle>
          <CardDescription>
            Record a new payment or expense transaction
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
            {/* Transaction Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Transaction Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getTransactionTypeDetails(formData.type) && (
                    <p className="text-sm text-muted-foreground">
                      {getTransactionTypeDetails(formData.type)!.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center">
                            <span className="mr-2">{method.icon}</span>
                            {method.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Amount and Currency */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Amount Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="amount">
                    Amount * {isExpense && <Badge variant="destructive" className="ml-2">Expense</Badge>}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.symbol} {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tenant and Lease (for rent/deposit payments) */}
            {(formData.type === 'rent_payment' || formData.type === 'deposit') && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tenant & Lease Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tenantId">Tenant *</Label>
                      <Select 
                        value={formData.tenantId} 
                        onValueChange={(value) => handleInputChange('tenantId', value)}
                        disabled={!!preselectedTenantId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tenant" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              <div>
                                <div className="font-medium">
                                  {tenant.personalInfo.emergencyContact.name || 'Unnamed Tenant'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {tenant.personalInfo.idNumber}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="leaseId">Lease Agreement *</Label>
                      <Select 
                        value={formData.leaseId} 
                        onValueChange={(value) => handleInputChange('leaseId', value)}
                        disabled={!!preselectedLeaseId || !formData.tenantId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lease" />
                        </SelectTrigger>
                        <SelectContent>
                          {leases.map((lease) => (
                            <SelectItem key={lease.id} value={lease.id}>
                              <div>
                                <div className="font-medium">
                                  Lease - Unit {lease.unitId.slice(0, 8)}...
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {lease.terms.currency} {lease.terms.rentAmount.toLocaleString()}/{lease.terms.paymentFrequency}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Show selected tenant and lease info */}
                  {(getSelectedTenant() || getSelectedLease()) && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {getSelectedLease() && (
                          <div>
                            <h4 className="font-medium mb-2">Selected Lease</h4>
                            <p className="text-sm text-muted-foreground">
                              Rent: {getSelectedLease()!.terms.currency} {getSelectedLease()!.terms.rentAmount.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Frequency: {getSelectedLease()!.terms.paymentFrequency}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Property and Unit */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Property Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyId">Property *</Label>
                  <Select 
                    value={formData.propertyId} 
                    onValueChange={(value) => handleInputChange('propertyId', value)}
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
                    disabled={!formData.propertyId}
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

            {/* Payment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">Payment Reference *</Label>
                  <Input
                    id="reference"
                    placeholder="e.g., TXN123456, Receipt #001"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    required
                  />
                </div>
                
                {formData.type === 'maintenance_cost' && (
                  <div className="space-y-2">
                    <Label htmlFor="requestId">Maintenance Request ID</Label>
                    <Input
                      id="requestId"
                      placeholder="Request ID"
                      value={formData.requestId}
                      onChange={(e) => handleInputChange('requestId', e.target.value)}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Additional notes about this transaction..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Proof of Payment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Proof of Payment (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                Upload receipts, bank statements, or other proof documents. Maximum 3 files.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('proof-upload')?.click()}
                    disabled={selectedProofs.length >= 3}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Proof
                  </Button>
                  <input
                    id="proof-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleProofSelect}
                    className="hidden"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedProofs.length}/3 files
                  </span>
                </div>
                
                {selectedProofs.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProofs.map((file, index) => (
                      <div key={index} className="relative">
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <span className="text-sm truncate">{file.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeProof(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
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
                    Recording...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Record Payment
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