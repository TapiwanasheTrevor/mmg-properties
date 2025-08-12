'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  FileText,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { format } from 'date-fns';
import { UserRole } from '@/lib/types';
import { 
  FinancialTransaction, 
  Currency, 
  CURRENCY_SYMBOLS, 
  TRANSACTION_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  TransactionCategory,
  TransactionStatus 
} from '@/lib/types/financials';

interface TransactionManagementProps {
  transactions: FinancialTransaction[];
  currency: Currency;
  userRole: UserRole;
  permissions: {
    canProcessTransactions: boolean;
    canViewReports: boolean;
    canExportData: boolean;
  };
  onTransactionUpdate: (transaction: FinancialTransaction) => void;
}

export default function TransactionManagement({
  transactions,
  currency,
  userRole,
  permissions,
  onTransactionUpdate,
}: TransactionManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showNewTransactionDialog, setShowNewTransactionDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);

  const formatCurrency = (amount: number) => {
    return `${CURRENCY_SYMBOLS[currency]}${Math.abs(amount).toLocaleString()}`;
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      reconciled: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'failed':
        return <AlertTriangle className="w-3 h-3" />;
      case 'cancelled':
        return <X className="w-3 h-3" />;
      case 'reconciled':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: TransactionCategory) => {
    const colors = {
      rent_payment: 'bg-green-100 text-green-800',
      deposit: 'bg-blue-100 text-blue-800',
      maintenance_cost: 'bg-red-100 text-red-800',
      service_fee: 'bg-purple-100 text-purple-800',
      utility_bill: 'bg-orange-100 text-orange-800',
      insurance: 'bg-indigo-100 text-indigo-800',
      tax_payment: 'bg-pink-100 text-pink-800',
      commission: 'bg-teal-100 text-teal-800',
      refund: 'bg-yellow-100 text-yellow-800',
      penalty: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.propertyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleProcessTransaction = (transactionId: string) => {
    if (!permissions.canProcessTransactions) return;
    
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const updatedTransaction: FinancialTransaction = {
      ...transaction,
      status: 'completed',
      processedBy: 'current-user-id', // In real implementation, get from auth
      processedAt: new Date() as any, // Convert to Timestamp in real implementation
      updatedAt: new Date() as any,
    };

    onTransactionUpdate(updatedTransaction);
  };

  const handleViewTransaction = (transaction: FinancialTransaction) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaction Management</h2>
          <p className="text-muted-foreground">
            Manage all financial transactions and payments
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {permissions.canProcessTransactions && (
            <Button onClick={() => setShowNewTransactionDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Transaction
            </Button>
          )}
          
          {permissions.canExportData && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="reconciled">Reconciled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="rent_payment">Rent Payment</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="maintenance_cost">Maintenance</SelectItem>
            <SelectItem value="service_fee">Service Fee</SelectItem>
            <SelectItem value="utility_bill">Utility Bill</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {transactions.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {transactions.filter(t => t.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredTransactions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600 mb-4">
                No transactions match your current filters.
              </p>
              {permissions.canProcessTransactions && (
                <Button onClick={() => setShowNewTransactionDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record New Transaction
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Transaction Header */}
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getTypeColor(transaction.type)}>
                          {TRANSACTION_CATEGORY_LABELS[transaction.type]}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(transaction.status)}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status}</span>
                        </Badge>
                        {transaction.isReconciled && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Reconciled
                          </Badge>
                        )}
                      </div>

                      {/* Amount */}
                      <h4 className={`text-lg font-bold mb-1 ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}
                        {formatCurrency(transaction.amount)}
                        <span className="text-sm text-gray-500 ml-1">
                          {transaction.currency}
                        </span>
                      </h4>

                      {/* Description */}
                      <p className="text-gray-900 mb-2 font-medium">
                        {transaction.description}
                      </p>

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Property:</span>
                          <br />
                          {transaction.propertyName}
                          {transaction.unitNumber && ` - Unit ${transaction.unitNumber}`}
                        </div>
                        
                        {transaction.tenantName && (
                          <div>
                            <span className="font-medium">Tenant:</span>
                            <br />
                            {transaction.tenantName}
                          </div>
                        )}
                        
                        <div>
                          <span className="font-medium">Payment Method:</span>
                          <br />
                          {PAYMENT_METHOD_LABELS[transaction.paymentMethod]}
                        </div>
                        
                        <div>
                          <span className="font-medium">Reference:</span>
                          <br />
                          {transaction.reference}
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Created: {formatDate(transaction.createdAt)}
                        </span>
                        {transaction.processedAt && (
                          <span className="flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Processed: {formatDate(transaction.processedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTransaction(transaction)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTransaction(transaction)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          {permissions.canProcessTransactions && transaction.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleProcessTransaction(transaction.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Process Transaction
                            </DropdownMenuItem>
                          )}
                          
                          {transaction.attachments.length > 0 && (
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download Receipt
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Complete information for transaction {selectedTransaction.reference}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <p className={`text-lg font-bold ${
                    selectedTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(selectedTransaction.amount)} {selectedTransaction.currency}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedTransaction.status)}>
                      {getStatusIcon(selectedTransaction.status)}
                      <span className="ml-1 capitalize">{selectedTransaction.status}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Allocation Details */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Allocation</label>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="text-xs text-gray-600">Owner Share</span>
                    <p className="font-medium">
                      {formatCurrency(selectedTransaction.allocation.ownerAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">MMG Commission</span>
                    <p className="font-medium">
                      {formatCurrency(selectedTransaction.allocation.mmgCommission)}
                    </p>
                  </div>
                  {selectedTransaction.allocation.vatAmount && (
                    <div>
                      <span className="text-xs text-gray-600">VAT</span>
                      <p className="font-medium">
                        {formatCurrency(selectedTransaction.allocation.vatAmount)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedTransaction.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="mt-1 text-gray-900">{selectedTransaction.notes}</p>
                </div>
              )}

              {/* Attachments */}
              {selectedTransaction.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Attachments</label>
                  <div className="space-y-2">
                    {selectedTransaction.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center p-2 border rounded">
                        <FileText className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="flex-1 text-sm">{attachment.split('/').pop()}</span>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Transaction Dialog */}
      {showNewTransactionDialog && (
        <Dialog open={showNewTransactionDialog} onOpenChange={setShowNewTransactionDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Record New Transaction</DialogTitle>
              <DialogDescription>
                Add a new financial transaction to the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="text-center py-8">
              <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                Transaction form would be implemented here with proper validation
                and integration with the financial services.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}