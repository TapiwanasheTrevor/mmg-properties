'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppLayout from '@/components/layout/app-layout';
import DatabaseSeeder from '@/components/admin/database-seeder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

export default function SeedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user && user.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <AppLayout title="Database Seeding">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <AppLayout title="Access Denied">
        <div className="p-6">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page. Admin access required.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Database Seeding" requiredRoles={['admin']}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Database Seeding</h1>
            <p className="text-gray-600 mt-2">
              Populate your development database with comprehensive test data
            </p>
          </div>

          {process.env.NODE_ENV === 'production' && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                ⚠️ Database seeding is not available in production environment for security reasons.
              </AlertDescription>
            </Alert>
          )}

          {process.env.NODE_ENV !== 'production' && (
            <DatabaseSeeder />
          )}
        </div>
      </div>
    </AppLayout>
  );
}