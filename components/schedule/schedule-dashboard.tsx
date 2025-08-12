'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  Plus,
  Filter,
  Download,
  Bell,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  CalendarDays,
  CalendarClock,
  RotateCcw
} from 'lucide-react';

import CalendarView from './calendar/calendar-view';
import ScheduleMetrics from './metrics/schedule-metrics';
import EventsList from './events/events-list';
import CreateEventDialog from './events/create-event-dialog';
import QuickActions from './quick-actions/quick-actions';
import UpcomingEvents from './upcoming/upcoming-events';
import ConflictDetector from './conflicts/conflict-detector';

import { generateMockEvents, getScheduleMetrics, getEventsForRole } from '@/lib/data/mock-schedule-data';
import { ScheduleEvent, CalendarView as CalendarViewType, ScheduleMetrics as ScheduleMetricsType } from '@/lib/types/schedule';

export default function ScheduleDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'calendar' | 'list' | 'agenda'>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarViewType>({
    type: 'month',
    date: new Date(),
    filters: {
      eventTypes: [],
      statuses: [],
      priorities: [],
      properties: [],
      users: []
    }
  });
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [metrics, setMetrics] = useState<ScheduleMetricsType | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Generate mock events for the user's role
      const allEvents = generateMockEvents(user.role || 'tenant', 50);
      const roleFilteredEvents = getEventsForRole(allEvents, user.role || 'tenant');
      setEvents(roleFilteredEvents);
      
      // Get metrics for the user's role
      const roleMetrics = getScheduleMetrics(user.role || 'tenant');
      setMetrics(roleMetrics);
      
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Platform Administrator';
      case 'owner': return 'Property Owner';
      case 'agent': return 'Property Agent';
      case 'tenant': return 'Tenant';
      default: return 'User';
    }
  };

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case 'admin': 
        return 'Manage platform-wide scheduling including maintenance, inspections, and tenant appointments across all properties.';
      case 'owner': 
        return 'Schedule and track property maintenance, inspections, and tenant interactions for your portfolio.';
      case 'agent': 
        return 'Coordinate property showings, maintenance appointments, and tenant meetings for your assigned properties.';
      case 'tenant': 
        return 'View your scheduled appointments, maintenance visits, and lease-related meetings.';
      default: 
        return 'Manage your schedule and appointments.';
    }
  };

  const getTodaysEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= today && eventDate < tomorrow;
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate > now && eventDate <= nextWeek;
    }).slice(0, 5);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold tracking-tight">Schedule & Calendar</h1>
            <Badge variant="secondary" className="text-sm">
              {getRoleDisplayName(user?.role || 'user')}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {getWelcomeMessage(user?.role || 'user')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {(user?.role === 'admin' || user?.role === 'agent' || user?.role === 'owner') && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && <ScheduleMetrics metrics={metrics} userRole={user?.role || 'tenant'} />}

      {/* Today's Events Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getTodaysEvents().length > 0 ? (
              <div className="space-y-3">
                {getTodaysEvents().map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        event.priority === 'critical' ? 'bg-red-500' :
                        event.priority === 'high' ? 'bg-orange-500' :
                        event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                          {event.propertyName} {event.unitNumber && `(${event.unitNumber})`}
                        </div>
                      </div>
                    </div>
                    <Badge variant={
                      event.status === 'confirmed' ? 'default' :
                      event.status === 'completed' ? 'secondary' :
                      event.status === 'cancelled' ? 'destructive' : 'outline'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No events scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <UpcomingEvents events={getUpcomingEvents()} />
          <QuickActions userRole={user?.role || 'tenant'} onCreateEvent={() => setShowCreateDialog(true)} />
        </div>
      </div>

      {/* Conflict Detection */}
      <ConflictDetector events={events} />

      {/* Main Calendar/List View */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-auto grid-cols-3">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Agenda
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCalendarView({...calendarView, type: 'day'})}>
              Day
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCalendarView({...calendarView, type: 'week'})}>
              Week
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCalendarView({...calendarView, type: 'month'})}>
              Month
            </Button>
          </div>
        </div>

        <TabsContent value="calendar" className="space-y-0">
          <CalendarView 
            events={events}
            view={calendarView}
            onViewChange={setCalendarView}
            userRole={user?.role || 'tenant'}
          />
        </TabsContent>

        <TabsContent value="list" className="space-y-0">
          <EventsList 
            events={events}
            userRole={user?.role || 'tenant'}
          />
        </TabsContent>

        <TabsContent value="agenda" className="space-y-0">
          <Card>
            <CardHeader>
              <CardTitle>Agenda View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.slice(0, 10).map((event) => (
                  <div key={event.id} className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.startDate.toLocaleDateString()} at {event.startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.propertyName} {event.unitNumber && `- ${event.unitNumber}`}
                        </p>
                      </div>
                      <Badge variant="outline">{event.type.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog */}
      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        userRole={user?.role || 'tenant'}
        onEventCreated={(newEvent) => {
          setEvents([...events, newEvent]);
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
}