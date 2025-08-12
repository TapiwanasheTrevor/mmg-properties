export type EventType = 
  | 'maintenance' 
  | 'inspection' 
  | 'tenant_visit' 
  | 'property_showing' 
  | 'lease_signing' 
  | 'rent_collection' 
  | 'property_evaluation' 
  | 'meeting' 
  | 'reminder' 
  | 'other';

export type EventStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'rescheduled';

export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

export type RecurrenceType = 
  | 'none' 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'quarterly' 
  | 'yearly';

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  priority: EventPriority;
  
  // Timing
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  timezone: string;
  
  // Recurrence
  recurrence: {
    type: RecurrenceType;
    interval: number;
    endDate?: Date;
    occurrences?: number;
  };
  
  // Location & Property
  propertyId?: string;
  propertyName?: string;
  unitId?: string;
  unitNumber?: string;
  location?: string;
  
  // Participants
  organizerId: string;
  organizerName: string;
  organizerRole: string;
  attendees: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'pending' | 'accepted' | 'declined' | 'tentative';
  }[];
  
  // Maintenance Specific
  maintenanceRequestId?: string;
  serviceProviderId?: string;
  serviceProviderName?: string;
  estimatedCost?: number;
  
  // Inspection Specific
  inspectionType?: 'routine' | 'move_in' | 'move_out' | 'damage_assessment' | 'compliance';
  inspectorId?: string;
  inspectorName?: string;
  
  // Reminders & Notifications
  reminders: {
    type: 'email' | 'sms' | 'push';
    time: number; // minutes before event
    sent: boolean;
  }[];
  
  // Metadata
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda';
  date: Date;
  filters: {
    eventTypes: EventType[];
    statuses: EventStatus[];
    priorities: EventPriority[];
    properties: string[];
    users: string[];
  };
}

export interface ScheduleMetrics {
  totalEvents: number;
  completedEvents: number;
  pendingEvents: number;
  overdueEvents: number;
  upcomingEvents: number;
  completionRate: number;
  averageEventDuration: number;
  eventsByType: Record<EventType, number>;
  eventsByStatus: Record<EventStatus, number>;
}

export interface ConflictDetection {
  hasConflict: boolean;
  conflictingEvents: ScheduleEvent[];
  suggestions: {
    type: 'reschedule' | 'adjust_duration' | 'delegate';
    message: string;
    proposedTime?: Date;
  }[];
}

export interface ScheduleNotification {
  id: string;
  eventId: string;
  userId: string;
  type: 'reminder' | 'update' | 'cancellation' | 'invitation';
  title: string;
  message: string;
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
  channels: ('email' | 'sms' | 'push')[];
}

export interface RecurringEventSeries {
  id: string;
  masterEventId: string;
  instanceIds: string[];
  recurrenceRule: {
    frequency: RecurrenceType;
    interval: number;
    byWeekDay?: number[];
    byMonthDay?: number[];
    byMonth?: number[];
    endDate?: Date;
    count?: number;
  };
  exceptions: {
    date: Date;
    action: 'skip' | 'reschedule';
    newDate?: Date;
  }[];
}

// Zimbabwe-specific scheduling features
export interface ZimbabweScheduleFeatures {
  // Public holidays consideration
  respectPublicHolidays: boolean;
  customHolidays: {
    name: string;
    date: Date;
    recurring: boolean;
  }[];
  
  // Business hours (considering load shedding)
  businessHours: {
    start: string;
    end: string;
    timezone: string;
  };
  
  // Load shedding considerations
  loadSheddingAware: boolean;
  backupPowerAvailable: boolean;
  
  // Local service providers
  preferredServiceProviders: {
    type: 'plumber' | 'electrician' | 'security' | 'cleaning' | 'maintenance';
    name: string;
    contact: string;
    availability: string[];
  }[];
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  type: EventType;
  duration: number; // minutes
  defaultSettings: Partial<ScheduleEvent>;
  roleRestrictions: string[];
  isActive: boolean;
}