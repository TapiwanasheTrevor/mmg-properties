'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExpenseCategories() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Expense Categories</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Expense categories management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}