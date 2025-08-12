'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CreditCard } from 'lucide-react';
import { mockTenantAnalytics } from '@/lib/data/mock-reports-data';

interface TenantReportsProps {
  userRole: string;
}

export default function TenantReports({ userRole }: TenantReportsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Tenant Analytics</h3>
        <Badge variant="secondary">Tenant Performance</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Tenant Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Tenants</span>
                <span className="font-bold">{mockTenantAnalytics.totalTenants}</span>
              </div>
              <div className="flex justify-between">
                <span>New This Month</span>
                <span className="font-bold text-green-600">+{mockTenantAnalytics.newTenants}</span>
              </div>
              <div className="flex justify-between">
                <span>Renewal Rate</span>
                <span className="font-bold">{(mockTenantAnalytics.renewalRate * 100).toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Lease Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Avg Lease Length</span>
                <span className="font-bold">{mockTenantAnalytics.averageLeaseLength} months</span>
              </div>
              <div className="flex justify-between">
                <span>Turnover Rate</span>
                <span className="font-bold">{(mockTenantAnalytics.tenantTurnover * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Satisfaction Score</span>
                <span className="font-bold">{mockTenantAnalytics.tenantSatisfactionScore}/5.0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Payment Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>On-Time Payment</span>
                <span className="font-bold text-green-600">
                  {(mockTenantAnalytics.onTimePaymentRate * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Maintenance Requests</span>
                <span className="font-bold">{mockTenantAnalytics.maintenanceRequestsPerTenant}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}