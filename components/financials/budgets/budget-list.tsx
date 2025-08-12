'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function BudgetList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Link href="/financials/budgets/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Budget
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No budgets found. Create your first budget to get started.</p>
        </CardContent>
      </Card>
    </div>
  );
}