'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  MapPin,
  Wrench
} from 'lucide-react';
import { ScheduleMetrics as ScheduleMetricsType } from '@/lib/types/schedule';

interface ScheduleMetricsProps {
  metrics: ScheduleMetricsType;
  userRole: string;
}

export default function ScheduleMetrics({ metrics, userRole }: ScheduleMetricsProps) {
  const getMetricCards = () => {
    const baseCards = [
      {
        title: 'Total Events',
        value: metrics.totalEvents,
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        change: '+12%',
        changeType: 'increase' as const
      },
      {
        title: 'Completed',
        value: metrics.completedEvents,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        change: `${metrics.completionRate.toFixed(1)}%`,
        changeType: 'neutral' as const
      },
      {
        title: 'Pending',
        value: metrics.pendingEvents,
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        change: '-3%',
        changeType: 'decrease' as const
      },
      {
        title: 'Overdue',
        value: metrics.overdueEvents,
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        change: '-8%',
        changeType: 'decrease' as const
      }
    ];

    // Add role-specific metrics
    if (userRole === 'admin') {
      baseCards.push({
        title: 'Avg Duration',
        value: `${metrics.averageEventDuration}m`,
        icon: TrendingUp,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        change: '+5m',
        changeType: 'increase' as const
      });
    }

    if (userRole === 'agent' || userRole === 'admin') {
      baseCards.push({
        title: 'Properties',
        value: Object.keys(metrics.eventsByType).length,
        icon: MapPin,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        change: 'Active',
        changeType: 'neutral' as const
      });
    }

    return baseCards.slice(0, userRole === 'tenant' ? 4 : 6);
  };

  const getChangeColor = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase': return '↗';
      case 'decrease': return '↘';
      default: return '→';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {getMetricCards().map((metric, index) => {
        const IconComponent = metric.icon;
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {typeof metric.value === 'string' ? metric.value : metric.value.toLocaleString()}
              </div>
              
              <div className="flex items-center text-xs">
                <span className={`${getChangeColor(metric.changeType)} font-medium`}>
                  {getChangeIcon(metric.changeType)} {metric.change}
                </span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Event Type Breakdown - Show for non-tenant users */}
      {userRole !== 'tenant' && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Event Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics.eventsByType)
                .filter(([_, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm capitalize">
                      {type.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / metrics.totalEvents) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Overview */}
      <Card className={userRole === 'tenant' ? 'md:col-span-2' : ''}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(metrics.eventsByStatus)
              .filter(([_, count]) => count > 0)
              .map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        status === 'completed' ? 'default' :
                        status === 'confirmed' ? 'secondary' :
                        status === 'cancelled' ? 'destructive' : 'outline'
                      }
                      className="text-xs"
                    >
                      {status}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}