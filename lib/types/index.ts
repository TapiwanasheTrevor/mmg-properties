import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

// ============================================================================
// CORE DATA MODELS AND TYPES
// ============================================================================

// User Types
export type UserRole = 'admin' | 'owner' | 'agent' | 'tenant';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  phone?: string;
  permissions: string[];
  isActive: boolean;
  mfaEnabled?: boolean;
  mfaSetupRequired?: boolean;
  lastLogin: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  deactivatedAt?: Timestamp;
  reactivatedAt?: Timestamp;
  deactivationReason?: string;
}

// Property Types
export type PropertyType = 'residential' | 'commercial' | 'mixed';
export type PropertyStatus = 'active' | 'maintenance' | 'inactive';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Property {
  id: string;
  ownerId: string;
  agentId?: string;
  name: string;
  address: Address;
  type: PropertyType;
  status: PropertyStatus;
  description?: string;
  images: string[];
  documents: string[];
  totalUnits: number;
  occupiedUnits: number;
  monthlyIncome: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Unit Types
export type UnitType = 'studio' | '1br' | '2br' | '3br' | '4br+' | 'commercial';
export type UnitStatus = 'occupied' | 'vacant' | 'maintenance' | 'reserved';

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  type: UnitType;
  status: UnitStatus;
  squareFootage: number;
  monthlyRent: number;
  isOccupied: boolean;
  currentLeaseId?: string;
  currentTenantId?: string;
  amenities: string[];
  images: string[];
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Lease Types
export type LeaseStatus = 'active' | 'expired' | 'terminated' | 'pending';
export type PaymentFrequency = 'monthly' | 'quarterly' | 'annually';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'ZWL' | 'ZAR';

export interface Payment {
  id: string;
  amount: number;
  dueDate: Timestamp;
  paidDate?: Timestamp;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  method?: 'cash' | 'check' | 'transfer' | 'online';
  reference?: string;
  receipt?: string;
}

export interface Lease {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  ownerId: string;
  agentId?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  monthlyRent: number;
  securityDeposit: number;
  paymentFrequency: PaymentFrequency;
  terms: string;
  status: LeaseStatus;
  documents: string[];
  paymentHistory: Payment[];
  renewalHistory: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Maintenance Request Types
export type MaintenanceCategory = 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'emergency';
export type MaintenanceStatus = 'submitted' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  filename: string;
  uploadedAt: Timestamp;
  uploadedBy: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  agentId?: string;
  ownerId: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  submittedMedia: MediaFile[];
  progressMedia: MediaFile[];
  completionMedia: MediaFile[];
  estimatedCost?: number;
  actualCost?: number;
  requiresApproval: boolean;
  approvedBy?: string;
  scheduledDate?: Timestamp;
  completedDate?: Timestamp;
  comments: MaintenanceComment[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MaintenanceComment {
  id: string;
  userId: string;
  userRole: UserRole;
  message: string;
  attachments: string[];
  createdAt: Timestamp;
}

// Notification Types
export type NotificationType = 'maintenance' | 'payment' | 'lease' | 'system' | 'general';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
  createdAt: Timestamp;
  readAt?: Timestamp;
}

// Financial Types
export type TransactionType = 'rent' | 'deposit' | 'maintenance' | 'fee' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  propertyId: string;
  unitId?: string;
  tenantId?: string;
  leaseId?: string;
  maintenanceRequestId?: string;
  status: TransactionStatus;
  paymentMethod?: string;
  reference?: string;
  receipt?: string;
  createdAt: Timestamp;
  processedAt?: Timestamp;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Form State Types
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Dashboard Types
export interface DashboardMetrics {
  totalProperties: number;
  totalUnits: number;
  occupancyRate: number;
  monthlyRevenue: number;
  pendingMaintenance: number;
  overduePayments: number;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  propertyType?: PropertyType;
  unitType?: UnitType;
  status?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

// User Schemas
export const UserRoleSchema = z.enum(['admin', 'owner', 'agent', 'tenant']);

export const UserSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email format'),
  displayName: z.string().min(1, 'Display name is required'),
  role: UserRoleSchema,
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  isActive: z.boolean().default(true),
  customClaims: z.object({
    role: z.string(),
    permissions: z.array(z.string()),
  }),
});

// Address Schema
export const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

// Property Schemas
export const PropertyTypeSchema = z.enum(['residential', 'commercial', 'mixed']);
export const PropertyStatusSchema = z.enum(['active', 'maintenance', 'inactive']);

export const PropertySchema = z.object({
  id: z.string().min(1, 'Property ID is required'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  agentId: z.string().optional(),
  name: z.string().min(1, 'Property name is required'),
  address: AddressSchema,
  type: PropertyTypeSchema,
  status: PropertyStatusSchema.default('active'),
  description: z.string().optional(),
  images: z.array(z.string().url()),
  documents: z.array(z.string().url()),
  totalUnits: z.number().min(1, 'Must have at least 1 unit'),
  occupiedUnits: z.number().min(0),
  monthlyIncome: z.number().min(0),
});

// Unit Schemas
export const UnitTypeSchema = z.enum(['studio', '1br', '2br', '3br', '4br+', 'commercial']);
export const UnitStatusSchema = z.enum(['occupied', 'vacant', 'maintenance', 'reserved']);

export const UnitSchema = z.object({
  id: z.string().min(1, 'Unit ID is required'),
  propertyId: z.string().min(1, 'Property ID is required'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  type: UnitTypeSchema,
  status: UnitStatusSchema.default('vacant'),
  squareFootage: z.number().min(1, 'Square footage must be positive'),
  monthlyRent: z.number().min(0, 'Monthly rent must be non-negative'),
  isOccupied: z.boolean().default(false),
  currentLeaseId: z.string().optional(),
  currentTenantId: z.string().optional(),
  amenities: z.array(z.string()),
  images: z.array(z.string().url()),
  description: z.string().optional(),
});

// Lease Schemas
export const LeaseStatusSchema = z.enum(['active', 'expired', 'terminated', 'pending']);
export const PaymentFrequencySchema = z.enum(['monthly', 'quarterly', 'annually']);

export const PaymentSchema = z.object({
  id: z.string().min(1, 'Payment ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  dueDate: z.any(), // Timestamp
  paidDate: z.any().optional(), // Timestamp
  status: z.enum(['pending', 'paid', 'overdue', 'partial']),
  method: z.enum(['cash', 'check', 'transfer', 'online']).optional(),
  reference: z.string().optional(),
  receipt: z.string().url().optional(),
});

export const LeaseSchema = z.object({
  id: z.string().min(1, 'Lease ID is required'),
  propertyId: z.string().min(1, 'Property ID is required'),
  unitId: z.string().min(1, 'Unit ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  agentId: z.string().optional(),
  startDate: z.any(), // Timestamp
  endDate: z.any(), // Timestamp
  monthlyRent: z.number().min(0, 'Monthly rent must be non-negative'),
  securityDeposit: z.number().min(0, 'Security deposit must be non-negative'),
  paymentFrequency: PaymentFrequencySchema.default('monthly'),
  terms: z.string().min(1, 'Lease terms are required'),
  status: LeaseStatusSchema.default('pending'),
  documents: z.array(z.string().url()),
  paymentHistory: z.array(PaymentSchema),
  renewalHistory: z.array(z.string()),
});

// Maintenance Request Schemas
export const MaintenanceCategorySchema = z.enum(['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other']);
export const MaintenancePrioritySchema = z.enum(['low', 'medium', 'high', 'emergency']);
export const MaintenanceStatusSchema = z.enum(['submitted', 'assigned', 'in_progress', 'completed', 'cancelled']);

export const MediaFileSchema = z.object({
  id: z.string().min(1, 'Media file ID is required'),
  url: z.string().url('Invalid URL'),
  type: z.enum(['image', 'video']),
  filename: z.string().min(1, 'Filename is required'),
  uploadedAt: z.any(), // Timestamp
  uploadedBy: z.string().min(1, 'Uploader ID is required'),
});

export const MaintenanceCommentSchema = z.object({
  id: z.string().min(1, 'Comment ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  userRole: UserRoleSchema,
  message: z.string().min(1, 'Message is required'),
  attachments: z.array(z.string().url()),
  createdAt: z.any(), // Timestamp
});

export const MaintenanceRequestSchema = z.object({
  id: z.string().min(1, 'Request ID is required'),
  propertyId: z.string().min(1, 'Property ID is required'),
  unitId: z.string().min(1, 'Unit ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  agentId: z.string().optional(),
  ownerId: z.string().min(1, 'Owner ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: MaintenanceCategorySchema,
  priority: MaintenancePrioritySchema,
  status: MaintenanceStatusSchema.default('submitted'),
  submittedMedia: z.array(MediaFileSchema),
  progressMedia: z.array(MediaFileSchema),
  completionMedia: z.array(MediaFileSchema),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  requiresApproval: z.boolean().default(false),
  approvedBy: z.string().optional(),
  scheduledDate: z.any().optional(), // Timestamp
  completedDate: z.any().optional(), // Timestamp
  comments: z.array(MaintenanceCommentSchema),
  createdAt: z.any(), // Timestamp
  updatedAt: z.any(), // Timestamp
});

// Notification Schemas
export const NotificationTypeSchema = z.enum(['maintenance', 'payment', 'lease', 'system', 'general']);
export const NotificationPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export const NotificationSchema = z.object({
  id: z.string().min(1, 'Notification ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema.default('medium'),
  read: z.boolean().default(false),
  actionUrl: z.string().url().optional(),
  data: z.record(z.any()).optional(),
  createdAt: z.any(), // Timestamp
  readAt: z.any().optional(), // Timestamp
});

// Transaction Schemas
export const TransactionTypeSchema = z.enum(['rent', 'deposit', 'maintenance', 'fee', 'refund']);
export const TransactionStatusSchema = z.enum(['pending', 'completed', 'failed', 'cancelled']);

export const TransactionSchema = z.object({
  id: z.string().min(1, 'Transaction ID is required'),
  type: TransactionTypeSchema,
  amount: z.number().min(0, 'Amount must be non-negative'),
  description: z.string().min(1, 'Description is required'),
  propertyId: z.string().min(1, 'Property ID is required'),
  unitId: z.string().optional(),
  tenantId: z.string().optional(),
  leaseId: z.string().optional(),
  maintenanceRequestId: z.string().optional(),
  status: TransactionStatusSchema.default('pending'),
  paymentMethod: z.string().optional(),
  reference: z.string().optional(),
  receipt: z.string().url().optional(),
  createdAt: z.any(), // Timestamp
  processedAt: z.any().optional(), // Timestamp
});

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

// Property Form Schema
export const PropertyFormSchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  type: PropertyTypeSchema,
  address: AddressSchema,
  description: z.string().optional(),
  totalUnits: z.number().min(1, 'Must have at least 1 unit'),
});

// Unit Form Schema
export const UnitFormSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  type: UnitTypeSchema,
  squareFootage: z.number().min(1, 'Square footage must be positive'),
  monthlyRent: z.number().min(0, 'Monthly rent must be non-negative'),
  amenities: z.array(z.string()),
  description: z.string().optional(),
});

// Lease Form Schema
export const LeaseFormSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  unitId: z.string().min(1, 'Unit is required'),
  startDate: z.date(),
  endDate: z.date(),
  monthlyRent: z.number().min(0, 'Monthly rent must be non-negative'),
  securityDeposit: z.number().min(0, 'Security deposit must be non-negative'),
  paymentFrequency: PaymentFrequencySchema,
  terms: z.string().min(1, 'Lease terms are required'),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Maintenance Request Form Schema
export const MaintenanceRequestFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: MaintenanceCategorySchema,
  priority: MaintenancePrioritySchema,
  unitId: z.string().min(1, 'Unit is required'),
});

// User Registration Form Schema
export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  displayName: z.string().min(1, 'Display name is required'),
  phone: z.string().optional(),
  role: UserRoleSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Login Form Schema
export const LoginFormSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

export const isValidUserRole = (role: string): role is UserRole => {
  return ['admin', 'owner', 'agent', 'tenant'].includes(role);
};

export const isValidPropertyType = (type: string): type is PropertyType => {
  return ['residential', 'commercial', 'mixed'].includes(type);
};

export const isValidUnitType = (type: string): type is UnitType => {
  return ['studio', '1br', '2br', '3br', '4br+', 'commercial'].includes(type);
};

export const isValidMaintenancePriority = (priority: string): priority is MaintenancePriority => {
  return ['low', 'medium', 'high', 'emergency'].includes(priority);
};

// ============================================================================
// LEGACY TYPES (for backward compatibility)
// ============================================================================

// Keep existing types for backward compatibility
export interface Tenant {
  id: string;
  userId: string;
  personalInfo: {
    idNumber: string;
    nationality: string;
    occupation: string;
    employer?: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  currentUnit?: string;
  leaseHistory: string[];
  paymentHistory: string[];
  requestHistory: string[];
  status: 'active' | 'notice_period' | 'former';
  createdAt: Timestamp;
}

export interface Agent {
  id: string;
  userId: string;
  assignedProperties: string[];
  specializations: string[];
  performance: {
    completedTasks: number;
    avgResponseTime: number;
    tenantSatisfactionRating: number;
  };
  workSchedule: {
    workingDays: string[];
    workingHours: { start: string; end: string };
  };
  status: 'active' | 'on_leave' | 'inactive';
  createdAt: Timestamp;
}

export interface Owner {
  id: string;
  userId: string;
  ownedProperties: string[];
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branch?: string;
  };
  preferences: {
    paymentDay: number;
    communicationMethod: 'email' | 'phone' | 'both';
    autoApproveLimit: number;
  };
  createdAt: Timestamp;
}

export interface Inspection {
  id: string;
  propertyId: string;
  unitId?: string;
  type: 'routine' | 'move_in' | 'move_out' | 'special';
  performedBy: string;
  scheduledDate: Timestamp;
  completedDate?: Timestamp;
  findings: string;
  photos: string[];
  videos: string[];
  issues: {
    description: string;
    severity: 'minor' | 'moderate' | 'major';
    resolved: boolean;
  }[];
  tenantSignature?: string;
  agentSignature?: string;
  createdAt: Timestamp;
}

export interface Schedule {
  id: string;
  agentId: string;
  propertyId?: string;
  title: string;
  description?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  type: 'inspection' | 'maintenance' | 'meeting' | 'other';
  location?: string;
  attendees?: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Timestamp;
}

// ============================================================================
// RE-EXPORTS FROM OTHER TYPE FILES
// ============================================================================

// Export form types
export type {
  PropertyFormData,
  UnitFormData,
  LeaseFormData,
  MaintenanceRequestFormData,
  UserRegistrationData,
  LoginFormData,
  PaymentFormData,
  ExpenseFormData,
} from './forms';

// Export validation utilities
export {
  validateData,
  safeValidate,
  validateField,
  formatValidationErrors,
  isEmpty,
  sanitizeString,
  normalizePhoneNumber,
  isValidEmail,
  validatePasswordStrength,
  validateFileSize,
  validateFileType,
  getFileExtension,
  validateImageDimensions,
  validateLeaseDates,
  validateRentAmount,
  validateMaintenanceCost,
} from './validation';

// Export API types
export type {
  ErrorResponse,
  SuccessResponse,
  LoginResponse,
  PropertyListResponse,
  PropertyDetailsResponse,
  MaintenanceRequestListResponse,
  MaintenanceRequestDetailsResponse,
  DashboardMetricsResponse,
  NotificationListResponse,
} from './api';