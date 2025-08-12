import { ScheduleEvent, ScheduleMetrics, EventType, EventStatus, EventPriority, ScheduleTemplate } from '@/lib/types/schedule';

// Generate mock events for different roles
export const generateMockEvents = (userRole: string, count: number = 20): ScheduleEvent[] => {
  const baseEvents: Partial<ScheduleEvent>[] = [
    {
      title: 'Routine Property Inspection',
      type: 'inspection',
      priority: 'medium',
      description: 'Monthly routine inspection of property common areas',
      inspectionType: 'routine',
      propertyName: 'Sunset Apartments',
      unitNumber: 'Common Areas'
    },
    {
      title: 'HVAC Maintenance',
      type: 'maintenance',
      priority: 'high',
      description: 'Quarterly HVAC system maintenance and filter replacement',
      propertyName: 'Downtown Office Complex',
      estimatedCost: 1500
    },
    {
      title: 'Tenant Move-in Inspection',
      type: 'inspection',
      priority: 'high',
      description: 'Move-in inspection for new tenant in Unit A-205',
      inspectionType: 'move_in',
      propertyName: 'Greenfield Residences',
      unitNumber: 'A-205'
    },
    {
      title: 'Property Showing',
      type: 'property_showing',
      priority: 'medium',
      description: 'Show Unit B-103 to prospective tenant',
      propertyName: 'Riverside Apartments',
      unitNumber: 'B-103'
    },
    {
      title: 'Lease Renewal Meeting',
      type: 'lease_signing',
      priority: 'high',
      description: 'Meet with tenant to discuss and sign lease renewal',
      propertyName: 'City Center Flats',
      unitNumber: 'C-401'
    },
    {
      title: 'Plumbing Repair',
      type: 'maintenance',
      priority: 'critical',
      description: 'Emergency plumbing repair - burst pipe in Unit D-102',
      propertyName: 'Maple Heights',
      unitNumber: 'D-102',
      estimatedCost: 800
    },
    {
      title: 'Property Evaluation',
      type: 'property_evaluation',
      priority: 'medium',
      description: 'Annual property valuation for insurance purposes',
      propertyName: 'Commerce Park'
    },
    {
      title: 'Tenant Meeting',
      type: 'tenant_visit',
      priority: 'low',
      description: 'Quarterly tenant check-in and feedback session',
      propertyName: 'Garden View Apartments',
      unitNumber: 'E-301'
    }
  ];

  const events: ScheduleEvent[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const baseEvent = baseEvents[i % baseEvents.length];
    const daysOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
    const startDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 240) + 60; // 1-4 hours
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    const event: ScheduleEvent = {
      id: `event-${i + 1}`,
      title: `${baseEvent.title} #${i + 1}`,
      description: baseEvent.description || '',
      type: baseEvent.type!,
      status: getRandomStatus(),
      priority: baseEvent.priority!,
      startDate,
      endDate,
      allDay: Math.random() > 0.8,
      timezone: 'Africa/Harare',
      recurrence: {
        type: 'none',
        interval: 1
      },
      propertyId: `prop-${Math.floor(Math.random() * 10) + 1}`,
      propertyName: baseEvent.propertyName!,
      unitId: baseEvent.unitNumber ? `unit-${Math.floor(Math.random() * 50) + 1}` : undefined,
      unitNumber: baseEvent.unitNumber,
      organizerId: 'user-1',
      organizerName: getOrganizerName(userRole),
      organizerRole: userRole,
      attendees: generateAttendees(baseEvent.type!),
      maintenanceRequestId: baseEvent.type === 'maintenance' ? `maint-${i + 1}` : undefined,
      serviceProviderId: baseEvent.type === 'maintenance' ? `provider-${Math.floor(Math.random() * 5) + 1}` : undefined,
      serviceProviderName: baseEvent.type === 'maintenance' ? getRandomServiceProvider() : undefined,
      estimatedCost: baseEvent.estimatedCost,
      inspectionType: baseEvent.inspectionType,
      inspectorId: baseEvent.type === 'inspection' ? 'inspector-1' : undefined,
      inspectorName: baseEvent.type === 'inspection' ? 'John Mukamuri' : undefined,
      reminders: [
        { type: 'email', time: 1440, sent: false }, // 24 hours before
        { type: 'sms', time: 60, sent: false }      // 1 hour before
      ],
      notes: generateRandomNotes(),
      attachments: [],
      createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      createdBy: 'user-1'
    };

    events.push(event);
  }

  return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
};

const getRandomStatus = (): EventStatus => {
  const statuses: EventStatus[] = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getOrganizerName = (role: string): string => {
  const names = {
    admin: 'System Administrator',
    owner: 'Property Owner',
    agent: 'Sarah Chikara',
    tenant: 'Tenant User'
  };
  return names[role as keyof typeof names] || 'Unknown User';
};

const generateAttendees = (eventType: EventType) => {
  const baseAttendees = [
    { id: 'user-2', name: 'Mike Tendai', email: 'mike.tendai@example.com', role: 'agent', status: 'accepted' as const },
    { id: 'user-3', name: 'Grace Mutasa', email: 'grace.mutasa@example.com', role: 'tenant', status: 'pending' as const }
  ];

  if (eventType === 'maintenance') {
    baseAttendees.push({
      id: 'provider-1',
      name: 'James Electrical Services',
      email: 'james@electrical.zw',
      role: 'service_provider',
      status: 'confirmed' as const
    });
  }

  return baseAttendees.slice(0, Math.floor(Math.random() * 3) + 1);
};

const getRandomServiceProvider = (): string => {
  const providers = [
    'Elite Plumbing Services',
    'PowerTech Electrical',
    'CleanCorp Zimbabwe',
    'SecureGuard Security',
    'MaintainPro Services'
  ];
  return providers[Math.floor(Math.random() * providers.length)];
};

const generateRandomNotes = (): string => {
  const notes = [
    'Please ensure all safety protocols are followed.',
    'Tenant will be present during the inspection.',
    'Emergency contact: +263 77 123 4567',
    'Access key available at reception.',
    'Backup date: Next available slot if weather conditions are poor.',
    'EcoCash payment preferred for service fees.',
    'Load shedding schedule: 10:00-14:00',
    ''
  ];
  return notes[Math.floor(Math.random() * notes.length)];
};

// Mock metrics based on role
export const getScheduleMetrics = (userRole: string): ScheduleMetrics => {
  const baseMetrics = {
    totalEvents: 45,
    completedEvents: 32,
    pendingEvents: 8,
    overdueEvents: 3,
    upcomingEvents: 12,
    completionRate: 85.7,
    averageEventDuration: 120,
    eventsByType: {
      maintenance: 18,
      inspection: 12,
      tenant_visit: 6,
      property_showing: 4,
      lease_signing: 3,
      rent_collection: 2,
      property_evaluation: 1,
      meeting: 0,
      reminder: 0,
      other: 0
    } as Record<EventType, number>,
    eventsByStatus: {
      scheduled: 8,
      confirmed: 6,
      in_progress: 2,
      completed: 32,
      cancelled: 2,
      rescheduled: 1
    } as Record<EventStatus, number>
  };

  // Adjust metrics based on role
  switch (userRole) {
    case 'admin':
      return {
        ...baseMetrics,
        totalEvents: 156,
        completedEvents: 128,
        pendingEvents: 18,
        overdueEvents: 7,
        upcomingEvents: 31
      };
    case 'owner':
      return {
        ...baseMetrics,
        totalEvents: 89,
        completedEvents: 71,
        pendingEvents: 12,
        overdueEvents: 4,
        upcomingEvents: 18
      };
    case 'agent':
      return baseMetrics;
    case 'tenant':
      return {
        ...baseMetrics,
        totalEvents: 12,
        completedEvents: 9,
        pendingEvents: 2,
        overdueEvents: 0,
        upcomingEvents: 3,
        eventsByType: {
          ...baseMetrics.eventsByType,
          maintenance: 4,
          inspection: 3,
          tenant_visit: 2,
          property_showing: 0,
          lease_signing: 1,
          rent_collection: 2,
          property_evaluation: 0
        }
      };
    default:
      return baseMetrics;
  }
};

// Mock schedule templates
export const mockScheduleTemplates: ScheduleTemplate[] = [
  {
    id: 'template-1',
    name: 'Routine Property Inspection',
    description: 'Monthly routine inspection template',
    type: 'inspection',
    duration: 120,
    defaultSettings: {
      priority: 'medium',
      recurrence: { type: 'monthly', interval: 1 },
      reminders: [
        { type: 'email', time: 2880, sent: false }, // 48 hours before
        { type: 'sms', time: 1440, sent: false }    // 24 hours before
      ]
    },
    roleRestrictions: ['admin', 'agent'],
    isActive: true
  },
  {
    id: 'template-2',
    name: 'Emergency Maintenance',
    description: 'Template for urgent maintenance requests',
    type: 'maintenance',
    duration: 180,
    defaultSettings: {
      priority: 'critical',
      recurrence: { type: 'none', interval: 1 },
      reminders: [
        { type: 'sms', time: 30, sent: false }, // 30 minutes before
        { type: 'email', time: 60, sent: false }
      ]
    },
    roleRestrictions: ['admin', 'agent'],
    isActive: true
  },
  {
    id: 'template-3',
    name: 'Tenant Move-in Inspection',
    description: 'Complete move-in inspection checklist',
    type: 'inspection',
    duration: 90,
    defaultSettings: {
      priority: 'high',
      recurrence: { type: 'none', interval: 1 },
      reminders: [
        { type: 'email', time: 1440, sent: false },
        { type: 'sms', time: 120, sent: false }
      ]
    },
    roleRestrictions: ['admin', 'agent'],
    isActive: true
  },
  {
    id: 'template-4',
    name: 'Rent Collection Reminder',
    description: 'Monthly rent collection appointment',
    type: 'rent_collection',
    duration: 30,
    defaultSettings: {
      priority: 'medium',
      recurrence: { type: 'monthly', interval: 1 },
      reminders: [
        { type: 'sms', time: 1440, sent: false },
        { type: 'email', time: 720, sent: false }
      ]
    },
    roleRestrictions: ['admin', 'agent', 'owner'],
    isActive: true
  }
];

// Zimbabwe-specific holidays and considerations
export const zimbabweHolidays2024 = [
  { name: 'New Year\'s Day', date: new Date('2024-01-01'), recurring: true },
  { name: 'Robert Gabriel Mugabe National Youth Day', date: new Date('2024-02-21'), recurring: true },
  { name: 'Independence Day', date: new Date('2024-04-18'), recurring: true },
  { name: 'Workers\' Day', date: new Date('2024-05-01'), recurring: true },
  { name: 'Africa Day', date: new Date('2024-05-25'), recurring: true },
  { name: 'Heroes\' Day', date: new Date('2024-08-12'), recurring: true },
  { name: 'Defence Forces Day', date: new Date('2024-08-13'), recurring: true },
  { name: 'Unity Day', date: new Date('2024-12-22'), recurring: true },
  { name: 'Christmas Day', date: new Date('2024-12-25'), recurring: true },
  { name: 'Boxing Day', date: new Date('2024-12-26'), recurring: true }
];

export const mockConflictingEvents = [
  {
    time: '2024-03-15 10:00',
    events: ['Property Inspection - Unit A-101', 'Tenant Meeting - Unit A-102'],
    type: 'time_overlap',
    severity: 'medium'
  },
  {
    time: '2024-03-20 14:00',
    events: ['HVAC Maintenance', 'Load Shedding Period'],
    type: 'resource_conflict',
    severity: 'high'
  }
];

// Role-based event filtering
export const getEventsForRole = (events: ScheduleEvent[], userRole: string): ScheduleEvent[] => {
  switch (userRole) {
    case 'admin':
      return events; // Admin sees all events
    case 'owner':
      return events.filter(event => 
        event.organizerRole === 'owner' || 
        event.attendees.some(attendee => attendee.role === 'owner')
      );
    case 'agent':
      return events.filter(event => 
        event.organizerRole === 'agent' || 
        event.attendees.some(attendee => attendee.role === 'agent') ||
        ['maintenance', 'inspection', 'property_showing'].includes(event.type)
      );
    case 'tenant':
      return events.filter(event => 
        event.organizerRole === 'tenant' || 
        event.attendees.some(attendee => attendee.role === 'tenant') ||
        event.type === 'tenant_visit'
      );
    default:
      return [];
  }
};