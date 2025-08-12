'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { ScheduleEvent } from '@/lib/types/schedule';

interface UpcomingEventsProps {
  events: ScheduleEvent[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return '🔧';
      case 'inspection': return '🔍';
      case 'tenant_visit': return '👥';
      case 'property_showing': return '🏠';
      case 'lease_signing': return '📋';
      case 'rent_collection': return '💰';
      case 'property_evaluation': return '📊';
      case 'meeting': return '🤝';
      default: return '📅';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTimeUntilEvent = (eventDate: Date) => {
    const now = new Date();
    const timeDiff = eventDate.getTime() - now.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return 'Now';
  };

  const isEventSoon = (eventDate: Date) => {
    const now = new Date();
    const timeDiff = eventDate.getTime() - now.getTime();
    const hoursUntil = timeDiff / (1000 * 60 * 60);
    return hoursUntil <= 2 && hoursUntil > 0;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            Upcoming Events
          </CardTitle>
          <Button variant="ghost" size="sm">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((event) => (
              <div 
                key={event.id}
                className={`border rounded-lg p-3 ${
                  isEventSoon(event.startDate) ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm">{getEventTypeIcon(event.type)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{event.title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {event.startDate.toLocaleDateString()} at {event.startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.propertyName} {event.unitNumber && `(${event.unitNumber})`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    {isEventSoon(event.startDate) && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs font-medium">Soon</span>
                      </div>
                    )}
                    <Badge className={`text-xs ${getPriorityColor(event.priority)}`}>
                      {event.priority}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      in {getTimeUntilEvent(event.startDate)}
                    </div>
                  </div>
                </div>
                
                {event.attendees.length > 0 && (
                  <div className="mt-2 flex -space-x-1">
                    {event.attendees.slice(0, 3).map((attendee, index) => (
                      <div
                        key={attendee.id}
                        className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium"
                        title={attendee.name}
                      >
                        {attendee.name.charAt(0)}
                      </div>
                    ))}
                    {event.attendees.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                        +{event.attendees.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming events</p>
            </div>
          )}
        </div>
        
        {events.length > 0 && (
          <Button variant="outline" className="w-full mt-3" size="sm">
            View All Events
          </Button>
        )}
      </CardContent>
    </Card>
  );
}