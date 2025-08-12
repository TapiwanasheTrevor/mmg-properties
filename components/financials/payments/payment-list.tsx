'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function PaymentList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Link href="/financials/payments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Payment
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No payments found.</p>
        </CardContent>
      </Card>
    </div>
  );
}