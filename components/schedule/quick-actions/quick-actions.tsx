'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus,
  Wrench,
  Search,
  Calendar,
  Users,
  FileText,
  Clock,
  Zap
} from 'lucide-react';

interface QuickActionsProps {
  userRole: string;
  onCreateEvent: () => void;
}

export default function QuickActions({ userRole, onCreateEvent }: QuickActionsProps) {
  const getQuickActions = () => {
    const baseActions = [
      {
        title: 'Schedule Event',
        description: 'Create a new appointment',
        icon: Plus,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        action: onCreateEvent
      }
    ];

    if (userRole === 'admin') {
      return [
        ...baseActions,
        {
          title: 'Maintenance Request',
          description: 'Schedule urgent repair',
          icon: Wrench,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          action: () => console.log('Create maintenance')
        },
        {
          title: 'Property Inspection',
          description: 'Schedule inspection',
          icon: Search,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          action: () => console.log('Schedule inspection')
        },
        {
          title: 'Bulk Operations',
          description: 'Manage multiple events',
          icon: Zap,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          action: () => console.log('Bulk operations')
        }
      ];
    }

    if (userRole === 'agent') {
      return [
        ...baseActions,
        {
          title: 'Property Showing',
          description: 'Schedule viewing',
          icon: Search,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          action: () => console.log('Schedule showing')
        },
        {
          title: 'Tenant Meeting',
          description: 'Schedule check-in',
          icon: Users,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          action: () => console.log('Schedule meeting')
        },
        {
          title: 'Maintenance',
          description: 'Schedule repair',
          icon: Wrench,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          action: () => console.log('Schedule maintenance')
        }
      ];
    }

    if (userRole === 'owner') {
      return [
        ...baseActions,
        {
          title: 'Property Review',
          description: 'Schedule evaluation',
          icon: FileText,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100',
          action: () => console.log('Schedule review')
        },
        {
          title: 'Tenant Meeting',
          description: 'Schedule discussion',
          icon: Users,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          action: () => console.log('Schedule meeting')
        }
      ];
    }

    if (userRole === 'tenant') {
      return [
        {
          title: 'Request Appointment',
          description: 'Schedule with agent',
          icon: Calendar,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          action: () => console.log('Request appointment')
        },
        {
          title: 'Maintenance Request',
          description: 'Report issue',
          icon: Wrench,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          action: () => console.log('Request maintenance')
        }
      ];
    }

    return baseActions;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {getQuickActions().map((action, index) => {
            const IconComponent = action.icon;
            
            return (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={action.action}
              >
                <div className={`p-2 rounded-full ${action.bgColor} mr-3`}>
                  <IconComponent className={`w-4 h-4 ${action.color}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}