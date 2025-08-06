'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Printer,
  Mail,
  Building,
  Calendar,
  DollarSign,
  User,
  Home,
  Hash
} from 'lucide-react';
import { format } from 'date-fns';
import { Transaction, Tenant, Property, Unit } from '@/lib/types';

interface ReceiptGeneratorProps {
  transaction: Transaction;
  tenant?: Tenant;
  property?: Property;
  unit?: Unit;
}

export default function ReceiptGenerator({ 
  transaction, 
  tenant, 
  property, 
  unit 
}: ReceiptGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbol = currency === 'USD' ? '$' : 'Z$';
    return `${symbol}${Math.abs(amount).toLocaleString()}`;
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      rent_payment: 'Rent Payment',
      deposit: 'Security Deposit',
      refund: 'Refund',
      maintenance_cost: 'Maintenance Expense',
      service_fee: 'Service Fee',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      mobile_money: 'Mobile Money',
      card: 'Card Payment',
    };
    return labels[method as keyof typeof labels] || method;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      // In a real implementation, this would generate a PDF using a library like jsPDF or react-pdf
      // For now, we'll simulate the download
      const blob = new Blob([generateReceiptHTML()], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${transaction.reference}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${transaction.reference}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #333; }
          .receipt-title { font-size: 20px; margin-top: 10px; }
          .info-section { margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .amount { font-size: 24px; font-weight: bold; color: #22c55e; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">MMG Property Consultancy</div>
          <div class="receipt-title">PAYMENT RECEIPT</div>
        </div>
        
        <div class="info-section">
          <div class="info-row">
            <span class="label">Receipt No:</span>
            <span class="value">${transaction.reference}</span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">${format(transaction.createdAt.toDate(), 'PPP')}</span>
          </div>
          <div class="info-row">
            <span class="label">Transaction Type:</span>
            <span class="value">${getTransactionTypeLabel(transaction.type)}</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        ${tenant ? `
          <div class="info-section">
            <h3>Tenant Information</h3>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${tenant.personalInfo.emergencyContact.name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">ID Number:</span>
              <span class="value">${tenant.personalInfo.idNumber}</span>
            </div>
          </div>
        ` : ''}
        
        ${property ? `
          <div class="info-section">
            <h3>Property Information</h3>
            <div class="info-row">
              <span class="label">Property:</span>
              <span class="value">${property.name}</span>
            </div>
            ${unit ? `
              <div class="info-row">
                <span class="label">Unit:</span>
                <span class="value">${unit.label}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        <div class="divider"></div>
        
        <div class="info-section">
          <h3>Payment Details</h3>
          <div class="info-row">
            <span class="label">Payment Method:</span>
            <span class="value">${getPaymentMethodLabel(transaction.paymentMethod)}</span>
          </div>
          <div class="info-row">
            <span class="label">Description:</span>
            <span class="value">${transaction.description}</span>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-section" style="text-align: center;">
          <div class="label">Amount Paid</div>
          <div class="amount">${formatCurrency(transaction.amount, transaction.currency)}</div>
        </div>
        
        <div class="footer">
          <p>Thank you for your payment!</p>
          <p>This is a computer-generated receipt and does not require a signature.</p>
          <p>MMG Property Consultancy | contact@mmgproperty.com | +263 XX XXX XXXX</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="receipt-container">
      <Card className="max-w-2xl mx-auto print:shadow-none">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">MMG Property Consultancy</CardTitle>
          <CardDescription className="text-lg font-semibold mt-2">
            PAYMENT RECEIPT
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Receipt Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Receipt No:</p>
              <p className="font-mono font-semibold">{transaction.reference}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date:</p>
              <p className="font-semibold">{format(transaction.createdAt.toDate(), 'PPP')}</p>
            </div>
          </div>
          
          <Separator />
          
          {/* Transaction Type */}
          <div className="text-center">
            <Badge className="text-base px-4 py-1">
              {getTransactionTypeLabel(transaction.type)}
            </Badge>
          </div>
          
          {/* Tenant Information */}
          {tenant && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Tenant Information
                </h3>
                <div className="pl-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">
                      {tenant.personalInfo.emergencyContact.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Number:</span>
                    <span className="font-medium">{tenant.personalInfo.idNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-medium">
                      {tenant.personalInfo.emergencyContact.phone || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}
          
          {/* Property Information */}
          {property && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  Property Information
                </h3>
                <div className="pl-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property:</span>
                    <span className="font-medium">{property.name}</span>
                  </div>
                  {unit && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit:</span>
                      <span className="font-medium">
                        {unit.label} - {unit.type.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium text-right max-w-xs">
                      {property.address.street}, {property.address.city}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}
          
          {/* Payment Details */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Payment Details
            </h3>
            <div className="pl-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">
                  {getPaymentMethodLabel(transaction.paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Description:</span>
                <span className="font-medium text-right max-w-xs">
                  {transaction.description}
                </span>
              </div>
              {transaction.status === 'completed' && transaction.processedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processed:</span>
                  <span className="font-medium">
                    {format(transaction.processedAt.toDate(), 'PPp')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Amount */}
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Amount Paid</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
          </div>
          
          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground space-y-2 pt-4">
            <p className="font-semibold">Thank you for your payment!</p>
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <Separator className="my-2" />
            <p>
              MMG Property Consultancy | contact@mmgproperty.com | +263 XX XXX XXXX
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-6 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
        <Button onClick={handleDownloadPDF} disabled={generating}>
          <Download className="mr-2 h-4 w-4" />
          {generating ? 'Generating...' : 'Download PDF'}
        </Button>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Email Receipt
        </Button>
      </div>
      
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .receipt-container {
            padding: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
