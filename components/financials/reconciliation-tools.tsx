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
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  Download,
  Eye,
  FileText,
  Calculator,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { UserRole } from '@/lib/types';
import { 
  ReconciliationRecord,
  FinancialTransaction,
  Currency, 
  CURRENCY_SYMBOLS,
  ReconciliationStatus
} from '@/lib/types/financials';

interface ReconciliationToolsProps {
  reconciliationRecords: ReconciliationRecord[];
  transactions: FinancialTransaction[];
  currency: Currency;
  userRole: UserRole;
  permissions: {
    canReconcile: boolean;
    canViewReports: boolean;
  };
  onReconciliationUpdate: (record: ReconciliationRecord) => void;
}

export default function ReconciliationTools({
  reconciliationRecords,
  transactions,
  currency,
  userRole,
  permissions,
  onReconciliationUpdate,
}: ReconciliationToolsProps) {
  const [selectedRecord, setSelectedRecord] = useState<ReconciliationRecord | null>(null);
  const [showNewReconciliationDialog, setShowNewReconciliationDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingStatement, setUploadingStatement] = useState(false);

  const formatCurrency = (amount: number) => {
    return `${CURRENCY_SYMBOLS[currency]}${Math.abs(amount).toLocaleString()}`;
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: ReconciliationStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reconciled: 'bg-green-100 text-green-800 border-green-200',
      discrepancy: 'bg-red-100 text-red-800 border-red-200',
      disputed: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: ReconciliationStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'reconciled':
        return <CheckCircle className="w-3 h-3" />;
      case 'discrepancy':
        return <AlertTriangle className="w-3 h-3" />;
      case 'disputed':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // Filter reconciliation records
  const filteredRecords = reconciliationRecords.filter(record => {
    const matchesSearch = record.period.includes(searchTerm) ||
                         record.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const summary = {
    total: reconciliationRecords.length,
    pending: reconciliationRecords.filter(r => r.status === 'pending').length,
    reconciled: reconciliationRecords.filter(r => r.status === 'reconciled').length,
    discrepancies: reconciliationRecords.filter(r => r.status === 'discrepancy').length,
    totalDifference: reconciliationRecords.reduce((sum, r) => sum + Math.abs(r.difference), 0),
  };

  const handleStartReconciliation = async (period: string) => {
    if (!permissions.canReconcile) return;

    // In real implementation, this would analyze transactions for the period
    // and create a new reconciliation record
    const newRecord: ReconciliationRecord = {
      id: `recon-${Date.now()}`,
      period,
      bankStatementTotal: 0, // Would be uploaded from bank statement
      systemTotal: transactions
        .filter(t => t.createdAt.toDate().toISOString().startsWith(period))
        .reduce((sum, t) => sum + t.amount, 0),
      difference: 0,
      reconciledTransactions: [],
      unreconciledTransactions: transactions
        .filter(t => t.createdAt.toDate().toISOString().startsWith(period) && !t.isReconciled)
        .map(t => t.id),
      discrepancies: [],
      status: 'pending',
      reconciledBy: 'current-user', // In real implementation, get from auth
      createdAt: new Date() as any,
    };

    onReconciliationUpdate(newRecord);
    setShowNewReconciliationDialog(false);
  };

  const handleUploadBankStatement = async (recordId: string, file: File) => {
    if (!permissions.canReconcile) return;

    setUploadingStatement(true);
    
    try {
      // In real implementation, upload and parse bank statement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const record = reconciliationRecords.find(r => r.id === recordId);
      if (!record) return;

      // Mock parsed bank statement data
      const updatedRecord: ReconciliationRecord = {
        ...record,
        bankStatementTotal: 12450.75, // Parsed from statement
        difference: record.systemTotal - 12450.75,
        status: Math.abs(record.systemTotal - 12450.75) < 1 ? 'reconciled' : 'discrepancy',
        updatedAt: new Date() as any,
      };

      onReconciliationUpdate(updatedRecord);
      
    } catch (error) {
      console.error('Error uploading bank statement:', error);
    } finally {
      setUploadingStatement(false);
    }
  };

  const handleResolveDiscrepancy = (recordId: string, resolution: string) => {
    if (!permissions.canReconcile) return;

    const record = reconciliationRecords.find(r => r.id === recordId);
    if (!record) return;

    const updatedRecord: ReconciliationRecord = {
      ...record,
      status: 'reconciled',
      notes: `${record.notes || ''}\nResolution: ${resolution}`,
      completedAt: new Date() as any,
      updatedAt: new Date() as any,
    };

    onReconciliationUpdate(updatedRecord);
  };

  if (!permissions.canReconcile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              You don't have permission to access reconciliation tools.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reconciliation Tools</h2>
          <p className="text-muted-foreground">
            Reconcile transactions with bank statements and resolve discrepancies
          </p>
        </div>
        
        <Button onClick={() => setShowNewReconciliationDialog(true)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Start New Reconciliation
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {summary.pending}
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
                <p className="text-xs font-medium text-muted-foreground">Reconciled</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.reconciled}
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
                <p className="text-xs font-medium text-muted-foreground">Discrepancies</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.discrepancies}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reconciliation records..."
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
            <SelectItem value="reconciled">Reconciled</SelectItem>
            <SelectItem value="discrepancy">Discrepancy</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reconciliation Records */}
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Records</CardTitle>
          <CardDescription>
            {filteredRecords.length} reconciliation record(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reconciliation records</h3>
              <p className="text-gray-600 mb-4">
                Start your first reconciliation to track and resolve discrepancies.
              </p>
              <Button onClick={() => setShowNewReconciliationDialog(true)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start New Reconciliation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Record Header */}
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getStatusColor(record.status)}>
                          {getStatusIcon(record.status)}
                          <span className="ml-1 capitalize">{record.status.replace('_', ' ')}</span>
                        </Badge>
                        
                        <span className="text-sm font-medium">
                          Period: {format(new Date(record.period + '-01'), 'MMMM yyyy')}
                        </span>
                      </div>

                      {/* Financial Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-xs font-medium text-gray-600">Bank Statement</span>
                          <p className="text-lg font-bold text-blue-600">
                            {formatCurrency(record.bankStatementTotal)}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-600">System Total</span>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(record.systemTotal)}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-600">Difference</span>
                          <p className={`text-lg font-bold ${
                            Math.abs(record.difference) < 1 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {record.difference >= 0 ? '+' : ''}
                            {formatCurrency(record.difference)}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-600">Discrepancies</span>
                          <p className="text-lg font-bold text-orange-600">
                            {record.discrepancies.length}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Reconciliation Progress</span>
                          <span>
                            {record.reconciledTransactions.length} / 
                            {record.reconciledTransactions.length + record.unreconciledTransactions.length} transactions
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                ((record.reconciledTransactions.length / 
                                  (record.reconciledTransactions.length + record.unreconciledTransactions.length)) * 100) || 0
                              }%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Discrepancies */}
                      {record.discrepancies.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                          <h5 className="font-medium text-red-800 mb-2">
                            Discrepancies Found ({record.discrepancies.length})
                          </h5>
                          <div className="space-y-2">
                            {record.discrepancies.slice(0, 2).map((discrepancy, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">Transaction {discrepancy.transactionId.slice(-8)}:</span>
                                <span className="text-red-700 ml-2">
                                  System: {formatCurrency(discrepancy.systemAmount)} | 
                                  Bank: {formatCurrency(discrepancy.bankAmount)} | 
                                  Diff: {formatCurrency(discrepancy.difference)}
                                </span>
                                {discrepancy.reason && (
                                  <p className="text-xs text-red-600 mt-1">{discrepancy.reason}</p>
                                )}
                              </div>
                            ))}
                            {record.discrepancies.length > 2 && (
                              <p className="text-xs text-red-600">
                                +{record.discrepancies.length - 2} more discrepancies
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                          <h5 className="font-medium text-blue-800 mb-1">Notes:</h5>
                          <p className="text-sm text-blue-700">{record.notes}</p>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>Created: {formatDate(record.createdAt)}</span>
                        {record.completedAt && (
                          <span>Completed: {formatDate(record.completedAt)}</span>
                        )}
                        <span>By: {record.reconciledBy}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      
                      {record.status === 'pending' && record.bankStatementTotal === 0 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.csv,.xlsx,.pdf';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleUploadBankStatement(record.id, file);
                            };
                            input.click();
                          }}
                          disabled={uploadingStatement}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload Statement
                        </Button>
                      )}
                      
                      {record.status === 'discrepancy' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleResolveDiscrepancy(record.id, 'Manual resolution')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reconciliation Details Dialog */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Reconciliation Details</DialogTitle>
              <DialogDescription>
                Detailed view of reconciliation for {format(new Date(selectedRecord.period + '-01'), 'MMMM yyyy')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Bank Statement</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedRecord.bankStatementTotal)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">System Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedRecord.systemTotal)}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 mb-1">Difference</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(selectedRecord.difference)}
                  </p>
                </div>
              </div>

              {/* Reconciled Transactions */}
              <div>
                <h4 className="font-medium mb-3 text-green-600">
                  Reconciled Transactions ({selectedRecord.reconciledTransactions.length})
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {selectedRecord.reconciledTransactions.length === 0 ? (
                    <p className="text-gray-500 text-sm">No transactions reconciled yet</p>
                  ) : (
                    <div className="space-y-1 text-sm">
                      {selectedRecord.reconciledTransactions.map((transactionId, index) => (
                        <div key={index} className="p-2 bg-green-50 rounded">
                          Transaction: {transactionId}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Unreconciled Transactions */}
              <div>
                <h4 className="font-medium mb-3 text-yellow-600">
                  Unreconciled Transactions ({selectedRecord.unreconciledTransactions.length})
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {selectedRecord.unreconciledTransactions.length === 0 ? (
                    <p className="text-gray-500 text-sm">All transactions reconciled</p>
                  ) : (
                    <div className="space-y-1 text-sm">
                      {selectedRecord.unreconciledTransactions.map((transactionId, index) => (
                        <div key={index} className="p-2 bg-yellow-50 rounded">
                          Transaction: {transactionId}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Discrepancies */}
              {selectedRecord.discrepancies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-red-600">
                    Discrepancies ({selectedRecord.discrepancies.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.discrepancies.map((discrepancy, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">System:</span>
                            <p>{formatCurrency(discrepancy.systemAmount)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Bank:</span>
                            <p>{formatCurrency(discrepancy.bankAmount)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Difference:</span>
                            <p className="text-red-600 font-bold">
                              {formatCurrency(discrepancy.difference)}
                            </p>
                          </div>
                        </div>
                        {discrepancy.reason && (
                          <p className="text-xs text-red-600 mt-2">{discrepancy.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Reconciliation Dialog */}
      <Dialog open={showNewReconciliationDialog} onOpenChange={setShowNewReconciliationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Reconciliation</DialogTitle>
            <DialogDescription>
              Begin reconciliation process for a specific period
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Period
              </label>
              <Select onValueChange={(value) => handleStartReconciliation(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period to reconcile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-12">December 2024</SelectItem>
                  <SelectItem value="2024-11">November 2024</SelectItem>
                  <SelectItem value="2024-10">October 2024</SelectItem>
                  <SelectItem value="2024-09">September 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>This will:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Analyze all transactions for the selected period</li>
                <li>Create a new reconciliation record</li>
                <li>Allow you to upload bank statements for comparison</li>
                <li>Identify discrepancies automatically</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}