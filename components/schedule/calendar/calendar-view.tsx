'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Plus
} from 'lucide-react';
import { ScheduleEvent, CalendarView as CalendarViewType } from '@/lib/types/schedule';

interface CalendarViewProps {
  events: ScheduleEvent[];
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  userRole: string;
}

export default function CalendarView({ events, view, onViewChange, userRole }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(view.date);
    
    if (view.type === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view.type === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (view.type === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    onViewChange({ ...view, date: newDate });
  };

  const getDateTitle = () => {
    const date = view.date;
    if (view.type === 'day') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (view.type === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(view.date.getFullYear(), view.date.getMonth(), 1);
    const lastDayOfMonth = new Date(view.date.getFullYear(), view.date.getMonth() + 1, 0);
    const firstDayOfCalendar = new Date(firstDayOfMonth);
    firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfCalendar.getDay());
    
    const days = [];
    const currentDate = new Date(firstDayOfCalendar);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = day.getMonth() === view.date.getMonth();
          const isToday = day.toDateString() === today.toDateString();
          const isSelected = selectedDate?.toDateString() === day.toDateString();
          
          return (
            <div 
              key={index}
              className={`min-h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth ? 'bg-gray-50 text-muted-foreground' : ''
              } ${isToday ? 'bg-blue-50 border-blue-300' : ''} ${
                isSelected ? 'bg-purple-50 border-purple-300' : ''
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate ${
                      event.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      event.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = new Date(view.date);
    weekStart.setDate(view.date.getDate() - view.date.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="grid grid-cols-8 gap-1">
        {/* Time column header */}
        <div className="p-2 text-center text-sm font-medium text-muted-foreground">
          Time
        </div>
        
        {/* Day headers */}
        {weekDays.map((day) => (
          <div key={day.toDateString()} className="p-2 text-center">
            <div className="text-sm font-medium">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="text-xs text-muted-foreground">{day.getDate()}</div>
          </div>
        ))}
        
        {/* Time slots */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div className="p-2 text-xs text-muted-foreground border-r">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map((day) => {
              const hourEvents = events.filter(event => {
                const eventDate = new Date(event.startDate);
                return eventDate.toDateString() === day.toDateString() && 
                       eventDate.getHours() === hour;
              });
              
              return (
                <div key={`${day.toDateString()}-${hour}`} className="min-h-12 p-1 border border-gray-100">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded mb-1 ${
                        event.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        event.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="truncate">{event.propertyName}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(view.date);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-1">
        {hours.map((hour) => {
          const hourEvents = dayEvents.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getHours() === hour;
          });

          return (
            <div key={hour} className="flex border-b border-gray-100">
              <div className="w-20 p-2 text-sm text-muted-foreground border-r">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 p-2 min-h-16">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-2 rounded mb-2 ${
                      event.priority === 'critical' ? 'bg-red-100 border-l-4 border-red-500' :
                      event.priority === 'high' ? 'bg-orange-100 border-l-4 border-orange-500' :
                      event.priority === 'medium' ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                      'bg-green-100 border-l-4 border-green-500'
                    }`}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {event.endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {event.propertyName} {event.unitNumber && `(${event.unitNumber})`}
                      </div>
                      {event.attendees.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3" />
                          {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant={
                        event.status === 'confirmed' ? 'default' :
                        event.status === 'completed' ? 'secondary' :
                        event.status === 'cancelled' ? 'destructive' : 'outline'
                      }
                      className="text-xs mt-2"
                    >
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {getDateTitle()}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onViewChange({...view, date: new Date()})}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-auto max-h-96">
          {view.type === 'month' && renderMonthView()}
          {view.type === 'week' && renderWeekView()}
          {view.type === 'day' && renderDayView()}
        </div>
      </CardContent>
    </Card>
  );
}