'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentDetailsProps {
  paymentId: string;
}

export default function PaymentDetails({ paymentId }: PaymentDetailsProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payment Details</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment {paymentId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Payment details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}