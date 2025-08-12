'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, TrendingUp, Users } from 'lucide-react';
import { mockPropertyPerformance } from '@/lib/data/mock-reports-data';

interface PropertyAnalyticsProps {
  userRole: string;
}

export default function PropertyAnalytics({ userRole }: PropertyAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Property Analytics</h3>
        <Badge variant="secondary">Performance Overview</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockPropertyPerformance.map((property) => (
          <Card key={property.propertyId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>{property.propertyName}</span>
                </div>
                <Badge variant="outline">{property.occupancyRate}% Occupied</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                  <div className="font-bold">${property.monthlyRevenue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">ROI</div>
                  <div className="font-bold text-green-600">{property.roiPercentage}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">NOI</div>
                  <div className="font-bold">${property.netOperatingIncome.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                  <div className="font-bold">{property.tenantSatisfaction}/5.0</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}