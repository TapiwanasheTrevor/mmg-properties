'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  Home, 
  Users, 
  Building,
  Key,
  CreditCard,
  CheckCircle,
  Calendar,
  Wrench
} from 'lucide-react';
import { ReportMetric } from '@/lib/types/reports';

interface ReportMetricsCardsProps {
  metrics: ReportMetric[];
}

export default function ReportMetricsCards({ metrics }: ReportMetricsCardsProps) {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'home': return Home;
      case 'dollar-sign': return DollarSign;
      case 'users': return Users;
      case 'building': return Building;
      case 'trending-up': return TrendingUp;
      case 'wrench': return Wrench;
      case 'key': return Key;
      case 'credit-card': return CreditCard;
      case 'check-circle': return CheckCircle;
      case 'calendar': return Calendar;
      case 'tool': return Wrench;
      default: return DollarSign;
    }
  };

  const formatValue = (value: string | number, format?: string) => {
    if (format === 'currency') {
      return `$${typeof value === 'number' ? value.toLocaleString() : value}`;
    }
    if (format === 'percentage') {
      return `${value}%`;
    }
    if (format === 'number') {
      return typeof value === 'number' ? value.toLocaleString() : value;
    }
    return value.toString();
  };

  const getChangeIcon = (changeType?: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase': return TrendingUp;
      case 'decrease': return TrendingDown;
      default: return Minus;
    }
  };

  const getChangeColor = (changeType?: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase': return 'text-green-600 bg-green-100';
      case 'decrease': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const IconComponent = getIcon(metric.icon);
        const ChangeIcon = getChangeIcon(metric.changeType);
        
        return (
          <Card key={metric.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(metric.value, metric.format)}
              </div>
              
              {metric.change !== undefined && metric.previousValue !== undefined && (
                <div className="flex items-center mt-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getChangeColor(metric.changeType)}`}
                  >
                    <ChangeIcon className="w-3 h-3 mr-1" />
                    {Math.abs(metric.change)}%
                  </Badge>
                  <p className="text-xs text-muted-foreground ml-2">
                    vs previous period
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}