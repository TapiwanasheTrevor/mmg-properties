'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  X
} from 'lucide-react';
import { ScheduleEvent, EventType, EventPriority } from '@/lib/types/schedule';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: string;
  onEventCreated: (event: ScheduleEvent) => void;
}

export default function CreateEventDialog({ 
  open, 
  onOpenChange, 
  userRole, 
  onEventCreated 
}: CreateEventDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meeting' as EventType,
    priority: 'medium' as EventPriority,
    startDate: new Date(),
    startTime: '09:00',
    duration: 60, // minutes
    allDay: false,
    propertyId: '',
    propertyName: '',
    unitId: '',
    unitNumber: '',
    location: '',
    attendees: [] as { name: string; email: string; role: string }[],
    notes: '',
    estimatedCost: '',
    serviceProvider: '',
    recurrence: 'none'
  });

  const [newAttendee, setNewAttendee] = useState({ name: '', email: '', role: 'tenant' });
  const [showCalendar, setShowCalendar] = useState(false);

  const eventTypes: { value: EventType; label: string; roles: string[] }[] = [
    { value: 'maintenance', label: 'Maintenance', roles: ['admin', 'agent', 'owner'] },
    { value: 'inspection', label: 'Inspection', roles: ['admin', 'agent', 'owner'] },
    { value: 'tenant_visit', label: 'Tenant Visit', roles: ['admin', 'agent', 'owner'] },
    { value: 'property_showing', label: 'Property Showing', roles: ['admin', 'agent'] },
    { value: 'lease_signing', label: 'Lease Signing', roles: ['admin', 'agent', 'owner'] },
    { value: 'rent_collection', label: 'Rent Collection', roles: ['admin', 'agent', 'owner'] },
    { value: 'property_evaluation', label: 'Property Evaluation', roles: ['admin', 'owner'] },
    { value: 'meeting', label: 'Meeting', roles: ['admin', 'agent', 'owner', 'tenant'] },
    { value: 'reminder', label: 'Reminder', roles: ['admin', 'agent', 'owner', 'tenant'] },
    { value: 'other', label: 'Other', roles: ['admin', 'agent', 'owner', 'tenant'] }
  ];

  const priorityOptions: { value: EventPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const getAvailableEventTypes = () => {
    return eventTypes.filter(type => type.roles.includes(userRole));
  };

  const addAttendee = () => {
    if (newAttendee.name && newAttendee.email) {
      setFormData({
        ...formData,
        attendees: [...formData.attendees, { ...newAttendee, role: newAttendee.role }]
      });
      setNewAttendee({ name: '', email: '', role: 'tenant' });
    }
  };

  const removeAttendee = (index: number) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter((_, i) => i !== index)
    });
  };

  const calculateEndDate = () => {
    const startDateTime = new Date(formData.startDate);
    const [hours, minutes] = formData.startTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60 * 1000);
    return endDateTime;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(formData.startDate);
    const [hours, minutes] = formData.startTime.split(':').map(Number);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    const newEvent: ScheduleEvent = {
      id: `event-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      status: 'scheduled',
      priority: formData.priority,
      startDate: startDateTime,
      endDate: calculateEndDate(),
      allDay: formData.allDay,
      timezone: 'Africa/Harare',
      recurrence: {
        type: formData.recurrence as any,
        interval: 1
      },
      propertyId: formData.propertyId,
      propertyName: formData.propertyName,
      unitId: formData.unitId,
      unitNumber: formData.unitNumber,
      location: formData.location,
      organizerId: 'current-user-id',
      organizerName: 'Current User',
      organizerRole: userRole,
      attendees: formData.attendees.map(a => ({ ...a, status: 'pending' as const, id: `attendee-${Date.now()}-${Math.random()}` })),
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      serviceProviderName: formData.serviceProvider || undefined,
      reminders: [
        { type: 'email', time: 1440, sent: false }, // 24 hours before
        { type: 'sms', time: 60, sent: false }      // 1 hour before
      ],
      notes: formData.notes,
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user-id'
    };

    onEventCreated(newEvent);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      type: 'meeting',
      priority: 'medium',
      startDate: new Date(),
      startTime: '09:00',
      duration: 60,
      allDay: false,
      propertyId: '',
      propertyName: '',
      unitId: '',
      unitNumber: '',
      location: '',
      attendees: [],
      notes: '',
      estimatedCost: '',
      serviceProvider: '',
      recurrence: 'none'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Event description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Event Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as EventType})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {getAvailableEventTypes().map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as EventPriority})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Date & Time
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Date *</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate.toLocaleDateString()}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => {
                        if (date) {
                          setFormData({...formData, startDate: date});
                          setShowCalendar(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  min="15"
                  step="15"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay}
                onChange={(e) => setFormData({...formData, allDay: e.target.checked})}
              />
              <Label htmlFor="allDay">All day event</Label>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="propertyName">Property Name</Label>
                <Input
                  id="propertyName"
                  value={formData.propertyName}
                  onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                  placeholder="Property name"
                />
              </div>

              <div>
                <Label htmlFor="unitNumber">Unit Number</Label>
                <Input
                  id="unitNumber"
                  value={formData.unitNumber}
                  onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                  placeholder="Unit number (optional)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Additional Location Details</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Specific location or address"
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Attendees
            </h3>
            
            {formData.attendees.length > 0 && (
              <div className="space-y-2">
                {formData.attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{attendee.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">({attendee.email})</span>
                      <Badge variant="outline" className="ml-2 text-xs">{attendee.role}</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttendee(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <Input
                placeholder="Name"
                value={newAttendee.name}
                onChange={(e) => setNewAttendee({...newAttendee, name: e.target.value})}
              />
              <Input
                placeholder="Email"
                type="email"
                value={newAttendee.email}
                onChange={(e) => setNewAttendee({...newAttendee, email: e.target.value})}
              />
              <select
                value={newAttendee.role}
                onChange={(e) => setNewAttendee({...newAttendee, role: e.target.value})}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="tenant">Tenant</option>
                <option value="agent">Agent</option>
                <option value="owner">Owner</option>
                <option value="service_provider">Service Provider</option>
              </select>
              <Button type="button" variant="outline" onClick={addAttendee}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Additional Fields */}
          {(formData.type === 'maintenance' || formData.type === 'property_evaluation') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost (USD)</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                {formData.type === 'maintenance' && (
                  <div>
                    <Label htmlFor="serviceProvider">Service Provider</Label>
                    <Input
                      id="serviceProvider"
                      value={formData.serviceProvider}
                      onChange={(e) => setFormData({...formData, serviceProvider: e.target.value})}
                      placeholder="Service provider name"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes or instructions"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}