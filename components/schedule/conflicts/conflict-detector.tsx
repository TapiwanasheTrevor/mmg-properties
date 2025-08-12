'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  Clock,
  MapPin,
  Zap,
  X,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { ScheduleEvent } from '@/lib/types/schedule';

interface ConflictDetectorProps {
  events: ScheduleEvent[];
}

interface Conflict {
  id: string;
  type: 'time_overlap' | 'resource_conflict' | 'load_shedding' | 'travel_time';
  severity: 'low' | 'medium' | 'high' | 'critical';
  events: ScheduleEvent[];
  message: string;
  suggestions: {
    type: 'reschedule' | 'adjust_duration' | 'delegate' | 'merge';
    message: string;
    proposedTime?: Date;
  }[];
}

export default function ConflictDetector({ events }: ConflictDetectorProps) {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [dismissedConflicts, setDismissedConflicts] = useState<string[]>([]);

  useEffect(() => {
    detectConflicts();
  }, [events]);

  const detectConflicts = () => {
    const detectedConflicts: Conflict[] = [];
    const sortedEvents = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Time overlap detection
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      for (let j = i + 1; j < sortedEvents.length; j++) {
        const event1 = sortedEvents[i];
        const event2 = sortedEvents[j];

        if (hasTimeOverlap(event1, event2)) {
          const conflictId = `overlap_${event1.id}_${event2.id}`;
          if (!dismissedConflicts.includes(conflictId)) {
            detectedConflicts.push({
              id: conflictId,
              type: 'time_overlap',
              severity: getSeverityByPriority(event1.priority, event2.priority),
              events: [event1, event2],
              message: `Time overlap detected between "${event1.title}" and "${event2.title}"`,
              suggestions: [
                {
                  type: 'reschedule',
                  message: `Reschedule "${event2.title}" to start after "${event1.title}" ends`,
                  proposedTime: new Date(event1.endDate.getTime() + 30 * 60 * 1000) // 30 minutes buffer
                },
                {
                  type: 'adjust_duration',
                  message: `Reduce duration of "${event1.title}" to avoid overlap`
                }
              ]
            });
          }
        }
      }
    }

    // Resource conflict detection (same property/unit)
    const propertyEvents = groupEventsByProperty(sortedEvents);
    Object.entries(propertyEvents).forEach(([property, propertyEventList]) => {
      for (let i = 0; i < propertyEventList.length - 1; i++) {
        for (let j = i + 1; j < propertyEventList.length; j++) {
          const event1 = propertyEventList[i];
          const event2 = propertyEventList[j];

          if (hasTimeOverlap(event1, event2) && event1.unitId === event2.unitId) {
            const conflictId = `resource_${event1.id}_${event2.id}`;
            if (!dismissedConflicts.includes(conflictId)) {
              detectedConflicts.push({
                id: conflictId,
                type: 'resource_conflict',
                severity: 'high',
                events: [event1, event2],
                message: `Same unit scheduled for multiple events: ${event1.unitNumber}`,
                suggestions: [
                  {
                    type: 'reschedule',
                    message: `Reschedule one of the events to a different time slot`
                  },
                  {
                    type: 'merge',
                    message: `Consider combining related activities if appropriate`
                  }
                ]
              });
            }
          }
        }
      }
    });

    // Load shedding conflict (Zimbabwe-specific)
    const loadSheddingHours = getLoadSheddingSchedule();
    sortedEvents.forEach(event => {
      if (isEventDuringLoadShedding(event, loadSheddingHours)) {
        const conflictId = `loadshedding_${event.id}`;
        if (!dismissedConflicts.includes(conflictId)) {
          detectedConflicts.push({
            id: conflictId,
            type: 'load_shedding',
            severity: event.type === 'maintenance' ? 'high' : 'medium',
            events: [event],
            message: `"${event.title}" scheduled during load shedding period`,
            suggestions: [
              {
                type: 'reschedule',
                message: 'Reschedule to a time with reliable power supply'
              }
            ]
          });
        }
      }
    });

    // Travel time conflicts (for agents with multiple appointments)
    const agentEvents = groupEventsByOrganizer(sortedEvents);
    Object.entries(agentEvents).forEach(([organizer, organizerEvents]) => {
      for (let i = 0; i < organizerEvents.length - 1; i++) {
        const event1 = organizerEvents[i];
        const event2 = organizerEvents[i + 1];
        const timeBetween = new Date(event2.startDate).getTime() - new Date(event1.endDate).getTime();
        const travelTimeNeeded = 30 * 60 * 1000; // 30 minutes travel time

        if (timeBetween < travelTimeNeeded && event1.propertyId !== event2.propertyId) {
          const conflictId = `travel_${event1.id}_${event2.id}`;
          if (!dismissedConflicts.includes(conflictId)) {
            detectedConflicts.push({
              id: conflictId,
              type: 'travel_time',
              severity: 'medium',
              events: [event1, event2],
              message: `Insufficient travel time between properties`,
              suggestions: [
                {
                  type: 'reschedule',
                  message: 'Add 30 minutes buffer for travel between properties'
                },
                {
                  type: 'delegate',
                  message: 'Assign one event to another available agent'
                }
              ]
            });
          }
        }
      }
    });

    setConflicts(detectedConflicts);
  };

  const hasTimeOverlap = (event1: ScheduleEvent, event2: ScheduleEvent): boolean => {
    const start1 = new Date(event1.startDate).getTime();
    const end1 = new Date(event1.endDate).getTime();
    const start2 = new Date(event2.startDate).getTime();
    const end2 = new Date(event2.endDate).getTime();

    return start1 < end2 && start2 < end1;
  };

  const getSeverityByPriority = (priority1: string, priority2: string): 'low' | 'medium' | 'high' | 'critical' => {
    const priorities = { critical: 4, high: 3, medium: 2, low: 1 };
    const maxPriority = Math.max(priorities[priority1 as keyof typeof priorities] || 1, priorities[priority2 as keyof typeof priorities] || 1);
    
    if (maxPriority >= 4) return 'critical';
    if (maxPriority >= 3) return 'high';
    if (maxPriority >= 2) return 'medium';
    return 'low';
  };

  const groupEventsByProperty = (events: ScheduleEvent[]) => {
    return events.reduce((acc, event) => {
      const key = event.propertyId || 'unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {} as Record<string, ScheduleEvent[]>);
  };

  const groupEventsByOrganizer = (events: ScheduleEvent[]) => {
    return events.reduce((acc, event) => {
      const key = event.organizerId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {} as Record<string, ScheduleEvent[]>);
  };

  const getLoadSheddingSchedule = () => {
    // Mock load shedding schedule for Zimbabwe
    return [
      { start: 10, end: 14 }, // 10:00 - 14:00
      { start: 18, end: 22 }  // 18:00 - 22:00
    ];
  };

  const isEventDuringLoadShedding = (event: ScheduleEvent, loadSheddingHours: { start: number; end: number }[]) => {
    const eventHour = new Date(event.startDate).getHours();
    return loadSheddingHours.some(period => eventHour >= period.start && eventHour < period.end);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'time_overlap': return Clock;
      case 'resource_conflict': return MapPin;
      case 'load_shedding': return Zap;
      case 'travel_time': return Calendar;
      default: return AlertTriangle;
    }
  };

  const dismissConflict = (conflictId: string) => {
    setDismissedConflicts([...dismissedConflicts, conflictId]);
    setConflicts(conflicts.filter(c => c.id !== conflictId));
  };

  const resolveConflict = (conflict: Conflict, suggestionIndex: number) => {
    // In a real implementation, this would make API calls to update events
    console.log('Resolving conflict:', conflict.id, 'with suggestion:', conflict.suggestions[suggestionIndex]);
    dismissConflict(conflict.id);
  };

  if (conflicts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">No scheduling conflicts detected</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Your schedule is optimized with no overlapping events or resource conflicts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Schedule Conflicts ({conflicts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conflicts.map((conflict) => {
            const IconComponent = getConflictIcon(conflict.type);
            
            return (
              <Alert key={conflict.id} className={getSeverityColor(conflict.severity)}>
                <IconComponent className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{conflict.message}</span>
                        <Badge variant="outline" className="text-xs">
                          {conflict.severity}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <strong>Affected Events:</strong>
                        {conflict.events.map((event, index) => (
                          <span key={event.id}>
                            {index > 0 && ', '}
                            "{event.title}" ({new Date(event.startDate).toLocaleString()})
                          </span>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <strong className="text-sm">Suggested Solutions:</strong>
                        {conflict.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                            <span className="text-sm">{suggestion.message}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveConflict(conflict, index)}
                            >
                              Apply
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissConflict(conflict.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}