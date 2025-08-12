'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Filter,
  Search,
  Download,
  RefreshCw,
  ArrowUpDown,
} from 'lucide-react';
import {
  FinancialTransaction,
  TransactionStatus,
  TransactionCategory,
  PaymentMethod,
  Currency,
  TRANSACTION_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  CURRENCY_SYMBOLS,
} from '@/lib/types/financials';

interface TransactionListProps {
  transactions: FinancialTransaction[];
  loading: boolean;
  userRole: string;
  canEdit: boolean;
  canSelect?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onRefresh: () => void;
}

interface Filters {
  search: string;
  status: string;
  type: string;
  paymentMethod: string;
  currency: string;
  dateFrom: string;
  dateTo: string;
}

export default function TransactionList({
  transactions,
  loading,
  userRole,
  canEdit,
  canSelect = false,
  selectedIds = [],
  onSelect,
  onSelectAll,
  onRefresh,
}: TransactionListProps) {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<keyof FinancialTransaction>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    type: '',
    paymentMethod: '',
    currency: '',
    dateFrom: '',
    dateTo: '',
  });

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter(transaction => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !transaction.description.toLowerCase().includes(searchLower) &&
        !transaction.reference.toLowerCase().includes(searchLower) &&
        !(transaction.propertyName?.toLowerCase().includes(searchLower)) &&
        !(transaction.tenantName?.toLowerCase().includes(searchLower))
      ) {
        return false;
      }
    }

    if (filters.status && transaction.status !== filters.status) return false;
    if (filters.type && transaction.type !== filters.type) return false;
    if (filters.paymentMethod && transaction.paymentMethod !== filters.paymentMethod) return false;
    if (filters.currency && transaction.currency !== filters.currency) return false;

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      if (transaction.createdAt.toDate() < fromDate) return false;
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (transaction.createdAt.toDate() > toDate) return false;
    }

    return true;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortBy === 'createdAt') {
      const aTime = (aValue as any)?.toDate?.()?.getTime() || 0;
      const bTime = (bValue as any)?.toDate?.()?.getTime() || 0;
      return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    }
    
    const aStr = String(aValue || '');
    const bStr = String(bValue || '');
    return sortOrder === 'desc' 
      ? bStr.localeCompare(aStr)
      : aStr.localeCompare(bStr);
  });

  const handleSort = (field: keyof FinancialTransaction) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      type: '',
      paymentMethod: '',
      currency: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const getStatusColor = (status: TransactionStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      reconciled: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatAmount = (amount: number, currency: Currency) => {
    const symbol = CURRENCY_SYMBOLS[currency];
    return `${symbol}${Math.abs(amount).toLocaleString()}`;
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const allSelected = selectedIds.length > 0 && selectedIds.length === sortedTransactions.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < sortedTransactions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters {Object.values(filters).some(v => v) && '(Active)'}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="reconciled">Reconciled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {Object.entries(TRANSACTION_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.currency} onValueChange={(value) => handleFilterChange('currency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Currencies</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="ZWL">ZWL</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From Date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />

            <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {sortedTransactions.length} of {transactions.length} transactions
        {Object.values(filters).some(v => v) && ' (filtered)'}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {canSelect && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected || someSelected}
                    onCheckedChange={(checked) => onSelectAll?.(!!checked)}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                  />
                </TableHead>
              )}
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center space-x-1">
                  <span>Amount</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={canSelect ? 10 : 9} 
                  className="h-24 text-center text-gray-500"
                >
                  {transactions.length === 0 
                    ? 'No transactions found'
                    : 'No transactions match the current filters'
                  }
                </TableCell>
              </TableRow>
            ) : (
              sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50">
                  {canSelect && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(transaction.id)}
                        onCheckedChange={(checked) => onSelect?.(transaction.id, !!checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    {formatDate(transaction.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {TRANSACTION_CATEGORY_LABELS[transaction.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatAmount(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={transaction.description}>
                    {transaction.description}
                  </TableCell>
                  <TableCell>
                    {transaction.propertyName || transaction.propertyId}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {PAYMENT_METHOD_LABELS[transaction.paymentMethod]}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {transaction.reference}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => router.push(`/financials/transactions/${transaction.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem
                            onClick={() => router.push(`/financials/transactions/${transaction.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Transaction
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => navigator.clipboard.writeText(transaction.reference)}
                        >
                          Copy Reference
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination would go here if needed */}
    </div>
  );
}