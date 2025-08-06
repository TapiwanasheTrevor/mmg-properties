'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signInWithGoogle, handleMFASignIn, validatePasswordComplexity } from '@/lib/auth';
import { MultiFactorError } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
  mfaCode?: string;
}

export default function EnhancedLoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    mfaCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaError, setMfaError] = useState<MultiFactorError | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    errors: string[];
  } | null>(null);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);

    // Validate password strength on input
    if (field === 'password' && value) {
      const strength = validatePasswordComplexity(value);
      setPasswordStrength({
        score: strength.score,
        errors: strength.errors,
      });
    } else if (field === 'password' && !value) {
      setPasswordStrength(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmail(formData.email, formData.password);
      
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if this is an MFA error
      if (error.code === 'auth/multi-factor-auth-required') {
        setMfaError(error);
        setMfaRequired(true);
        setError('Multi-factor authentication required. Please enter your verification code.');
      } else {
        // Handle other authentication errors
        let errorMessage = 'Login failed. Please try again.';
        
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address format.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed login attempts. Please try again later.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
        
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMFALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mfaCode || !mfaError) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await handleMFASignIn(mfaError, formData.mfaCode);
      
      toast({
        title: 'Success',
        description: 'Logged in successfully with MFA',
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('MFA login error:', error);
      
      let errorMessage = 'Invalid verification code. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'Invalid verification code. Please check and try again.';
          break;
        case 'auth/code-expired':
          errorMessage = 'Verification code has expired. Please request a new one.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      
      toast({
        title: 'Success',
        description: 'Logged in successfully with Google',
      });
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google login error:', error);
      
      let errorMessage = 'Google login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Login cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup blocked. Please allow popups and try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email using a different login method.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetMFA = () => {
    setMfaRequired(false);
    setMfaError(null);
    setFormData(prev => ({ ...prev, mfaCode: '' }));
    setError(null);
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {mfaRequired ? 'Enter Verification Code' : 'Sign In'}
          </CardTitle>
          <CardDescription>
            {mfaRequired 
              ? 'Enter the verification code sent to your phone'
              : 'Access your MMG Property Management account'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {mfaRequired ? (
            // MFA Form
            <form onSubmit={handleMFALogin} className="space-y-4">
              <div>
                <Label htmlFor="mfa-code">Verification Code</Label>
                <Input
                  id="mfa-code"
                  type="text"
                  placeholder="123456"
                  value={formData.mfaCode}
                  onChange={(e) => handleInputChange('mfaCode', e.target.value)}
                  maxLength={6}
                  className="mt-1"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 6-digit code from your authenticator app or SMS
                </p>
              </div>
              
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading || !formData.mfaCode}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </Button>
                
                <Button type="button" variant="outline" className="w-full" onClick={resetMFA}>
                  Back to Login
                </Button>
              </div>
            </form>
          ) : (
            // Regular Login Form
            <>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1"
                    disabled={loading}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pr-10"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {passwordStrength && formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {getPasswordStrengthText(passwordStrength.score)}
                        </span>
                      </div>
                      {passwordStrength.errors.length > 0 && (
                        <div className="mt-1">
                          {passwordStrength.errors.map((error, index) => (
                            <p key={index} className="text-xs text-red-600">
                              • {error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>
              
              <div className="text-center text-sm">
                <a
                  href="/auth/forgot-password"
                  className="text-primary hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              
              <div className="text-center text-sm">
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="text-primary hover:underline font-medium"
                >
                  Sign up
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}