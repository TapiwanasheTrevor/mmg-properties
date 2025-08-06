// ============================================================================
// API RESPONSE TYPES AND UTILITIES
// ============================================================================

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// Paginated Response
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

// Error Response
export interface ErrorResponse extends ApiResponse<never> {
  success: false;
  error: string;
  details?: Record<string, any>;
  code?: string;
}

// Success Response
export interface SuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
}

// ============================================================================
// SPECIFIC API RESPONSE TYPES
// ============================================================================

// Authentication Responses
export interface LoginResponse {
  user: {
    uid: string;
    email: string;
    displayName: string;
    role: string;
    permissions: string[];
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

// Property Management Responses
export interface PropertyListResponse {
  properties: Array<{
    id: string;
    name: string;
    type: string;
    address: string;
    totalUnits: number;
    occupiedUnits: number;
    monthlyIncome: number;
    status: string;
  }>;
}

export interface PropertyDetailsResponse {
  property: {
    id: string;
    name: string;
    type: string;
    address: any;
    description?: string;
    images: string[];
    documents: string[];
    totalUnits: number;
    occupiedUnits: number;
    monthlyIncome: number;
    status: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
    agent?: {
      id: string;
      name: string;
      email: string;
    };
    units: Array<{
      id: string;
      unitNumber: string;
      type: string;
      status: string;
      monthlyRent: number;
      tenant?: {
        id: string;
        name: string;
        email: string;
      };
    }>;
  };
}

// Unit Management Responses
export interface UnitListResponse {
  units: Array<{
    id: string;
    unitNumber: string;
    type: string;
    status: string;
    monthlyRent: number;
    squareFootage: number;
    isOccupied: boolean;
    tenant?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

// Lease Management Responses
export interface LeaseListResponse {
  leases: Array<{
    id: string;
    property: {
      id: string;
      name: string;
    };
    unit: {
      id: string;
      unitNumber: string;
    };
    tenant: {
      id: string;
      name: string;
      email: string;
    };
    startDate: string;
    endDate: string;
    monthlyRent: number;
    status: string;
  }>;
}

export interface LeaseDetailsResponse {
  lease: {
    id: string;
    property: {
      id: string;
      name: string;
      address: any;
    };
    unit: {
      id: string;
      unitNumber: string;
      type: string;
    };
    tenant: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    paymentFrequency: string;
    terms: string;
    status: string;
    documents: string[];
    paymentHistory: Array<{
      id: string;
      amount: number;
      dueDate: string;
      paidDate?: string;
      status: string;
      method?: string;
      reference?: string;
    }>;
  };
}

// Maintenance Request Responses
export interface MaintenanceRequestListResponse {
  requests: Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    property: {
      id: string;
      name: string;
    };
    unit: {
      id: string;
      unitNumber: string;
    };
    tenant: {
      id: string;
      name: string;
    };
    agent?: {
      id: string;
      name: string;
    };
    createdAt: string;
    estimatedCost?: number;
  }>;
}

export interface MaintenanceRequestDetailsResponse {
  request: {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    property: {
      id: string;
      name: string;
      address: any;
    };
    unit: {
      id: string;
      unitNumber: string;
    };
    tenant: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    agent?: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    submittedMedia: Array<{
      id: string;
      url: string;
      type: string;
      filename: string;
    }>;
    progressMedia: Array<{
      id: string;
      url: string;
      type: string;
      filename: string;
    }>;
    completionMedia: Array<{
      id: string;
      url: string;
      type: string;
      filename: string;
    }>;
    estimatedCost?: number;
    actualCost?: number;
    requiresApproval: boolean;
    approvedBy?: string;
    scheduledDate?: string;
    completedDate?: string;
    comments: Array<{
      id: string;
      userId: string;
      userRole: string;
      message: string;
      attachments: string[];
      createdAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

// Financial Responses
export interface TransactionListResponse {
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    property: {
      id: string;
      name: string;
    };
    unit?: {
      id: string;
      unitNumber: string;
    };
    tenant?: {
      id: string;
      name: string;
    };
    status: string;
    createdAt: string;
    processedAt?: string;
  }>;
}

export interface FinancialReportResponse {
  report: {
    period: {
      start: string;
      end: string;
    };
    summary: {
      totalIncome: number;
      totalExpenses: number;
      netIncome: number;
      occupancyRate: number;
    };
    incomeBreakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    expenseBreakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    propertyPerformance: Array<{
      propertyId: string;
      propertyName: string;
      income: number;
      expenses: number;
      netIncome: number;
      occupancyRate: number;
    }>;
  };
}

// Dashboard Responses
export interface DashboardMetricsResponse {
  metrics: {
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    occupancyRate: number;
    monthlyRevenue: number;
    pendingMaintenance: number;
    overduePayments: number;
    activeLeases: number;
    expiringLeases: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'maintenance' | 'payment' | 'lease' | 'property';
    title: string;
    description: string;
    timestamp: string;
    priority?: string;
  }>;
  upcomingTasks: Array<{
    id: string;
    type: 'inspection' | 'lease_renewal' | 'maintenance' | 'payment_due';
    title: string;
    dueDate: string;
    priority: string;
  }>;
}

// Notification Responses
export interface NotificationListResponse {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    priority: string;
    read: boolean;
    actionUrl?: string;
    createdAt: string;
  }>;
  unreadCount: number;
}

// User Management Responses
export interface UserListResponse {
  users: Array<{
    uid: string;
    email: string;
    displayName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
  }>;
}

export interface UserProfileResponse {
  user: {
    uid: string;
    email: string;
    displayName: string;
    role: string;
    phone?: string;
    avatar?: string;
    isActive: boolean;
    permissions: string[];
    createdAt: string;
    lastLogin?: string;
  };
}

// File Upload Responses
export interface FileUploadResponse {
  file: {
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
    uploadedAt: string;
  };
}

export interface MultipleFileUploadResponse {
  files: Array<{
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>;
  failed?: Array<{
    filename: string;
    error: string;
  }>;
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

// Base Request
export interface ApiRequest {
  timestamp?: string;
  requestId?: string;
}

// Pagination Request
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search Request
export interface SearchRequest extends PaginationRequest {
  query?: string;
  filters?: Record<string, any>;
}

// Property Requests
export interface CreatePropertyRequest extends ApiRequest {
  name: string;
  type: string;
  address: any;
  description?: string;
  totalUnits: number;
  agentId?: string;
}

export interface UpdatePropertyRequest extends ApiRequest {
  name?: string;
  type?: string;
  address?: any;
  description?: string;
  totalUnits?: number;
  agentId?: string;
  status?: string;
}

// Unit Requests
export interface CreateUnitRequest extends ApiRequest {
  propertyId: string;
  unitNumber: string;
  type: string;
  squareFootage: number;
  monthlyRent: number;
  amenities: string[];
  description?: string;
}

export interface UpdateUnitRequest extends ApiRequest {
  unitNumber?: string;
  type?: string;
  squareFootage?: number;
  monthlyRent?: number;
  amenities?: string[];
  description?: string;
  status?: string;
}

// Lease Requests
export interface CreateLeaseRequest extends ApiRequest {
  propertyId: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  paymentFrequency: string;
  terms: string;
}

export interface UpdateLeaseRequest extends ApiRequest {
  startDate?: string;
  endDate?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  paymentFrequency?: string;
  terms?: string;
  status?: string;
}

// Maintenance Request Requests
export interface CreateMaintenanceRequestRequest extends ApiRequest {
  propertyId: string;
  unitId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  preferredDate?: string;
  tenantAvailable?: boolean;
  emergencyContact?: string;
}

export interface UpdateMaintenanceRequestRequest extends ApiRequest {
  status?: string;
  agentId?: string;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: string;
  completedDate?: string;
  requiresApproval?: boolean;
  approvedBy?: string;
}

// ============================================================================
// API UTILITIES
// ============================================================================

// Type guards
export const isSuccessResponse = <T>(response: ApiResponse<T>): response is SuccessResponse<T> => {
  return response.success === true;
};

export const isErrorResponse = (response: ApiResponse<any>): response is ErrorResponse => {
  return response.success === false;
};

export const isPaginatedResponse = <T>(response: ApiResponse<T[] | any>): response is PaginatedResponse<T> => {
  return 'pagination' in response;
};

// Response creators
export const createSuccessResponse = <T>(data: T, message?: string): SuccessResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (error: string, details?: Record<string, any>, code?: string): ErrorResponse => ({
  success: false,
  error,
  details,
  code,
  timestamp: new Date().toISOString(),
});

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  message?: string
): PaginatedResponse<T> => ({
  success: true,
  data,
  pagination,
  message,
  timestamp: new Date().toISOString(),
});

// Request utilities
export const addRequestMetadata = <T extends ApiRequest>(request: T): T => ({
  ...request,
  timestamp: new Date().toISOString(),
  requestId: generateRequestId(),
});

export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Response validation
export const validateApiResponse = <T>(response: any): response is ApiResponse<T> => {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof response.success === 'boolean' &&
    typeof response.timestamp === 'string'
  );
};