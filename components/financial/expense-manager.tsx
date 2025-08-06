'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Save, 
  AlertCircle, 
  Check, 
  Loader2,
  DollarSign,
  Calendar,
  Building,
  Wrench,
  FileText,
  TrendingDown,
  Filter,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { Property, MaintenanceRequest, Transaction, Currency } from '@/lib/types';
import { getProperties } from '@/lib/services/properties';
import { getMaintenanceRequests } from '@/lib/services/maintenance';
import { getTransactions, recordMaintenanceExpense, createTransaction } from '@/lib/services/transactions';

interface ExpenseFormData {
  type: 'maintenance' | 'property_management' | 'utilities' | 'insurance' | 'repairs' | 'other';
  amount: number;
  currency: Currency;
  propertyId: string;
  maintenanceRequestId?: string;
  description: string;
  category: string;
  vendor?: string;
  invoiceNumber?: string;
  dueDate?: Date;
}

const expenseTypes = [
  { value: 'maintenance', label: 'Maintenance', description: 'Property maintenance and repairs' },
  { value: 'property_management', label: 'Property Management', description: 'Management fees and services' },
  { value: 'utilities', label: 'Utilities', description: 'Water, electricity, gas, internet' },
  { value: 'insurance', label: 'Insurance', description: 'Property insurance premiums' },
  { value: 'repairs', label: 'Repairs', description: 'Emergency repairs and fixes' },
  { value: 'other', label: 'Other', description: 'Other property-related expenses' },
];

const expenseCategories = [
  'Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Painting', 'Flooring',
  'Appliances', 'Security', 'Landscaping', 'Cleaning', 'Legal', 'Accounting',
  'Marketing', 'Advertising', 'Insurance', 'Taxes', 'Utilities', 'Other'
];

interface ExpenseManagerProps {
  propertyId?: string;
  maintenanceRequestId?: string;
}

export default function ExpenseManager({ propertyId, maintenanceRequestId }: ExpenseManagerProps) {
  const [activeTab, setActiveTab] = useState('new');
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    type: 'maintenance',
    amount: 0,
    currency: 'USD',
    propertyId: propertyId || '',
    maintenanceRequestId: maintenanceRequestId || '',
    description: '',
    category: '',
    vendor: '',
    invoiceNumber: '',
  });

  useEffect(() => {
    loadData();
    loadExpenses();
  }, []);

  useEffect(() => {
    if (formData.propertyId) {
      loadMaintenanceRequests(formData.propertyId);
    }
  }, [formData.propertyId]);

  const loadData = async () => {
    try {
      const propertiesResult = await getProperties();
      setProperties(propertiesResult.properties);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenanceRequests = async (propertyId: string) => {
    try {
      const requests = await getMaintenanceRequests({ propertyId });
      setMaintenanceRequests(requests);
    } catch (error: any) {
      console.error('Error loading maintenance requests:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      const result = await getTransactions({
        type: 'maintenance_cost',
        propertyId: propertyId,
        pageSize: 50,
      });
      setExpenses(result.transactions);
    } catch (error: any) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (formData.amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (!formData.propertyId) {
      setError('Please select a property');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return false;
    }
    
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setSaving(true);

    try {
      let transactionId: string;

      if (formData.type === 'maintenance' && formData.maintenanceRequestId) {
        // Record as maintenance expense linked to request
        transactionId = await recordMaintenanceExpense(
          formData.maintenanceRequestId,
          formData.propertyId,
          undefined, // unitId - could be enhanced
          formData.amount,
          formData.currency,
          formData.description
        );
      } else {
        // Record as general expense
        transactionId = await createTransaction({
          type: 'service_fee', // Using service_fee for general expenses
          amount: -formData.amount, // Negative for expenses
          currency: formData.currency,
          propertyId: formData.propertyId,
          paymentMethod: 'bank_transfer',
          reference: formData.invoiceNumber || `EXP-${Date.now()}`,
          description: `${formData.category}: ${formData.description}`,
          allocatedTo: {
            owner: -formData.amount, // Expense reduces owner income
            mmg: 0,
          },
        });
      }

      setSuccess('Expense recorded successfully!');
      
      // Reset form
      setFormData({
        type: 'maintenance',
        amount: 0,
        currency: 'USD',
        propertyId: propertyId || '',
        maintenanceRequestId: maintenanceRequestId || '',
        description: '',
        category: '',
        vendor: '',
        invoiceNumber: '',
      });
      
      // Reload expenses
      await loadExpenses();
      
      // Switch to expenses tab to show the new entry
      setActiveTab('expenses');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbol = currency === 'USD' ? '$' : 'Z$';
    return `${symbol}${Math.abs(amount).toLocaleString()}`;
  };

  const getExpenseTypeColor = (type: string) => {
    const colors = {
      maintenance: 'bg-orange-100 text-orange-800',
      property_management: 'bg-blue-100 text-blue-800',
      utilities: 'bg-green-100 text-green-800',
      insurance: 'bg-purple-100 text-purple-800',
      repairs: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expense Management</h2>
          <p className="text-muted-foreground">
            Record and track property-related expenses
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">New Expense</TabsTrigger>
          <TabsTrigger value="expenses">Expense History ({expenses.length})</TabsTrigger>
        </TabsList>

        {/* New Expense Tab */}
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Record New Expense
              </CardTitle>
              <CardDescription>
                Add a new property-related expense
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
                {/* Expense Type and Category */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Expense Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Expense Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => handleInputChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Amount */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Amount</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="amount">Amount *</Label>
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
                          <SelectItem value="USD">$ US Dollars</SelectItem>
                          <SelectItem value="ZWL">Z$ Zimbabwe Dollars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Property and Maintenance Request */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Property Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyId">Property *</Label>
                      <Select 
                        value={formData.propertyId} 
                        onValueChange={(value) => handleInputChange('propertyId', value)}
                        disabled={!!propertyId}
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
                    
                    {formData.type === 'maintenance' && (
                      <div className="space-y-2">
                        <Label htmlFor="maintenanceRequestId">Maintenance Request (Optional)</Label>
                        <Select 
                          value={formData.maintenanceRequestId || ''} 
                          onValueChange={(value) => handleInputChange('maintenanceRequestId', value)}
                          disabled={!!maintenanceRequestId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select request" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No specific request</SelectItem>
                            {maintenanceRequests.map((request) => (
                              <SelectItem key={request.id} value={request.id}>
                                <div>
                                  <div className="font-medium">{request.title}</div>
                                  <div className="text-sm text-muted-foreground">{request.category}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Additional Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor">Vendor/Supplier</Label>
                      <Input
                        id="vendor"
                        placeholder="e.g., ABC Plumbing Services"
                        value={formData.vendor}
                        onChange={(e) => handleInputChange('vendor', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice/Reference Number</Label>
                      <Input
                        id="invoiceNumber"
                        placeholder="e.g., INV-001, Receipt #123"
                        value={formData.invoiceNumber}
                        onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of the expense..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab('expenses')}
                  >
                    Cancel
                  </Button>
                  
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Record Expense
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expense History Tab */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="mr-2 h-5 w-5" />
                Expense History
              </CardTitle>
              <CardDescription>
                Recent property-related expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No expenses recorded</h3>
                  <p className="text-gray-600 mb-4">
                    No property expenses have been recorded yet.
                  </p>
                  <Button onClick={() => setActiveTab('new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Record First Expense
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="bg-red-100 text-red-800">
                              {expense.type.replace('_', ' ')}
                            </Badge>
                            {expense.requestId && (
                              <Badge variant="outline">
                                <Wrench className="w-3 h-3 mr-1" />
                                Maintenance
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-lg mb-1 text-red-600">
                            -{formatCurrency(Math.abs(expense.amount), expense.currency)}
                          </h4>
                          <p className="text-muted-foreground text-sm mb-2">
                            {expense.description}
                          </p>
                          
                          <div className="flex items-center text-xs text-muted-foreground space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(expense.createdAt.toDate(), 'MMM dd, yyyy')}
                            </span>
                            <span>Ref: {expense.reference}</span>
                            {expense.requestId && (
                              <span className="flex items-center">
                                <Wrench className="w-3 h-3 mr-1" />
                                Request: {expense.requestId.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/financial/transactions/${expense.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
