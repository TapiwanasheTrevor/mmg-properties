import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AuditLog {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
  timestamp: Timestamp;
}

export type AuditAction = 
  // Financial Actions
  | 'transaction_create'
  | 'transaction_update' 
  | 'transaction_delete'
  | 'transaction_process'
  | 'payment_record'
  | 'expense_record'
  | 'payout_calculate'
  | 'payout_approve'
  | 'payout_send'
  // User Management
  | 'user_login'
  | 'user_logout'
  | 'user_create'
  | 'user_update'
  | 'user_delete'
  | 'role_change'
  // Property Management
  | 'property_create'
  | 'property_update'
  | 'property_delete'
  | 'unit_create'
  | 'unit_update'
  | 'unit_delete'
  // Tenant Management
  | 'tenant_create'
  | 'tenant_update'
  | 'tenant_delete'
  | 'lease_create'
  | 'lease_update'
  | 'lease_terminate'
  // Maintenance
  | 'maintenance_create'
  | 'maintenance_assign'
  | 'maintenance_complete'
  | 'maintenance_update'
  // Data Access
  | 'data_export'
  | 'report_generate'
  | 'document_access'
  | 'sensitive_data_access';

const auditLogsCollection = collection(db, 'audit_logs');

// Log an audit event
export const logAuditEvent = async (
  userId: string,
  userRole: string,
  action: AuditAction,
  resource: string,
  resourceId: string,
  details: Record<string, any> = {},
  success: boolean = true,
  error?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    await addDoc(auditLogsCollection, {
      userId,
      userRole,
      action,
      resource,
      resourceId,
      details,
      success,
      error,
      ipAddress,
      userAgent,
      timestamp: serverTimestamp(),
    });
  } catch (logError) {
    // Don't throw errors from audit logging to avoid breaking business logic
    console.error('Failed to log audit event:', logError);
  }
};

// Get audit logs with filtering
export const getAuditLogs = async (options: {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  dateFrom?: Date;
  dateTo?: Date;
  pageSize?: number;
  successOnly?: boolean;
}) => {
  try {
    let q = query(auditLogsCollection);

    // Apply filters
    if (options.userId) {
      q = query(q, where('userId', '==', options.userId));
    }
    
    if (options.action) {
      q = query(q, where('action', '==', options.action));
    }
    
    if (options.resource) {
      q = query(q, where('resource', '==', options.resource));
    }
    
    if (options.successOnly) {
      q = query(q, where('success', '==', true));
    }

    // Order by timestamp (most recent first)
    q = query(q, orderBy('timestamp', 'desc'));

    // Apply limit
    if (options.pageSize) {
      q = query(q, limit(options.pageSize));
    }

    const querySnapshot = await getDocs(q);
    const logs: AuditLog[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Client-side date filtering (for better performance, use Firestore date queries)
      if (options.dateFrom || options.dateTo) {
        const logDate = data.timestamp.toDate();
        if (options.dateFrom && logDate < options.dateFrom) return;
        if (options.dateTo && logDate > options.dateTo) return;
      }
      
      logs.push({ id: doc.id, ...data } as AuditLog);
    });

    return logs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

// Get audit statistics
export const getAuditStats = async (dateFrom?: Date, dateTo?: Date) => {
  try {
    const logs = await getAuditLogs({ 
      dateFrom, 
      dateTo, 
      pageSize: 10000 // Get all logs for stats
    });

    const stats = {
      total: logs.length,
      successful: logs.filter(l => l.success).length,
      failed: logs.filter(l => !l.success).length,
      byAction: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      byResource: {} as Record<string, number>,
      recentFailures: logs.filter(l => !l.success).slice(0, 10),
      topUsers: [] as Array<{ userId: string; count: number }>,
      topActions: [] as Array<{ action: string; count: number }>,
    };

    // Count by action
    logs.forEach(log => {
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;
      stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
    });

    // Get top users
    stats.topUsers = Object.entries(stats.byUser)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get top actions
    stats.topActions = Object.entries(stats.byAction)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  } catch (error) {
    console.error('Error calculating audit stats:', error);
    throw error;
  }
};

// Helper functions for common audit scenarios
export const auditHelpers = {
  // Financial audit helpers
  logTransaction: (userId: string, userRole: string, action: 'create' | 'update' | 'delete' | 'process', transactionId: string, details: any) => 
    logAuditEvent(userId, userRole, `transaction_${action}` as AuditAction, 'transaction', transactionId, details),
  
  logPayment: (userId: string, userRole: string, transactionId: string, amount: number, type: string) => 
    logAuditEvent(userId, userRole, 'payment_record', 'transaction', transactionId, { amount, type }),
  
  logPayout: (userId: string, userRole: string, action: 'calculate' | 'approve' | 'send', payoutId: string, details: any) => 
    logAuditEvent(userId, userRole, `payout_${action}` as AuditAction, 'payout', payoutId, details),

  // User management audit helpers
  logUserAction: (userId: string, userRole: string, action: 'create' | 'update' | 'delete', targetUserId: string, details: any) => 
    logAuditEvent(userId, userRole, `user_${action}` as AuditAction, 'user', targetUserId, details),
  
  logLogin: (userId: string, userRole: string, success: boolean, ipAddress?: string, userAgent?: string, error?: string) => 
    logAuditEvent(userId, userRole, 'user_login', 'user', userId, {}, success, error, ipAddress, userAgent),
  
  logLogout: (userId: string, userRole: string) => 
    logAuditEvent(userId, userRole, 'user_logout', 'user', userId),

  // Property management audit helpers
  logPropertyAction: (userId: string, userRole: string, action: 'create' | 'update' | 'delete', propertyId: string, details: any) => 
    logAuditEvent(userId, userRole, `property_${action}` as AuditAction, 'property', propertyId, details),
  
  logUnitAction: (userId: string, userRole: string, action: 'create' | 'update' | 'delete', unitId: string, details: any) => 
    logAuditEvent(userId, userRole, `unit_${action}` as AuditAction, 'unit', unitId, details),

  // Tenant management audit helpers
  logTenantAction: (userId: string, userRole: string, action: 'create' | 'update' | 'delete', tenantId: string, details: any) => 
    logAuditEvent(userId, userRole, `tenant_${action}` as AuditAction, 'tenant', tenantId, details),
  
  logLeaseAction: (userId: string, userRole: string, action: 'create' | 'update' | 'terminate', leaseId: string, details: any) => 
    logAuditEvent(userId, userRole, `lease_${action}` as AuditAction, 'lease', leaseId, details),

  // Maintenance audit helpers
  logMaintenanceAction: (userId: string, userRole: string, action: 'create' | 'assign' | 'complete' | 'update', requestId: string, details: any) => 
    logAuditEvent(userId, userRole, `maintenance_${action}` as AuditAction, 'maintenance', requestId, details),

  // Data access audit helpers
  logDataExport: (userId: string, userRole: string, resource: string, details: any) => 
    logAuditEvent(userId, userRole, 'data_export', resource, 'export', details),
  
  logReportGeneration: (userId: string, userRole: string, reportType: string, details: any) => 
    logAuditEvent(userId, userRole, 'report_generate', 'report', reportType, details),
  
  logSensitiveDataAccess: (userId: string, userRole: string, resource: string, resourceId: string, details: any) => 
    logAuditEvent(userId, userRole, 'sensitive_data_access', resource, resourceId, details),
};

// Security rules validation
export const validateSecurityRules = {
  // Check if user can access resource
  canAccessResource: (userRole: string, resource: string, action: string): boolean => {
    const permissions = {
      admin: ['*'], // Admin can do everything
      owner: ['property', 'unit', 'tenant', 'lease', 'transaction', 'maintenance', 'report'],
      agent: ['tenant', 'lease', 'maintenance', 'transaction'],
      tenant: ['tenant'], // Tenants can only access their own data
    };

    const userPermissions = permissions[userRole as keyof typeof permissions] || [];
    return userPermissions.includes('*') || userPermissions.includes(resource);
  },

  // Check if financial action is allowed
  canPerformFinancialAction: (userRole: string, action: string): boolean => {
    const financialPermissions = {
      admin: ['*'],
      owner: ['view', 'report'],
      agent: ['record', 'view'],
      tenant: ['view_own'],
    };

    const userPermissions = financialPermissions[userRole as keyof typeof financialPermissions] || [];
    return userPermissions.includes('*') || userPermissions.includes(action);
  },

  // Validate sensitive data access
  isSensitiveDataAccess: (resource: string, action: string): boolean => {
    const sensitiveResources = ['transaction', 'payout', 'user', 'financial_report'];
    const sensitiveActions = ['export', 'bulk_access', 'admin_view'];
    
    return sensitiveResources.includes(resource) || sensitiveActions.includes(action);
  },
};

// Audit middleware for API calls
export const createAuditMiddleware = (getUserInfo: () => { id: string; role: string } | null) => {
  return async (action: AuditAction, resource: string, resourceId: string, details?: any) => {
    const user = getUserInfo();
    if (!user) return;

    // Check if action is allowed
    if (!validateSecurityRules.canAccessResource(user.role, resource, action)) {
      await logAuditEvent(
        user.id, 
        user.role, 
        action, 
        resource, 
        resourceId, 
        details, 
        false, 
        'Access denied - insufficient permissions'
      );
      throw new Error('Access denied');
    }

    // Log sensitive data access
    if (validateSecurityRules.isSensitiveDataAccess(resource, action)) {
      await auditHelpers.logSensitiveDataAccess(user.id, user.role, resource, resourceId, details || {});
    }
  };
};
