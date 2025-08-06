'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { 
  enableMFA, 
  completeMFAEnrollment, 
  disableMFA, 
  setupPhoneAuth,
  isMFARequiredForRole 
} from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';

export default function MFASetup() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Initialize reCAPTCHA
    const verifier = setupPhoneAuth('recaptcha-container');
    setRecaptchaVerifier(verifier);

    return () => {
      if (verifier) {
        verifier.clear();
      }
    };
  }, []);

  const handleSendCode = async () => {
    if (!phoneNumber || !recaptchaVerifier || !user) {
      toast({
        title: 'Error',
        description: 'Please enter a valid phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const verificationId = await enableMFA(phoneNumber, recaptchaVerifier);
      setVerificationId(verificationId);
      setStep('verify');
      toast({
        title: 'Code Sent',
        description: 'Verification code sent to your phone',
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast({
        title: 'Error',
        description: 'Failed to send verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !verificationId) {
      toast({
        title: 'Error',
        description: 'Please enter the verification code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await completeMFAEnrollment(verificationId, verificationCode);
      setStep('complete');
      toast({
        title: 'Success',
        description: 'Multi-factor authentication enabled successfully',
      });
    } catch (error) {
      console.error('Error verifying code:', error);
      toast({
        title: 'Error',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!user) return;

    // Check if MFA is required for user's role
    if (isMFARequiredForRole(user.role)) {
      toast({
        title: 'Cannot Disable MFA',
        description: 'Multi-factor authentication is required for your role',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await disableMFA();
      toast({
        title: 'Success',
        description: 'Multi-factor authentication disabled',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast({
        title: 'Error',
        description: 'Failed to disable MFA. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    // Clear the MFA setup requirement flag
    if (user) {
      try {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          mfaSetupRequired: false,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error clearing MFA setup requirement:', error);
      }
    }
    router.push('/dashboard');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isRequired = isMFARequiredForRole(user.role);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Multi-Factor Authentication
          </h1>
          <p className="text-gray-600 mt-2">
            {isRequired 
              ? 'MFA is required for your role to enhance security'
              : 'Add an extra layer of security to your account'
            }
          </p>
        </div>

        {/* Current MFA Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              MFA Status
              <Badge variant={user.mfaEnabled ? 'default' : 'secondary'}>
                {user.mfaEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.mfaEnabled ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Multi-factor authentication is currently enabled for your account.
                </p>
                {!isRequired && (
                  <Button 
                    variant="destructive" 
                    onClick={handleDisableMFA}
                    disabled={loading}
                  >
                    {loading ? 'Disabling...' : 'Disable MFA'}
                  </Button>
                )}
                {isRequired && (
                  <Alert>
                    <AlertDescription>
                      MFA cannot be disabled as it is required for your role.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {step === 'setup' && (
                  <>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Include country code (e.g., +1 for US)
                      </p>
                    </div>
                    
                    <div id="recaptcha-container"></div>
                    
                    <Button 
                      onClick={handleSendCode} 
                      disabled={loading || !phoneNumber}
                      className="w-full"
                    >
                      {loading ? 'Sending...' : 'Send Verification Code'}
                    </Button>
                  </>
                )}

                {step === 'verify' && (
                  <>
                    <div>
                      <Label htmlFor="code">Verification Code</Label>
                      <Input
                        id="code"
                        type="text"
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="mt-1"
                        maxLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the 6-digit code sent to {phoneNumber}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        onClick={handleVerifyCode} 
                        disabled={loading || !verificationCode}
                        className="w-full"
                      >
                        {loading ? 'Verifying...' : 'Verify Code'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setStep('setup')}
                        className="w-full"
                      >
                        Back
                      </Button>
                    </div>
                  </>
                )}

                {step === 'complete' && (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        MFA Setup Complete!
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Your account is now protected with multi-factor authentication.
                      </p>
                    </div>
                    
                    <Button onClick={handleComplete} className="w-full">
                      Continue to Dashboard
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>About Multi-Factor Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Adds an extra layer of security to your account</p>
              <p>• Required for admin and property owner roles</p>
              <p>• Uses your phone to verify login attempts</p>
              <p>• Can be disabled if not required for your role</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}