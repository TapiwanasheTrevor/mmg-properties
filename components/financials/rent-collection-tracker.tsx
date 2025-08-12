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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Eye,
  MoreHorizontal,
  Search,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { UserRole } from '@/lib/types';
import { RentCollection, Currency, CURRENCY_SYMBOLS } from '@/lib/types/financials';

interface RentCollectionTrackerProps {
  rentCollections: RentCollection[];
  currency: Currency;
  userRole: UserRole;
  permissions: {
    canProcessTransactions: boolean;
    canViewReports: boolean;
  };
  onCollectionUpdate: (collection: RentCollection) => void;
}

export default function RentCollectionTracker({
  rentCollections,
  currency,
  userRole,
  permissions,
  onCollectionUpdate,
}: RentCollectionTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<RentCollection | null>(null);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedForReminder, setSelectedForReminder] = useState<RentCollection | null>(null);

  const formatCurrency = (amount: number) => {
    return `${CURRENCY_SYMBOLS[currency]}${amount.toLocaleString()}`;
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const getCollectionStatusColor = (status: string) => {
    const colors = {
      current: 'bg-green-100 text-green-800 border-green-200',
      overdue: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_arrears: 'bg-red-100 text-red-800 border-red-200',
      eviction_notice: 'bg-purple-100 text-purple-800 border-purple-200',
      legal_action: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCollectionStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
        return <CheckCircle className="w-3 h-3" />;
      case 'overdue':
        return <Clock className="w-3 h-3" />;
      case 'in_arrears':
        return <AlertTriangle className="w-3 h-3" />;
      case 'eviction_notice':
        return <AlertTriangle className="w-3 h-3" />;
      case 'legal_action':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getOverdueClass = (daysOverdue: number) => {
    if (daysOverdue === 0) return 'text-green-600';
    if (daysOverdue <= 7) return 'text-yellow-600';
    if (daysOverdue <= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  // Filter collections
  const filteredCollections = rentCollections.filter(collection => {
    const searchMatches = 
      collection.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.period.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatches = statusFilter === 'all' || collection.collectionStatus === statusFilter;
    
    return searchMatches && statusMatches;
  });

  // Calculate summary statistics
  const summary = {
    total: rentCollections.length,
    current: rentCollections.filter(c => c.collectionStatus === 'current').length,
    overdue: rentCollections.filter(c => c.collectionStatus === 'overdue').length,
    inArrears: rentCollections.filter(c => c.collectionStatus === 'in_arrears').length,
    totalRentDue: rentCollections.reduce((sum, c) => sum + c.rentAmount, 0),
    totalCollected: rentCollections.reduce((sum, c) => sum + c.amountPaid, 0),
    totalOutstanding: rentCollections.reduce((sum, c) => sum + c.amountOutstanding, 0),
  };

  const collectionRate = summary.totalRentDue > 0 ? (summary.totalCollected / summary.totalRentDue) * 100 : 0;

  const handleSendReminder = (collection: RentCollection, type: string, method: string) => {
    // In real implementation, integrate with notification system
    console.log(`Sending ${type} reminder via ${method} for collection ${collection.id}`);
    
    const updatedCollection: RentCollection = {
      ...collection,
      remindersSent: [
        ...collection.remindersSent,
        {
          type: type as any,
          sentDate: new Date() as any, // Convert to Timestamp in real implementation
          method: method as any,
        }
      ],
      updatedAt: new Date() as any,
    };

    onCollectionUpdate(updatedCollection);
    setShowReminderDialog(false);
    setSelectedForReminder(null);
  };

  const handleMarkAsPaid = (collectionId: string, amount: number) => {
    const collection = rentCollections.find(c => c.id === collectionId);
    if (!collection) return;

    const updatedCollection: RentCollection = {
      ...collection,
      amountPaid: collection.amountPaid + amount,
      amountOutstanding: Math.max(0, collection.amountOutstanding - amount),
      isFullyPaid: (collection.amountPaid + amount) >= collection.rentAmount,
      collectionStatus: (collection.amountPaid + amount) >= collection.rentAmount ? 'current' : collection.collectionStatus,
      payments: [
        ...collection.payments,
        {
          transactionId: `payment-${Date.now()}`,
          amount,
          paidDate: new Date() as any,
          paymentMethod: 'bank_transfer', // Default, would be selected by user
        }
      ],
      updatedAt: new Date() as any,
    };

    onCollectionUpdate(updatedCollection);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rent Collection Tracker</h2>
          <p className="text-muted-foreground">
            Monitor and manage rent collections across all properties
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Collection Rate</p>
                <p className={`text-2xl font-bold ${
                  collectionRate >= 90 ? 'text-green-600' : 
                  collectionRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {collectionRate.toFixed(1)}%
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
                <p className="text-xs font-medium text-muted-foreground">Current</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.current}
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
                <p className="text-xs font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {summary.overdue}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalOutstanding)}
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
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Collection Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="current">Current</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="in_arrears">In Arrears</SelectItem>
            <SelectItem value="eviction_notice">Eviction Notice</SelectItem>
            <SelectItem value="legal_action">Legal Action</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Collections List */}
      <Card>
        <CardHeader>
          <CardTitle>Rent Collections</CardTitle>
          <CardDescription>
            {filteredCollections.length} collection record(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCollections.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No collections found</h3>
              <p className="text-gray-600">
                No rent collections match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Collection Header */}
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getCollectionStatusColor(collection.collectionStatus)}>
                          {getCollectionStatusIcon(collection.collectionStatus)}
                          <span className="ml-1 capitalize">
                            {collection.collectionStatus.replace('_', ' ')}
                          </span>
                        </Badge>
                        
                        {collection.isOverdue && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {collection.daysOverdue} days overdue
                          </Badge>
                        )}
                        
                        {collection.isFullyPaid && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Fully Paid
                          </Badge>
                        )}
                      </div>

                      {/* Amount Information */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-xs font-medium text-gray-600">Rent Amount</span>
                          <p className="font-bold text-lg">
                            {formatCurrency(collection.rentAmount)}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-600">Amount Paid</span>
                          <p className="font-medium text-green-600">
                            {formatCurrency(collection.amountPaid)}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-600">Outstanding</span>
                          <p className={`font-medium ${
                            collection.amountOutstanding > 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {formatCurrency(collection.amountOutstanding)}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-medium text-gray-600">Late Fees</span>
                          <p className="font-medium text-orange-600">
                            {formatCurrency(collection.lateFees)}
                          </p>
                        </div>
                      </div>

                      {/* Property and Period Information */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Period:</span>
                          <br />
                          {format(new Date(collection.period + '-01'), 'MMMM yyyy')}
                        </div>
                        
                        <div>
                          <span className="font-medium">Due Date:</span>
                          <br />
                          {formatDate(collection.dueDate)}
                        </div>
                        
                        <div>
                          <span className="font-medium">Unit:</span>
                          <br />
                          Unit {collection.unitId}
                        </div>
                      </div>

                      {/* Reminders Sent */}
                      {collection.remindersSent.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-gray-600 mb-2 block">
                            Recent Reminders:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {collection.remindersSent.slice(-3).map((reminder, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {reminder.type} via {reminder.method}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {collection.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                          <span className="text-xs font-medium text-yellow-800">Note:</span>
                          <p className="text-sm text-yellow-700 mt-1">{collection.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCollection(collection)}
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
                          <DropdownMenuItem onClick={() => setSelectedCollection(collection)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          
                          {permissions.canProcessTransactions && !collection.isFullyPaid && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(collection.id, collection.amountOutstanding)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          
                          {collection.isOverdue && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedForReminder(collection);
                              setShowReminderDialog(true);
                            }}>
                              <Send className="w-4 h-4 mr-2" />
                              Send Reminder
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

      {/* Collection Details Dialog */}
      {selectedCollection && (
        <Dialog open={!!selectedCollection} onOpenChange={() => setSelectedCollection(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Rent Collection Details</DialogTitle>
              <DialogDescription>
                Complete information for {format(new Date(selectedCollection.period + '-01'), 'MMMM yyyy')} collection
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Payment History */}
              <div>
                <h4 className="font-medium mb-3">Payment History</h4>
                {selectedCollection.payments.length === 0 ? (
                  <p className="text-gray-500 text-sm">No payments recorded</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCollection.payments.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{formatCurrency(payment.amount)}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            via {payment.paymentMethod}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDate(payment.paidDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reminder History */}
              <div>
                <h4 className="font-medium mb-3">Reminder History</h4>
                {selectedCollection.remindersSent.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reminders sent</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCollection.remindersSent.map((reminder, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium capitalize">{reminder.type.replace('_', ' ')}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            via {reminder.method}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDate(reminder.sentDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Send Reminder Dialog */}
      {showReminderDialog && selectedForReminder && (
        <Dialog open={showReminderDialog} onOpenChange={() => {
          setShowReminderDialog(false);
          setSelectedForReminder(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Payment Reminder</DialogTitle>
              <DialogDescription>
                Send a payment reminder for {format(new Date(selectedForReminder.period + '-01'), 'MMMM yyyy')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleSendReminder(selectedForReminder, 'reminder', 'email')}
                  className="flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  onClick={() => handleSendReminder(selectedForReminder, 'reminder', 'sms')}
                  className="flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  SMS
                </Button>
                <Button
                  onClick={() => handleSendReminder(selectedForReminder, 'reminder', 'whatsapp')}
                  className="flex items-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">
                  Outstanding amount: <strong>{formatCurrency(selectedForReminder.amountOutstanding)}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Days overdue: <strong className={getOverdueClass(selectedForReminder.daysOverdue)}>
                    {selectedForReminder.daysOverdue} days
                  </strong>
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}