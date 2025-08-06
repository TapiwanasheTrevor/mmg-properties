'use client';

import { useState } from 'react';
import { useAuth, usePermissions } from '@/hooks/useAuth';
import { 
  validateUserSession, 
  validatePasswordComplexity, 
  getUserAuditLogs,
  updateUserRole,
  updateUserPermissions,
  deactivateUser,
  reactivateUser,
  PERMISSIONS 
} from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

export default function AuthTestSuite() {
  const { user, firebaseUser, loading, error, mfaRequired, permissionsLoaded } = useAuth();
  const permissions = usePermissions();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testPassword, setTestPassword] = useState('');
  const [testUserId, setTestUserId] = useState('');
  const [running, setRunning] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setRunning(true);
    try {
      const result = await testFn();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, result, error: null }
      }));
      toast({
        title: 'Test Passed',
        description: `${testName} completed successfully`,
      });
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, result: null, error: error.message }
      }));
      toast({
        title: 'Test Failed',
        description: `${testName} failed: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setRunning(false);
    }
  };

  const testSessionValidation = async () => {
    return await validateUserSession();
  };

  const testPasswordValidation = async () => {
    if (!testPassword) throw new Error('Please enter a password to test');
    return validatePasswordComplexity(testPassword);
  };

  const testPermissionChecks = async () => {
    return {
      canManageUsers: permissions.canManageUsers(),
      canManageProperties: permissions.canManageProperties(),
      canViewFinancials: permissions.canViewFinancials(),
      canGenerateReports: permissions.canGenerateReports(),
      isAdmin: permissions.isAdmin(),
      isOwner: permissions.isOwner(),
      isAgent: permissions.isAgent(),
      isTenant: permissions.isTenant(),
    };
  };

  const testAuditLogs = async () => {
    if (!user) throw new Error('No authenticated user');
    return await getUserAuditLogs(user.id, 10);
  };

  const testRoleUpdate = async () => {
    if (!testUserId) throw new Error('Please enter a user ID to test');
    if (!permissions.canManageUsers()) throw new Error('Insufficient permissions');
    
    // This is a test - we won't actually change the role
    throw new Error('Test mode - role update not executed');
  };

  const testPermissionUpdate = async () => {
    if (!testUserId) throw new Error('Please enter a user ID to test');
    if (!permissions.canManageUsers()) throw new Error('Insufficient permissions');
    
    // This is a test - we won't actually change permissions
    throw new Error('Test mode - permission update not executed');
  };

  const runAllTests = async () => {
    const tests = [
      { name: 'Session Validation', fn: testSessionValidation },
      { name: 'Permission Checks', fn: testPermissionChecks },
    ];

    if (testPassword) {
      tests.push({ name: 'Password Validation', fn: testPasswordValidation });
    }

    if (permissions.canViewAuditLogs()) {
      tests.push({ name: 'Audit Logs', fn: testAuditLogs });
    }

    for (const test of tests) {
      await runTest(test.name, test.fn);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Please log in to run authentication tests</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test Suite</CardTitle>
          <CardDescription>
            Test and verify authentication system functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <strong>User:</strong> {user.profile.firstName} {user.profile.lastName}
            </div>
            <div>
              <strong>Role:</strong> <Badge>{user.role}</Badge>
            </div>
            <div>
              <strong>MFA:</strong> <Badge variant={user.mfaEnabled ? 'default' : 'secondary'}>
                {user.mfaEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div>
              <strong>Status:</strong> <Badge variant={user.isActive ? 'default' : 'destructive'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          
          {mfaRequired && (
            <Alert className="mb-4">
              <AlertDescription>MFA setup is required for your account</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-password">Test Password</Label>
            <Input
              id="test-password"
              type="password"
              placeholder="Enter password to test validation"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="test-user-id">Test User ID</Label>
            <Input
              id="test-user-id"
              type="text"
              placeholder="Enter user ID for management tests"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={runAllTests} disabled={running}>
              {running ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setTestResults({})}
              disabled={running}
            >
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Session Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              onClick={() => runTest('Session Validation', testSessionValidation)}
              disabled={running}
            >
              Test Session
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Password Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              onClick={() => runTest('Password Validation', testPasswordValidation)}
              disabled={running || !testPassword}
            >
              Test Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Permission Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              onClick={() => runTest('Permission Checks', testPermissionChecks)}
              disabled={running}
            >
              Test Permissions
            </Button>
          </CardContent>
        </Card>

        {permissions.canViewAuditLogs() && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                size="sm" 
                onClick={() => runTest('Audit Logs', testAuditLogs)}
                disabled={running}
              >
                Test Audit Logs
              </Button>
            </CardContent>
          </Card>
        )}

        {permissions.canManageUsers() && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Role Update</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  size="sm" 
                  onClick={() => runTest('Role Update', testRoleUpdate)}
                  disabled={running || !testUserId}
                >
                  Test Role Update
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Permission Update</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  size="sm" 
                  onClick={() => runTest('Permission Update', testPermissionUpdate)}
                  disabled={running || !testUserId}
                >
                  Test Permission Update
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{testName}</h4>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                  
                  {result.error && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {result.result && (
                    <div className="bg-gray-50 rounded p-3">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Permissions Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current User Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(PERMISSIONS).map(([key, permission]) => (
              <div key={permission} className="flex items-center space-x-2">
                <Badge 
                  variant={user.permissions.includes(permission) ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {key.replace(/_/g, ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}