import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function AccountDisabledPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Account Disabled</CardTitle>
          <CardDescription>
            Your account has been temporarily disabled
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your account is currently inactive. Please contact your administrator 
            to reactivate your account and restore access to the platform.
          </p>
          
          <div className="space-y-2">
            <Button variant="outline" asChild className="w-full">
              <Link href="/login">Sign In as Different User</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}