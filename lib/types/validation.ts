import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

// ============================================================================
// CUSTOM ZOD VALIDATORS
// ============================================================================

// Firebase Timestamp validator
export const TimestampSchema = z.custom<Timestamp>((val) => {
  return val instanceof Timestamp || (val && typeof val.toDate === 'function');
}, 'Invalid Timestamp');

// Phone number validator (international format)
export const PhoneSchema = z.string().regex(
  /^\+?[\d\s\-\(\)]+$/,
  'Invalid phone number format'
).min(10, 'Phone number too short').max(20, 'Phone number too long');

// URL validator with optional protocol
export const UrlSchema = z.string().refine((val) => {
  try {
    new URL(val.startsWith('http') ? val : `https://${val}`);
    return true;
  } catch {
    return false;
  }
}, 'Invalid URL format');

// File size validator (in bytes)
export const FileSizeSchema = (maxSize: number) => z.number().max(maxSize, `File size must be less than ${maxSize} bytes`);

// Image file type validator
export const ImageFileTypeSchema = z.string().refine((val) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(val.toLowerCase());
}, 'Invalid image file type');

// Video file type validator
export const VideoFileTypeSchema = z.string().refine((val) => {
  const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
  return allowedTypes.includes(val.toLowerCase());
}, 'Invalid video file type');

// Document file type validator
export const DocumentFileTypeSchema = z.string().refine((val) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  return allowedTypes.includes(val.toLowerCase());
}, 'Invalid document file type');

// Currency amount validator
export const CurrencySchema = z.number()
  .min(0, 'Amount must be non-negative')
  .max(1000000, 'Amount too large')
  .refine((val) => Number.isFinite(val), 'Invalid amount')
  .refine((val) => Number(val.toFixed(2)) === val, 'Amount can have at most 2 decimal places');

// Percentage validator
export const PercentageSchema = z.number()
  .min(0, 'Percentage must be non-negative')
  .max(100, 'Percentage cannot exceed 100');

// Postal code validator (flexible for different countries)
export const PostalCodeSchema = z.string().regex(
  /^[A-Za-z0-9\s\-]{3,10}$/,
  'Invalid postal code format'
);

// ============================================================================
// COMPOSITE VALIDATORS
// ============================================================================

// Date range validator
export const DateRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
}).refine((data) => data.end >= data.start, {
  message: 'End date must be after or equal to start date',
  path: ['end'],
});

// Price range validator
export const PriceRangeSchema = z.object({
  min: CurrencySchema,
  max: CurrencySchema,
}).refine((data) => data.max >= data.min, {
  message: 'Maximum price must be greater than or equal to minimum price',
  path: ['max'],
});

// Coordinates validator
export const CoordinatesSchema = z.object({
  lat: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  lng: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
});

// Contact information validator
export const ContactInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  phone: PhoneSchema,
  email: z.string().email('Invalid email format').optional(),
  relationship: z.string().min(1, 'Relationship is required').max(50, 'Relationship too long'),
});

// Bank details validator
export const BankDetailsSchema = z.object({
  accountName: z.string().min(1, 'Account name is required').max(100, 'Account name too long'),
  accountNumber: z.string().min(5, 'Account number too short').max(20, 'Account number too long'),
  bankName: z.string().min(1, 'Bank name is required').max(100, 'Bank name too long'),
  routingNumber: z.string().regex(/^\d{9}$/, 'Invalid routing number').optional(),
  swiftCode: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Invalid SWIFT code').optional(),
});

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

// Generic validation function
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

// Safe validation function (doesn't throw)
export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} => {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { 
        success: false, 
        error: result.error.errors.map(e => e.message).join(', ') 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
};

// Partial validation for form fields
export const validateField = <T>(
  schema: z.ZodSchema<T>, 
  fieldName: keyof T, 
  value: unknown
): { isValid: boolean; error?: string } => {
  try {
    // For field-level validation, we'll try to validate the full object with just this field
    // This is a simplified approach - in practice, you might want to use more sophisticated validation
    const testData = { [fieldName]: value } as any;
    
    // Try to validate just this field by creating a minimal valid object
    // This is a basic implementation - you might want to enhance this based on your needs
    if (value === undefined || value === null || value === '') {
      return { isValid: false, error: `${String(fieldName)} is required` };
    }
    
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || 'Validation failed' };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};

// Transform validation errors to a more usable format
export const formatValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
};

// Check if a value is empty (for form validation)
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Sanitize string input
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

// Normalize phone number
export const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

// Validate email format (more permissive than z.string().email())
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain numbers');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain special characters');
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
};

// ============================================================================
// FILE VALIDATION UTILITIES
// ============================================================================

// Validate file size
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Validate file type
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// Validate image dimensions
export const validateImageDimensions = (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img.width <= maxWidth && img.height <= maxHeight);
    };
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(file);
  });
};

// ============================================================================
// BUSINESS LOGIC VALIDATORS
// ============================================================================

// Validate lease dates
export const validateLeaseDates = (startDate: Date, endDate: Date): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const now = new Date();
  
  if (startDate < now) {
    errors.push('Start date cannot be in the past');
  }
  
  if (endDate <= startDate) {
    errors.push('End date must be after start date');
  }
  
  const minLeaseDuration = 30; // days
  const daysDifference = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDifference < minLeaseDuration) {
    errors.push(`Lease duration must be at least ${minLeaseDuration} days`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate rent amount against market rates
export const validateRentAmount = (
  rent: number,
  unitType: string,
  location: string
): {
  isValid: boolean;
  warning?: string;
} => {
  // This would typically involve checking against market data
  // For now, we'll use basic validation
  const minRent = 500;
  const maxRent = 10000;
  
  if (rent < minRent) {
    return { isValid: false };
  }
  
  if (rent > maxRent) {
    return { 
      isValid: true, 
      warning: 'Rent amount is significantly above market average' 
    };
  }
  
  return { isValid: true };
};

// Validate maintenance cost
export const validateMaintenanceCost = (
  cost: number,
  category: string,
  priority: string
): {
  isValid: boolean;
  requiresApproval: boolean;
  warning?: string;
} => {
  const approvalThreshold = 1000;
  const emergencyThreshold = 5000;
  
  let requiresApproval = cost > approvalThreshold;
  let warning: string | undefined;
  
  if (priority === 'emergency' && cost > emergencyThreshold) {
    warning = 'High cost emergency repair - consider multiple quotes';
  }
  
  if (category === 'structural' && cost < 500) {
    warning = 'Structural repairs typically cost more - verify estimate';
  }
  
  return {
    isValid: cost > 0,
    requiresApproval,
    warning,
  };
};