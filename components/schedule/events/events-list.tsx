'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ScheduleEvent } from '@/lib/types/schedule';

interface EventsListProps {
  events: ScheduleEvent[];
  userRole: string;
}

export default function EventsList({ events, userRole }: EventsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'in_progress': return 'default';
      case 'rescheduled': return 'outline';
      default: return 'outline';
    }
  };

  const canEditEvent = (event: ScheduleEvent) => {
    return userRole === 'admin' || 
           (userRole === 'agent' && ['maintenance', 'inspection', 'property_showing'].includes(event.type)) ||
           (userRole === 'owner' && event.organizerRole === 'owner');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Events List ({filteredAndSortedEvents.length})
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {['date', 'priority', 'status'].map((option) => (
            <Button
              key={option}
              variant={sortBy === option ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(option as any)}
            >
              Sort by {option}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-2 max-h-96 overflow-auto">
          {filteredAndSortedEvents.length > 0 ? (
            filteredAndSortedEvents.map((event) => (
              <div 
                key={event.id}
                className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <Badge className={`text-xs ${getPriorityColor(event.priority)}`}>
                        {event.priority}
                      </Badge>
                      <Badge variant={getStatusColor(event.status) as any} className="text-xs">
                        {event.status}
                      </Badge>
                    </div>
                    
                    {event.description && (
                      <p className="text-muted-foreground text-sm mb-2">{event.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.startDate.toLocaleDateString()} at {event.startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.propertyName} {event.unitNumber && `(${event.unitNumber})`}
                      </div>
                      
                      {event.attendees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                        </div>
                      )}
                      
                      {event.estimatedCost && (
                        <div className="flex items-center gap-1">
                          💰 ${event.estimatedCost.toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    {event.serviceProviderName && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Service Provider: {event.serviceProviderName}
                      </div>
                    )}
                    
                    {event.notes && (
                      <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                        <strong>Notes:</strong> {event.notes}
                      </div>
                    )}
                  </div>
                  
                  {canEditEvent(event) && (
                    <div className="flex items-center gap-2">
                      {event.status === 'scheduled' && (
                        <>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </>
                      )}
                      
                      {event.status === 'confirmed' && (
                        <Button size="sm" variant="outline">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      
                      {['scheduled', 'confirmed'].includes(event.status) && (
                        <Button size="sm" variant="outline">
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                      
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No events found matching your criteria</p>
              <p className="text-sm">Try adjusting your search or filter options</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}