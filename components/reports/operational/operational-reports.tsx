'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Clock, CheckCircle } from 'lucide-react';
import { mockOperationalMetrics } from '@/lib/data/mock-reports-data';

interface OperationalReportsProps {
  userRole: string;
}

export default function OperationalReports({ userRole }: OperationalReportsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Operational Reports</h3>
        <Badge variant="secondary">Operations Overview</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="w-5 h-5" />
              <span>Maintenance Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Requests</span>
                <span className="font-bold">{mockOperationalMetrics.maintenanceRequests.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending</span>
                <span className="font-bold text-amber-600">
                  {mockOperationalMetrics.maintenanceRequests.pending}
                </span>
              </div>
              <div className="flex justify-between">
                <span>In Progress</span>
                <span className="font-bold text-blue-600">
                  {mockOperationalMetrics.maintenanceRequests.inProgress}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Completed</span>
                <span className="font-bold text-green-600">
                  {mockOperationalMetrics.maintenanceRequests.completed}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Avg Resolution Time</span>
                <span className="font-bold">
                  {mockOperationalMetrics.maintenanceRequests.averageResolutionTime} days
                </span>
              </div>
              <div className="flex justify-between">
                <span>Service Provider Rating</span>
                <span className="font-bold">
                  {mockOperationalMetrics.serviceProviders.averageRating}/5.0
                </span>
              </div>
              <div className="flex justify-between">
                <span>Compliance Score</span>
                <span className="font-bold text-green-600">
                  {mockOperationalMetrics.complianceScore}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}