import { z } from 'zod';
import {
  PropertyTypeSchema,
  UnitTypeSchema,
  MaintenanceCategorySchema,
  MaintenancePrioritySchema,
  UserRoleSchema,
  PaymentFrequencySchema,
  AddressSchema,
} from './index';

// ============================================================================
// FORM STATE UTILITIES
// ============================================================================

export interface FormFieldError {
  message: string;
  type: 'required' | 'invalid' | 'custom';
}

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, FormFieldError>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  touchedFields: Partial<Record<keyof T, boolean>>;
}

export interface FormConfig<T> {
  initialValues: T;
  validationSchema: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  onError?: (errors: Partial<Record<keyof T, FormFieldError>>) => void;
}

// ============================================================================
// PROPERTY MANAGEMENT FORMS
// ============================================================================

// Property Creation/Edit Form
export const PropertyFormSchema = z.object({
  name: z.string().min(1, 'Property name is required').max(100, 'Name too long'),
  type: PropertyTypeSchema,
  address: AddressSchema,
  description: z.string().max(500, 'Description too long').optional(),
  totalUnits: z.number().min(1, 'Must have at least 1 unit').max(1000, 'Too many units'),
  agentId: z.string().optional(),
});

export type PropertyFormData = z.infer<typeof PropertyFormSchema>;

// Unit Creation/Edit Form
export const UnitFormSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required').max(20, 'Unit number too long'),
  type: UnitTypeSchema,
  squareFootage: z.number().min(1, 'Square footage must be positive').max(10000, 'Too large'),
  monthlyRent: z.number().min(0, 'Monthly rent must be non-negative').max(50000, 'Rent too high'),
  amenities: z.array(z.string()).max(20, 'Too many amenities'),
  description: z.string().max(500, 'Description too long').optional(),
});

export type UnitFormData = z.infer<typeof UnitFormSchema>;

// ============================================================================
// LEASE MANAGEMENT FORMS
// ============================================================================

// Lease Creation Form
export const LeaseFormSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  unitId: z.string().min(1, 'Unit is required'),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  monthlyRent: z.number().min(0, 'Monthly rent must be non-negative').max(50000, 'Rent too high'),
  securityDeposit: z.number().min(0, 'Security deposit must be non-negative').max(100000, 'Deposit too high'),
  paymentFrequency: PaymentFrequencySchema,
  terms: z.string().min(10, 'Lease terms must be at least 10 characters').max(2000, 'Terms too long'),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export type LeaseFormData = z.infer<typeof LeaseFormSchema>;

// Lease Renewal Form
export const LeaseRenewalFormSchema = z.object({
  newEndDate: z.date({ required_error: 'New end date is required' }),
  newMonthlyRent: z.number().min(0, 'Monthly rent must be non-negative').max(50000, 'Rent too high'),
  updatedTerms: z.string().max(2000, 'Terms too long').optional(),
});

export type LeaseRenewalFormData = z.infer<typeof LeaseRenewalFormSchema>;

// ============================================================================
// MAINTENANCE REQUEST FORMS
// ============================================================================

// Maintenance Request Submission Form
export const MaintenanceRequestFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  category: MaintenanceCategorySchema,
  priority: MaintenancePrioritySchema,
  unitId: z.string().min(1, 'Unit is required'),
  preferredDate: z.date().optional(),
  tenantAvailable: z.boolean().default(true),
  emergencyContact: z.string().optional(),
});

export type MaintenanceRequestFormData = z.infer<typeof MaintenanceRequestFormSchema>;

// Maintenance Update Form (for agents)
export const MaintenanceUpdateFormSchema = z.object({
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled']),
  progressNotes: z.string().max(500, 'Notes too long').optional(),
  estimatedCost: z.number().min(0).max(100000, 'Cost too high').optional(),
  actualCost: z.number().min(0).max(100000, 'Cost too high').optional(),
  scheduledDate: z.date().optional(),
  completionNotes: z.string().max(500, 'Notes too long').optional(),
});

export type MaintenanceUpdateFormData = z.infer<typeof MaintenanceUpdateFormSchema>;

// ============================================================================
// USER MANAGEMENT FORMS
// ============================================================================

// User Registration Form
export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  displayName: z.string().min(1, 'Display name is required').max(50, 'Name too long'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
  role: UserRoleSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UserRegistrationData = z.infer<typeof UserRegistrationSchema>;

// User Profile Update Form
export const UserProfileUpdateSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(50, 'Name too long'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export type UserProfileUpdateData = z.infer<typeof UserProfileUpdateSchema>;

// Login Form
export const LoginFormSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

// Password Reset Form
export const PasswordResetSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export type PasswordResetData = z.infer<typeof PasswordResetSchema>;

// Change Password Form
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;

// ============================================================================
// FINANCIAL FORMS
// ============================================================================

// Payment Recording Form
export const PaymentFormSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive').max(100000, 'Amount too high'),
  paymentMethod: z.enum(['cash', 'check', 'transfer', 'online']),
  reference: z.string().max(50, 'Reference too long').optional(),
  notes: z.string().max(200, 'Notes too long').optional(),
  paymentDate: z.date({ required_error: 'Payment date is required' }),
});

export type PaymentFormData = z.infer<typeof PaymentFormSchema>;

// Expense Recording Form
export const ExpenseFormSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive').max(100000, 'Amount too high'),
  category: z.enum(['maintenance', 'utilities', 'insurance', 'taxes', 'management', 'other']),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional(),
  vendor: z.string().max(100, 'Vendor name too long').optional(),
  expenseDate: z.date({ required_error: 'Expense date is required' }),
  receipt: z.string().url('Invalid receipt URL').optional(),
});

export type ExpenseFormData = z.infer<typeof ExpenseFormSchema>;

// ============================================================================
// SEARCH AND FILTER FORMS
// ============================================================================

// Property Search Form
export const PropertySearchSchema = z.object({
  query: z.string().max(100, 'Query too long').optional(),
  type: PropertyTypeSchema.optional(),
  location: z.string().max(100, 'Location too long').optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  unitsMin: z.number().min(1).optional(),
  unitsMax: z.number().min(1).optional(),
}).refine((data) => {
  if (data.priceMin && data.priceMax) {
    return data.priceMax >= data.priceMin;
  }
  return true;
}, {
  message: 'Maximum price must be greater than minimum price',
  path: ['priceMax'],
}).refine((data) => {
  if (data.unitsMin && data.unitsMax) {
    return data.unitsMax >= data.unitsMin;
  }
  return true;
}, {
  message: 'Maximum units must be greater than minimum units',
  path: ['unitsMax'],
});

export type PropertySearchData = z.infer<typeof PropertySearchSchema>;

// Maintenance Request Filter Form
export const MaintenanceFilterSchema = z.object({
  status: z.enum(['submitted', 'assigned', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: MaintenancePrioritySchema.optional(),
  category: MaintenanceCategorySchema.optional(),
  propertyId: z.string().optional(),
  agentId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
}).refine((data) => {
  if (data.dateFrom && data.dateTo) {
    return data.dateTo >= data.dateFrom;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['dateTo'],
});

export type MaintenanceFilterData = z.infer<typeof MaintenanceFilterSchema>;

// ============================================================================
// FORM VALIDATION HELPERS
// ============================================================================

export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Partial<Record<keyof T, FormFieldError>>;
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Partial<Record<keyof T, FormFieldError>> = {};
      error.errors.forEach((err) => {
        const path = err.path[0] as keyof T;
        errors[path] = {
          message: err.message,
          type: err.code === 'invalid_type' ? 'invalid' : 'custom',
        };
      });
      return { success: false, errors };
    }
    return { success: false, errors: {} };
  }
};

export const getFieldError = <T>(
  errors: Partial<Record<keyof T, FormFieldError>> | undefined,
  field: keyof T
): string | undefined => {
  return errors?.[field]?.message;
};

export const hasFieldError = <T>(
  errors: Partial<Record<keyof T, FormFieldError>> | undefined,
  field: keyof T
): boolean => {
  return Boolean(errors?.[field]);
};

// ============================================================================
// FORM FIELD CONFIGURATIONS
// ============================================================================

export interface FormFieldConfig {
  label: string;
  placeholder?: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  accept?: string; // for file inputs
}

export const PROPERTY_FORM_FIELDS: Record<keyof PropertyFormData, FormFieldConfig> = {
  name: {
    label: 'Property Name',
    placeholder: 'Enter property name',
    type: 'text',
    required: true,
  },
  type: {
    label: 'Property Type',
    type: 'select',
    required: true,
    options: [
      { value: 'residential', label: 'Residential' },
      { value: 'commercial', label: 'Commercial' },
      { value: 'mixed', label: 'Mixed Use' },
    ],
  },
  address: {
    label: 'Address',
    type: 'text', // This would be handled as a complex object in the form
    required: true,
  },
  description: {
    label: 'Description',
    placeholder: 'Enter property description',
    type: 'textarea',
  },
  totalUnits: {
    label: 'Total Units',
    type: 'number',
    required: true,
    min: 1,
  },
  agentId: {
    label: 'Assigned Agent',
    type: 'select',
  },
};

export const UNIT_FORM_FIELDS: Record<keyof UnitFormData, FormFieldConfig> = {
  unitNumber: {
    label: 'Unit Number',
    placeholder: 'e.g., A1, 101',
    type: 'text',
    required: true,
  },
  type: {
    label: 'Unit Type',
    type: 'select',
    required: true,
    options: [
      { value: 'studio', label: 'Studio' },
      { value: '1br', label: '1 Bedroom' },
      { value: '2br', label: '2 Bedroom' },
      { value: '3br', label: '3 Bedroom' },
      { value: '4br+', label: '4+ Bedroom' },
      { value: 'commercial', label: 'Commercial' },
    ],
  },
  squareFootage: {
    label: 'Square Footage',
    type: 'number',
    required: true,
    min: 1,
  },
  monthlyRent: {
    label: 'Monthly Rent',
    type: 'number',
    required: true,
    min: 0,
    step: 0.01,
  },
  amenities: {
    label: 'Amenities',
    type: 'text', // This would be handled as an array in the form
  },
  description: {
    label: 'Description',
    placeholder: 'Enter unit description',
    type: 'textarea',
  },
};

export const MAINTENANCE_REQUEST_FORM_FIELDS: Record<keyof MaintenanceRequestFormData, FormFieldConfig> = {
  title: {
    label: 'Issue Title',
    placeholder: 'Brief description of the issue',
    type: 'text',
    required: true,
  },
  description: {
    label: 'Detailed Description',
    placeholder: 'Provide detailed information about the issue',
    type: 'textarea',
    required: true,
  },
  category: {
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'plumbing', label: 'Plumbing' },
      { value: 'electrical', label: 'Electrical' },
      { value: 'hvac', label: 'HVAC' },
      { value: 'appliance', label: 'Appliance' },
      { value: 'structural', label: 'Structural' },
      { value: 'other', label: 'Other' },
    ],
  },
  priority: {
    label: 'Priority',
    type: 'select',
    required: true,
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'emergency', label: 'Emergency' },
    ],
  },
  unitId: {
    label: 'Unit',
    type: 'select',
    required: true,
  },
  preferredDate: {
    label: 'Preferred Date',
    type: 'date',
  },
  tenantAvailable: {
    label: 'I will be available during repair',
    type: 'checkbox',
  },
  emergencyContact: {
    label: 'Emergency Contact',
    placeholder: 'Alternative contact number',
    type: 'text',
  },
};