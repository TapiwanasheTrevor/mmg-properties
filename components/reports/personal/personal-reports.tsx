'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, CreditCard, Calendar, FileText, Download } from 'lucide-react';

interface PersonalReportsProps {
  userId: string;
}

export default function PersonalReports({ userId }: PersonalReportsProps) {
  const mockPersonalData = {
    lease: {
      unitNumber: 'A101',
      propertyName: 'Sunset Apartments',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      monthlyRent: 1200,
      securityDeposit: 2400
    },
    payments: [
      { date: '2024-01-01', amount: 1200, status: 'paid', method: 'Bank Transfer' },
      { date: '2024-02-01', amount: 1200, status: 'paid', method: 'EcoCash' },
      { date: '2024-03-01', amount: 1200, status: 'pending', method: 'Bank Transfer' }
    ],
    maintenance: [
      { date: '2024-01-15', title: 'Leaking faucet', status: 'completed' },
      { date: '2024-02-20', title: 'AC maintenance', status: 'in_progress' }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">My Reports</h3>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download Statement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Lease Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Property</span>
                <span className="font-medium">{mockPersonalData.lease.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span>Unit</span>
                <span className="font-medium">{mockPersonalData.lease.unitNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Rent</span>
                <span className="font-medium">${mockPersonalData.lease.monthlyRent}</span>
              </div>
              <div className="flex justify-between">
                <span>Lease End</span>
                <span className="font-medium">{mockPersonalData.lease.endDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Payment History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPersonalData.payments.slice(0, 3).map((payment, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">${payment.amount}</div>
                    <div className="text-sm text-muted-foreground">{payment.date}</div>
                  </div>
                  <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Maintenance Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockPersonalData.maintenance.map((request, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{request.title}</div>
                  <div className="text-sm text-muted-foreground">{request.date}</div>
                </div>
                <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                  {request.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}