'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import ExpenseCategories from '@/components/financials/expenses/expense-categories';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExpenseCategory } from '@/lib/types/financials';
import { getExpenseCategories, createDefaultExpenseCategories } from '@/lib/services/financials';

export default function ExpenseCategoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Only admins can manage categories
  const canManageCategories = user?.role === 'admin';

  useEffect(() => {
    if (!authLoading && user) {
      if (!canManageCategories) {
        setError('You do not have permission to manage expense categories');
        return;
      }
      loadCategories();
    }
  }, [authLoading, user, canManageCategories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');

      const categoryData = await getExpenseCategories(true); // Include inactive
      setCategories(categoryData);

      // If no categories exist, offer to create defaults
      if (categoryData.length === 0) {
        setSuccess('No expense categories found. You can create default categories for Zimbabwe or add custom ones.');
      }

    } catch (error: any) {
      console.error('Error loading categories:', error);
      setError(error.message || 'Failed to load expense categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefaults = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await createDefaultExpenseCategories();
      await loadCategories();
      
      setSuccess('Default expense categories created successfully!');
    } catch (error: any) {
      console.error('Error creating default categories:', error);
      setError(error.message || 'Failed to create default categories');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Expense Categories">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expense categories...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!canManageCategories) {
    return (
      <AppLayout title="Expense Categories">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to manage expense categories. This action is restricted to 
              administrators only.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Expense Categories"
      requiredRoles={['admin']}
      headerActions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Expenses
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Quick Setup */}
        {categories.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Setup</CardTitle>
              <CardDescription>
                Get started quickly with pre-configured expense categories for Zimbabwe property management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Create Default Categories</h3>
                  <p className="text-sm text-gray-600">
                    Includes maintenance, utilities, insurance, and other common property expenses
                    with Zimbabwe tax rates and classifications
                  </p>
                </div>
                <Button onClick={handleCreateDefaults} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Defaults'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories Management */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>
              Manage expense categories with tax settings and classifications for Zimbabwe compliance
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ExpenseCategories
              categories={categories}
              loading={loading}
              showCreateForm={showCreateForm}
              onCreateFormToggle={setShowCreateForm}
              onRefresh={loadCategories}
            />
          </CardContent>
        </Card>

        {/* Category Statistics */}
        {categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
                <p className="text-sm text-gray-600">Total Categories</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {categories.filter(c => c.isActive).length}
                </div>
                <p className="text-sm text-gray-600">Active</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {categories.filter(c => c.vatApplicable).length}
                </div>
                <p className="text-sm text-gray-600">VAT Applicable</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {categories.filter(c => c.isTaxDeductible).length}
                </div>
                <p className="text-sm text-gray-600">Tax Deductible</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}