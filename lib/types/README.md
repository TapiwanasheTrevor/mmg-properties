# MMG Property Platform - Type Definitions

This directory contains comprehensive TypeScript type definitions and Zod validation schemas for the MMG Property Platform.

## File Structure

- **`index.ts`** - Main type definitions and core data models
- **`forms.ts`** - Form-specific types and validation schemas
- **`validation.ts`** - Validation utilities and custom validators
- **`api.ts`** - API request/response types and utilities

## Core Data Models

### User Management
- `User` - Core user interface with role-based access
- `UserRole` - Type union for user roles (admin, owner, agent, tenant)
- `UserSchema` - Zod validation schema for user data

### Property Management
- `Property` - Property data model with address and metadata
- `Unit` - Individual unit within a property
- `Address` - Standardized address structure
- `PropertyType` - Type union for property types

### Lease Management
- `Lease` - Lease agreement with terms and payment history
- `Payment` - Individual payment record
- `LeaseStatus` - Status tracking for leases

### Maintenance System
- `MaintenanceRequest` - Maintenance request with media support
- `MediaFile` - File attachment structure
- `MaintenanceComment` - Comment system for requests

## Form Types

All form types include comprehensive validation:

```typescript
import { PropertyFormData, PropertyFormSchema } from '@/lib/types';

// Form data type
const formData: PropertyFormData = {
  name: "Sample Property",
  type: "residential",
  address: { /* address data */ },
  totalUnits: 10
};

// Validation
const result = PropertyFormSchema.safeParse(formData);
if (result.success) {
  // Use validated data
  console.log(result.data);
}
```

## Validation Utilities

### Basic Validation
```typescript
import { validateData, safeValidate } from '@/lib/types';

// Strict validation (throws on error)
const { success, data, errors } = validateData(UserSchema, userData);

// Safe validation (never throws)
const { success, data, error } = safeValidate(UserSchema, userData);
```

### Field-Level Validation
```typescript
import { validateField } from '@/lib/types';

const { isValid, error } = validateField(PropertyFormSchema, 'name', 'Property Name');
```

### Custom Validators
```typescript
import { 
  validatePasswordStrength,
  validateFileSize,
  validateLeaseDates 
} from '@/lib/types';

// Password validation
const { isValid, score, feedback } = validatePasswordStrength(password);

// File validation
const isValidSize = validateFileSize(file, 5); // 5MB limit

// Business logic validation
const { isValid, errors } = validateLeaseDates(startDate, endDate);
```

## API Types

### Request/Response Patterns
```typescript
import { ApiResponse, PaginatedResponse, PropertyListResponse } from '@/lib/types';

// Basic API response
const response: ApiResponse<Property> = {
  success: true,
  data: propertyData,
  timestamp: new Date().toISOString()
};

// Paginated response
const listResponse: PaginatedResponse<Property> = {
  success: true,
  data: properties,
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasNext: true,
    hasPrev: false
  },
  timestamp: new Date().toISOString()
};
```

### Type Guards
```typescript
import { isSuccessResponse, isErrorResponse } from '@/lib/types';

if (isSuccessResponse(response)) {
  // TypeScript knows response.data exists
  console.log(response.data);
}

if (isErrorResponse(response)) {
  // TypeScript knows response.error exists
  console.error(response.error);
}
```

## Best Practices

### 1. Always Use Type-Safe Forms
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PropertyFormData, PropertyFormSchema } from '@/lib/types';

const form = useForm<PropertyFormData>({
  resolver: zodResolver(PropertyFormSchema),
  defaultValues: {
    name: '',
    type: 'residential',
    // ... other defaults
  }
});
```

### 2. Validate API Responses
```typescript
import { PropertyDetailsResponse } from '@/lib/types';

const fetchProperty = async (id: string): Promise<PropertyDetailsResponse> => {
  const response = await fetch(`/api/properties/${id}`);
  const data = await response.json();
  
  // Validate response structure
  if (!validateApiResponse(data)) {
    throw new Error('Invalid API response');
  }
  
  return data;
};
```

### 3. Use Type Guards for Runtime Safety
```typescript
import { isValidUserRole, isValidPropertyType } from '@/lib/types';

const processUserData = (role: string, propertyType: string) => {
  if (!isValidUserRole(role)) {
    throw new Error(`Invalid user role: ${role}`);
  }
  
  if (!isValidPropertyType(propertyType)) {
    throw new Error(`Invalid property type: ${propertyType}`);
  }
  
  // Now TypeScript knows these are valid
  // role is UserRole, propertyType is PropertyType
};
```

### 4. Leverage Utility Types
```typescript
import { FormState, LoadingState, SelectOption } from '@/lib/types';

// Form component state
const [formState, setFormState] = useState<FormState<PropertyFormData>>({
  data: initialData,
  errors: {},
  isSubmitting: false,
  isValid: false,
  isDirty: false,
  touchedFields: {}
});

// Loading states
const [loadingState, setLoadingState] = useState<LoadingState>({
  isLoading: true,
  error: undefined
});

// Select options
const propertyTypeOptions: SelectOption[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed', label: 'Mixed Use' }
];
```

## Migration from Legacy Types

If you're updating existing code, the legacy types are still available for backward compatibility:

- `Tenant` - Legacy tenant interface
- `Agent` - Legacy agent interface  
- `Owner` - Legacy owner interface
- `Inspection` - Legacy inspection interface
- `Schedule` - Legacy schedule interface

These will be gradually migrated to the new type system.

## Contributing

When adding new types:

1. Add the interface to the appropriate file (`index.ts` for core models, `forms.ts` for form types)
2. Create corresponding Zod schema for validation
3. Add type guards and utilities as needed
4. Export from the main `index.ts` file
5. Update this README with usage examples
6. Add tests for complex validation logic

## Type Safety Guidelines

1. **Never use `any`** - Use `unknown` and type guards instead
2. **Prefer type unions over enums** - They're more flexible and tree-shakeable
3. **Use branded types for IDs** - Consider using branded types for different ID types
4. **Validate at boundaries** - Always validate data coming from external sources
5. **Use readonly for immutable data** - Mark arrays and objects as readonly when appropriate