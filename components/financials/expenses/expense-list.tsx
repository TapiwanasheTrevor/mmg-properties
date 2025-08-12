'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ExpenseList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Expense
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No expenses found.</p>
        </CardContent>
      </Card>
    </div>
  );
}