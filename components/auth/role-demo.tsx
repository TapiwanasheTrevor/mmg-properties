'use client';

import { useAuth, usePermissions } from '@/hooks/useAuth';
import { useConditionalRender, usePermissionCheck, useRoleCheck } from '@/hooks/useRoleAccess';
import { withPermissions, withRoles } from '@/lib/auth/permissions';
import { PERMISSIONS } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Component that requires admin role
const AdminOnlyComponent = withRoles(['admin'])(({ children }) => (
  <Card className="border-red-200">
    <CardHeader>
      <CardTitle className="text-red-600">Admin Only Section</CardTitle>
      <CardDescription>This content is only visible to administrators</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
));

// Component that requires specific permissions
const ManageUsersComponent = withPermissions([PERMISSIONS.MANAGE_USERS])(({ children }) => (
  <Card className="border-blue-200">
    <CardHeader>
      <CardTitle className="text-blue-600">User Management</CardTitle>
      <CardDescription>This content requires user management permissions</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
));

// Main demo component
export default function RoleDemo() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const { renderForRole, renderForPermission } = useConditionalRender();
  
  // Hook-based permission checks
  const { hasAccess: canManageUsers } = usePermissionCheck([PERMISSIONS.MANAGE_USERS]);
  const { hasAccess: isOwnerOrAdmin } = useRoleCheck(['owner', 'admin']);

  if (!user) {
    return <div>Please log in to see role-based content</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Current User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Name:</strong> {user.profile?.firstName || 'No name'} {user.profile?.lastName || ''}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Role:</strong> <Badge>{user.role}</Badge>
          </div>
          <div>
            <strong>MFA Enabled:</strong> <Badge variant={user.mfaEnabled ? 'default' : 'secondary'}>
              {user.mfaEnabled ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div>
            <strong>Permissions:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.permissions.map(permission => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-based rendering using hooks */}
      {renderForRole(['admin'], (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-600">Admin Dashboard</CardTitle>
            <CardDescription>Hook-based role rendering for admins</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This content is rendered using the useConditionalRender hook for admin role.</p>
          </CardContent>
        </Card>
      ))}

      {/* Permission-based rendering using hooks */}
      {renderForPermission([PERMISSIONS.VIEW_FINANCIALS], (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-600">Financial Data</CardTitle>
            <CardDescription>Hook-based permission rendering for financial access</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This content requires VIEW_FINANCIALS permission.</p>
          </CardContent>
        </Card>
      ))}

      {/* HOC-based components */}
      <AdminOnlyComponent>
        <p>This is wrapped with the withRoles HOC for admin access.</p>
        <Button>Admin Action</Button>
      </AdminOnlyComponent>

      <ManageUsersComponent>
        <p>This is wrapped with the withPermissions HOC for user management.</p>
        <Button>Manage Users</Button>
      </ManageUsersComponent>

      {/* Direct permission checks */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Checks</CardTitle>
          <CardDescription>Direct permission and role checking examples</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Can Manage Users:</strong> 
              <Badge variant={canManageUsers ? 'default' : 'secondary'} className="ml-2">
                {canManageUsers ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <strong>Is Owner or Admin:</strong> 
              <Badge variant={isOwnerOrAdmin ? 'default' : 'secondary'} className="ml-2">
                {isOwnerOrAdmin ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <strong>Can View Financials:</strong> 
              <Badge variant={permissions.canViewFinancials() ? 'default' : 'secondary'} className="ml-2">
                {permissions.canViewFinancials() ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <strong>Can Generate Reports:</strong> 
              <Badge variant={permissions.canGenerateReports() ? 'default' : 'secondary'} className="ml-2">
                {permissions.canGenerateReports() ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <strong>Is Admin:</strong> 
              <Badge variant={permissions.isAdmin() ? 'default' : 'secondary'} className="ml-2">
                {permissions.isAdmin() ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <strong>Is Tenant:</strong> 
              <Badge variant={permissions.isTenant() ? 'default' : 'secondary'} className="ml-2">
                {permissions.isTenant() ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditional buttons based on permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Action Buttons</CardTitle>
          <CardDescription>Buttons that appear based on user permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {permissions.canManageUsers() && (
            <Button className="mr-2">Manage Users</Button>
          )}
          {permissions.canManageProperties() && (
            <Button className="mr-2">Manage Properties</Button>
          )}
          {permissions.canViewFinancials() && (
            <Button className="mr-2">View Financials</Button>
          )}
          {permissions.canGenerateReports() && (
            <Button className="mr-2">Generate Reports</Button>
          )}
          {permissions.canManageRequests() && (
            <Button className="mr-2">Manage Requests</Button>
          )}
          {permissions.canViewAuditLogs() && (
            <Button className="mr-2">View Audit Logs</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}