'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, 
  Calendar, 
  Mail, 
  MessageSquare,
  DollarSign,
  AlertCircle,
  Clock,
  Send,
  Settings,
  User
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { Lease, Tenant } from '@/lib/types';
import { getActiveLeases } from '@/lib/services/leases';
import { getTenant } from '@/lib/services/tenants';
import { getRentPayments } from '@/lib/services/transactions';
import { createNotification } from '@/lib/services/notifications';

interface PaymentReminder {
  leaseId: string;
  tenantId: string;
  tenantName: string;
  unitLabel: string;
  propertyName: string;
  rentAmount: number;
  currency: string;
  dueDate: Date;
  daysUntilDue: number;
  isOverdue: boolean;
  lastPaymentDate?: Date;
  remindersSent: number;
}

export default function PaymentReminders() {
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  
  // Reminder settings
  const [autoReminders, setAutoReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState('7'); // Days before due date
  const [overdueFrequency, setOverdueFrequency] = useState('3'); // Days between overdue reminders

  useEffect(() => {
    loadPaymentReminders();
  }, []);

  const loadPaymentReminders = async () => {
    setLoading(true);
    setError('');

    try {
      // Get all active leases
      const activeLeases = await getActiveLeases();
      const remindersList: PaymentReminder[] = [];
      
      for (const lease of activeLeases) {
        // Get tenant information
        const tenant = await getTenant(lease.tenantId);
        if (!tenant) continue;
        
        // Get recent rent payments for this lease
        const recentPayments = await getRentPayments({ leaseId: lease.id });
        const lastPayment = recentPayments.length > 0 ? recentPayments[0] : null;
        
        // Calculate next due date based on payment frequency
        const today = new Date();
        let nextDueDate: Date;
        
        if (lastPayment) {
          // Calculate based on last payment
          const lastPaymentDate = lastPayment.createdAt.toDate();
          if (lease.terms.paymentFrequency === 'monthly') {
            nextDueDate = new Date(lastPaymentDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          } else if (lease.terms.paymentFrequency === 'quarterly') {
            nextDueDate = new Date(lastPaymentDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 3);
          } else {
            // Yearly
            nextDueDate = new Date(lastPaymentDate);
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          }
        } else {
          // No payment yet, use lease start date
          nextDueDate = lease.dates.startDate.toDate();
        }
        
        const daysUntilDue = differenceInDays(nextDueDate, today);
        const isOverdue = daysUntilDue < 0;
        
        // Only include if payment is due within 30 days or overdue
        if (daysUntilDue <= 30) {
          remindersList.push({
            leaseId: lease.id,
            tenantId: lease.tenantId,
            tenantName: tenant.personalInfo.emergencyContact.name || 'Unknown Tenant',
            unitLabel: lease.unitId, // This would need to be enhanced with actual unit label
            propertyName: lease.propertyId, // This would need to be enhanced with actual property name
            rentAmount: lease.terms.rentAmount,
            currency: lease.terms.currency,
            dueDate: nextDueDate,
            daysUntilDue,
            isOverdue,
            lastPaymentDate: lastPayment ? lastPayment.createdAt.toDate() : undefined,
            remindersSent: 0, // This would come from a reminder tracking system
          });
        }
      }
      
      // Sort by due date (overdue first, then upcoming)
      remindersList.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
      
      setReminders(remindersList);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (reminder: PaymentReminder) => {
    setSending(reminder.leaseId);
    setError('');
    setSuccess('');
    
    try {
      // Create notification
      const notificationType = reminder.isOverdue ? 'payment_due' : 'payment_due';
      const priority = reminder.isOverdue ? 'high' : 'medium';
      const title = reminder.isOverdue 
        ? `Overdue: Rent Payment ${Math.abs(reminder.daysUntilDue)} Days Late`
        : `Reminder: Rent Due in ${reminder.daysUntilDue} Days`;
      
      const message = reminder.isOverdue
        ? `Rent payment of ${reminder.currency} ${reminder.rentAmount.toLocaleString()} for ${reminder.unitLabel} is ${Math.abs(reminder.daysUntilDue)} days overdue. Please make payment immediately to avoid penalties.`
        : `Rent payment of ${reminder.currency} ${reminder.rentAmount.toLocaleString()} for ${reminder.unitLabel} is due on ${format(reminder.dueDate, 'PPP')}. Please ensure timely payment.`;
      
      await createNotification({
        type: notificationType,
        title,
        message,
        recipients: [reminder.tenantId],
        relatedId: reminder.leaseId,
        priority,
      });
      
      setSuccess(`Reminder sent to ${reminder.tenantName}`);
      
      // In a real app, you'd also:
      // 1. Send email/SMS notification
      // 2. Track that reminder was sent
      // 3. Update reminder count
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSending(null);
    }
  };

  const sendBulkReminders = async (type: 'upcoming' | 'overdue') => {
    const targetReminders = reminders.filter(r => 
      type === 'overdue' ? r.isOverdue : !r.isOverdue && r.daysUntilDue <= parseInt(reminderDays)
    );
    
    for (const reminder of targetReminders) {
      await sendReminder(reminder);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const symbol = currency === 'USD' ? '$' : 'Z$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const getReminderBadgeColor = (reminder: PaymentReminder) => {
    if (reminder.isOverdue) return 'bg-red-100 text-red-800';
    if (reminder.daysUntilDue <= 3) return 'bg-orange-100 text-orange-800';
    if (reminder.daysUntilDue <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overdueReminders = reminders.filter(r => r.isOverdue);
  const upcomingReminders = reminders.filter(r => !r.isOverdue);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Reminders</h2>
          <p className="text-muted-foreground">
            Manage and send rent payment reminders to tenants
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => loadPaymentReminders()}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <Send className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Reminder Settings
          </CardTitle>
          <CardDescription>
            Configure automatic payment reminder settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-reminders"
              checked={autoReminders}
              onCheckedChange={setAutoReminders}
            />
            <Label htmlFor="auto-reminders">
              Enable automatic payment reminders
            </Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-days">Send reminders before due date</Label>
              <Select value={reminderDays} onValueChange={setReminderDays}>
                <SelectTrigger id="reminder-days">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="overdue-frequency">Overdue reminder frequency</Label>
              <Select value={overdueFrequency} onValueChange={setOverdueFrequency}>
                <SelectTrigger id="overdue-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Daily</SelectItem>
                  <SelectItem value="3">Every 3 days</SelectItem>
                  <SelectItem value="7">Weekly</SelectItem>
                  <SelectItem value="14">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Payments */}
      {overdueReminders.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-red-700">Overdue Payments</CardTitle>
                <CardDescription>
                  {overdueReminders.length} tenant{overdueReminders.length > 1 ? 's have' : ' has'} overdue rent payments
                </CardDescription>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => sendBulkReminders('overdue')}
              >
                <Bell className="mr-2 h-4 w-4" />
                Send All Reminders
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overdueReminders.map((reminder) => (
                <div key={reminder.leaseId} className="border rounded-lg p-4 bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getReminderBadgeColor(reminder)}>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {Math.abs(reminder.daysUntilDue)} days overdue
                        </Badge>
                        <Badge variant="outline">
                          {reminder.remindersSent} reminders sent
                        </Badge>
                      </div>
                      
                      <h4 className="font-semibold mb-1">{reminder.tenantName}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Unit: {reminder.unitLabel} • Property: {reminder.propertyName}
                      </p>
                      
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <span className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {formatCurrency(reminder.rentAmount, reminder.currency)}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due: {format(reminder.dueDate, 'MMM dd, yyyy')}
                        </span>
                        {reminder.lastPaymentDate && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Last paid: {format(reminder.lastPaymentDate, 'MMM dd')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => sendReminder(reminder)}
                      disabled={sending === reminder.leaseId}
                    >
                      {sending === reminder.leaseId ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          Send Reminder
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Payments */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>
                Rent payments due within the next 30 days
              </CardDescription>
            </div>
            {upcomingReminders.filter(r => r.daysUntilDue <= parseInt(reminderDays)).length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => sendBulkReminders('upcoming')}
              >
                <Bell className="mr-2 h-4 w-4" />
                Send Due Reminders
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming payments</h3>
              <p className="text-gray-600">All rent payments are up to date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReminders.map((reminder) => (
                <div key={reminder.leaseId} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getReminderBadgeColor(reminder)}>
                          Due in {reminder.daysUntilDue} day{reminder.daysUntilDue > 1 ? 's' : ''}
                        </Badge>
                        {reminder.remindersSent > 0 && (
                          <Badge variant="outline">
                            {reminder.remindersSent} reminder{reminder.remindersSent > 1 ? 's' : ''} sent
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-semibold mb-1">{reminder.tenantName}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Unit: {reminder.unitLabel} • Property: {reminder.propertyName}
                      </p>
                      
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <span className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {formatCurrency(reminder.rentAmount, reminder.currency)}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Due: {format(reminder.dueDate, 'MMM dd, yyyy')}
                        </span>
                        {reminder.lastPaymentDate && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Last paid: {format(reminder.lastPaymentDate, 'MMM dd')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => sendReminder(reminder)}
                      disabled={sending === reminder.leaseId}
                    >
                      {sending === reminder.leaseId ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          Send Reminder
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
