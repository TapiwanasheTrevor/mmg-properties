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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  AlertCircle, 
  Check, 
  Loader2, 
  Upload, 
  X,
  DollarSign,
  Calculator,
  Receipt
} from 'lucide-react';
import {
  FinancialTransaction,
  TransactionCategory,
  PaymentMethod,
  Currency,
  TransactionFormData,
  PAYMENT_METHOD_LABELS,
  TRANSACTION_CATEGORY_LABELS,
  CURRENCY_SYMBOLS,
  ZIMBABWE_TAX_RATES
} from '@/lib/types/financials';
import { 
  createTransaction, 
  updateTransaction, 
  uploadTransactionAttachment,
  calculateTransactionAllocation 
} from '@/lib/services/financials';

interface TransactionFormProps {
  transaction?: FinancialTransaction;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
}

export default function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<TransactionFormData>({
    type: transaction?.type || 'rent_payment',
    amount: transaction?.amount || 0,
    currency: transaction?.currency || 'USD',
    description: transaction?.description || '',
    propertyId: transaction?.propertyId || '',
    unitId: transaction?.unitId || '',
    tenantId: transaction?.tenantId || '',
    paymentMethod: transaction?.paymentMethod || 'bank_transfer',
    reference: transaction?.reference || '',
    receiptNumber: transaction?.receiptNumber || '',
    vatAmount: transaction?.allocation?.vatAmount || 0,
    withholdingTax: transaction?.allocation?.withholdingTax || 0,
    notes: transaction?.notes || '',
  });

  const [calculatedAllocation, setCalculatedAllocation] = useState({
    ownerAmount: 0,
    mmgCommission: 0,
    agentCommission: 0,
    vatAmount: 0,
    withholdingTax: 0,
  });

  // Calculate allocation whenever amount, type, or currency changes
  useEffect(() => {
    if (formData.amount > 0) {
      const allocation = calculateTransactionAllocation(
        formData.amount,
        formData.type,
        formData.currency
      );
      setCalculatedAllocation(allocation);
      
      // Update form with calculated values
      setFormData(prev => ({
        ...prev,
        vatAmount: allocation.vatAmount || 0,
        withholdingTax: allocation.withholdingTax || 0,
      }));
    }
  }, [formData.amount, formData.type, formData.currency]);

  const handleInputChange = (field: keyof TransactionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (attachmentFiles.length + files.length > 5) {
      setError('Maximum 5 attachments allowed');
      return;
    }

    setAttachmentFiles(prev => [...prev, ...files]);
    
    // Create previews for image files
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachmentPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreviews(prev => [...prev, 'file']);
      }
    });
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }

    if (!formData.propertyId) {
      setError('Property selection is required');
      return false;
    }

    if (!formData.reference.trim()) {
      setError('Reference is required');
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
      let transactionId = transaction?.id;

      // Prepare transaction data
      const transactionData = {
        type: formData.type,
        amount: formData.amount,
        currency: formData.currency,
        description: formData.description,
        propertyId: formData.propertyId,
        unitId: formData.unitId || undefined,
        tenantId: formData.tenantId || undefined,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference,
        receiptNumber: formData.receiptNumber || undefined,
        allocation: {
          ownerAmount: calculatedAllocation.ownerAmount,
          mmgCommission: calculatedAllocation.mmgCommission,
          agentCommission: calculatedAllocation.agentCommission,
          vatAmount: calculatedAllocation.vatAmount,
          withholdingTax: calculatedAllocation.withholdingTax,
        },
        attachments: transaction?.attachments || [],
        notes: formData.notes,
        createdBy: user.uid,
      };

      if (transaction) {
        // Update existing transaction
        await updateTransaction(transaction.id, transactionData);
      } else {
        // Create new transaction
        transactionId = await createTransaction(transactionData);
      }

      // Upload attachments if any
      if (attachmentFiles.length > 0 && transactionId) {
        const uploadPromises = attachmentFiles.map(file => 
          uploadTransactionAttachment(transactionId!, file, 'receipt')
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        
        // Update transaction with attachment URLs
        const existingAttachments = transaction?.attachments || [];
        await updateTransaction(transactionId, {
          attachments: [...existingAttachments, ...uploadedUrls],
        });
      }

      setSuccess(transaction ? 'Transaction updated successfully!' : 'Transaction created successfully!');
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(transactionId!);
        } else {
          router.push('/financials/transactions');
        }
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency: Currency) => CURRENCY_SYMBOLS[currency];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <DollarSign className="mr-2 h-6 w-6" />
            {transaction ? 'Edit Transaction' : 'Create New Transaction'}
          </CardTitle>
          <CardDescription>
            {transaction ? 'Update transaction details and allocation' : 'Record a new financial transaction with automatic allocation calculations'}
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
            {/* Transaction Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Receipt className="mr-2 h-5 w-5" />
                Transaction Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type *</Label>
                  <Select value={formData.type} onValueChange={(value: TransactionCategory) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRANSACTION_CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value: Currency) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="ZWL">ZWL (Z$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {getCurrencySymbol(formData.currency)}
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the transaction..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={2}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Payment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value: PaymentMethod) => handleInputChange('paymentMethod', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference *</Label>
                  <Input
                    id="reference"
                    placeholder="Payment reference/transaction ID"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt Number</Label>
                <Input
                  id="receiptNumber"
                  placeholder="Receipt or invoice number"
                  value={formData.receiptNumber}
                  onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Allocation Breakdown */}
            {formData.amount > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Automatic Allocation Breakdown
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Owner Amount:</span>
                      <Badge variant="secondary">
                        {getCurrencySymbol(formData.currency)}{calculatedAllocation.ownerAmount.toFixed(2)}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">MMG Commission:</span>
                      <Badge variant="secondary">
                        {getCurrencySymbol(formData.currency)}{calculatedAllocation.mmgCommission.toFixed(2)}
                      </Badge>
                    </div>

                    {calculatedAllocation.agentCommission > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Agent Commission:</span>
                        <Badge variant="secondary">
                          {getCurrencySymbol(formData.currency)}{calculatedAllocation.agentCommission.toFixed(2)}
                        </Badge>
                      </div>
                    )}

                    {calculatedAllocation.vatAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">VAT ({ZIMBABWE_TAX_RATES.VAT}%):</span>
                        <Badge variant="outline">
                          {getCurrencySymbol(formData.currency)}{calculatedAllocation.vatAmount.toFixed(2)}
                        </Badge>
                      </div>
                    )}

                    {calculatedAllocation.withholdingTax > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Withholding Tax:</span>
                        <Badge variant="outline">
                          {getCurrencySymbol(formData.currency)}{calculatedAllocation.withholdingTax.toFixed(2)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Attachments */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Attachments</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> receipts or proof of payment
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB each (max 5 files)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Attachment Previews */}
                {attachmentPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {attachmentPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        {preview === 'file' ? (
                          <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Receipt className="w-8 h-8 text-gray-400" />
                          </div>
                        ) : (
                          <img
                            src={preview}
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {attachmentFiles[index]?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Existing Attachments */}
                {transaction && transaction.attachments && transaction.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Existing Attachments</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {transaction.attachments.map((attachment, index) => (
                        <div key={index} className="relative">
                          <img
                            src={attachment}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or comments..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
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
                    {transaction ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {transaction ? 'Update Transaction' : 'Create Transaction'}
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