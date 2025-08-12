'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BulkTransactionOperations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Operations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export Selected
          </Button>
          <Button variant="outline" size="sm">
            Mark as Reconciled
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}