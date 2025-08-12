'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransactionDetailsProps {
  transactionId: string;
}

export default function TransactionDetails({ transactionId }: TransactionDetailsProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transaction Details</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction {transactionId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Transaction details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}