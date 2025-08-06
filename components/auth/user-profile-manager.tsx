'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateUserRole, updateUserPermissions, getUserProfile, deactivateUser, reactivateUser, getUserAuditLogs } from '@/lib/auth';
import { PERMISSIONS } from '@/lib/auth';
import { User, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';

interface UserProfileManagerProps {
  userId?: string;
  onUserUpdated?: (user: User) => void;
}

export default function UserProfileManager({ userId, onUserUpdated }: UserProfileManagerProps) {
  const { user: currentUser } = useAuth();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');

  // Determine if we're editing current user or another user
  const isEditingSelf = !userId || userId === currentUser?.id;
  const userToEdit = isEditingSelf ? currentUser : targetUser;

  useEffect(() => {
    if (!isEditingSelf && userId) {
      loadTargetUser();
    }
  }, [userId, isEditingSelf]);

  useEffect(() => {
    if (userToEdit) {
      setSelectedRole(userToEdit.role);
      setSelectedPermissions(userToEdit.permissions || []);
    }
  }, [userToEdit]);

  const loadTargetUser = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const user = await getUserProfile(userId);
      if (user) {
        setTargetUser(user);
      } else {
        toast({
          title: 'Error',
          description: 'User not found',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!userToEdit || !currentUser) return;

    // Check if current user can manage users
    if (!currentUser.permissions.includes(PERMISSIONS.MANAGE_USERS)) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to update user roles',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      await updateUserRole(userToEdit.id, selectedRole, currentUser?.id);
      
      // Reload user data
      if (!isEditingSelf) {
        await loadTargetUser();
      }
      
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
      
      if (onUserUpdated && targetUser) {
        onUserUpdated({ ...targetUser, role: selectedRole });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePermissionsUpdate = async () => {
    if (!userToEdit || !currentUser) return;

    // Check if current user can manage users
    if (!currentUser.permissions.includes(PERMISSIONS.MANAGE_USERS)) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to update user permissions',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      await updateUserPermissions(userToEdit.id, selectedPermissions, currentUser?.id);
      
      // Reload user data
      if (!isEditingSelf) {
        await loadTargetUser();
      }
      
      toast({
        title: 'Success',
        description: 'User permissions updated successfully',
      });
      
      if (onUserUpdated && targetUser) {
        onUserUpdated({ ...targetUser, permissions: selectedPermissions });
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user permissions',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleDeactivateUser = async () => {
    if (!userToEdit || !currentUser) return;

    if (!currentUser.permissions.includes(PERMISSIONS.MANAGE_USERS)) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to deactivate users',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      await deactivateUser(userToEdit.id, deactivationReason, currentUser.id);
      
      // Reload user data
      if (!isEditingSelf) {
        await loadTargetUser();
      }
      
      toast({
        title: 'Success',
        description: 'User account deactivated successfully',
      });
      
      setDeactivationReason('');
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate user account',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleReactivateUser = async () => {
    if (!userToEdit || !currentUser) return;

    if (!currentUser.permissions.includes(PERMISSIONS.MANAGE_USERS)) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to reactivate users',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      await reactivateUser(userToEdit.id, currentUser.id);
      
      // Reload user data
      if (!isEditingSelf) {
        await loadTargetUser();
      }
      
      toast({
        title: 'Success',
        description: 'User account reactivated successfully',
      });
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to reactivate user account',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const loadAuditLogs = async () => {
    if (!userToEdit || !currentUser) return;

    if (!currentUser.permissions.includes(PERMISSIONS.AUDIT_LOGS)) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to view audit logs',
        variant: 'destructive',
      });
      return;
    }

    try {
      const logs = await getUserAuditLogs(userToEdit.id);
      setAuditLogs(logs);
      setShowAuditLogs(true);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      });
    }
  };

  const canManageUser = currentUser?.permissions.includes(PERMISSIONS.MANAGE_USERS) || false;
  const canEditRole = canManageUser && !isEditingSelf;
  const canEditPermissions = canManageUser && !isEditingSelf;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userToEdit) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            {isEditingSelf ? 'Your profile information' : 'User profile information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <p className="text-sm font-medium">
                {userToEdit.profile.firstName} {userToEdit.profile.lastName}
              </p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm font-medium">{userToEdit.email}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <p className="text-sm font-medium">{userToEdit.phone || 'Not provided'}</p>
            </div>
            <div>
              <Label>Status</Label>
              <Badge variant={userToEdit.isActive ? 'default' : 'destructive'}>
                {userToEdit.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          
          <div>
            <Label>Current Role</Label>
            <Badge variant="outline" className="ml-2">
              {userToEdit.role.charAt(0).toUpperCase() + userToEdit.role.slice(1)}
            </Badge>
          </div>
          
          <div>
            <Label>MFA Status</Label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={userToEdit.mfaEnabled ? 'default' : 'secondary'}>
                {userToEdit.mfaEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              {userToEdit.mfaSetupRequired && (
                <Badge variant="destructive">Setup Required</Badge>
              )}
            </div>
          </div>
          
          {userToEdit.deactivatedAt && (
            <div>
              <Label>Deactivation Info</Label>
              <div className="text-sm text-gray-600 mt-1">
                <p>Deactivated: {new Date(userToEdit.deactivatedAt.toDate()).toLocaleDateString()}</p>
                {userToEdit.deactivationReason && (
                  <p>Reason: {userToEdit.deactivationReason}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Management */}
      {canEditRole && (
        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>
              Update the user's role and associated permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="role-select">Select Role</Label>
              <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="owner">Property Owner</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleRoleUpdate} 
              disabled={updating || selectedRole === userToEdit.role}
            >
              {updating ? 'Updating...' : 'Update Role'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Permission Management */}
      {canEditPermissions && (
        <Card>
          <CardHeader>
            <CardTitle>Permission Management</CardTitle>
            <CardDescription>
              Customize specific permissions for this user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(PERMISSIONS).map(([key, permission]) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={(checked) => 
                      handlePermissionToggle(permission, checked as boolean)
                    }
                  />
                  <Label htmlFor={permission} className="text-sm">
                    {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <Button 
              onClick={handlePermissionsUpdate} 
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Permissions'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current Permissions Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Permissions</CardTitle>
          <CardDescription>
            Permissions currently assigned to this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {userToEdit.permissions.map(permission => (
              <Badge key={permission} variant="outline">
                {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
          </div>
          {userToEdit.permissions.length === 0 && (
            <p className="text-gray-500 text-sm">No permissions assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Account Management */}
      {canManageUser && !isEditingSelf && (
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              Manage user account status and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userToEdit.isActive ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deactivation-reason">Deactivation Reason</Label>
                  <Textarea
                    id="deactivation-reason"
                    placeholder="Enter reason for deactivation..."
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={updating || !deactivationReason.trim()}>
                      {updating ? 'Deactivating...' : 'Deactivate Account'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deactivate User Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to deactivate this user account? The user will no longer be able to access the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeactivateUser}>
                        Deactivate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  This account is currently deactivated.
                </p>
                <Button onClick={handleReactivateUser} disabled={updating}>
                  {updating ? 'Reactivating...' : 'Reactivate Account'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Audit Logs */}
      {canManageUser && currentUser?.permissions.includes(PERMISSIONS.AUDIT_LOGS) && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              View user activity and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showAuditLogs ? (
              <Button onClick={loadAuditLogs} variant="outline">
                Load Audit Logs
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Recent Activity</h4>
                  <Button 
                    onClick={() => setShowAuditLogs(false)} 
                    variant="ghost" 
                    size="sm"
                  >
                    Hide
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log, index) => (
                      <div key={index} className="border rounded p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                            {log.details && (
                              <p className="text-gray-600 mt-1">
                                {JSON.stringify(log.details, null, 2)}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.createdAt && new Date(log.createdAt.toDate()).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No audit logs found</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}