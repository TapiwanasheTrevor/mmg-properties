'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Eye, EyeOff, MapPin, Phone, CreditCard, Info } from 'lucide-react';
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import { UserRole } from '@/lib/types';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'owner' as UserRole,
    phone: '',
    nationalId: '',
    address: '',
    city: 'Harare',
    country: 'Zimbabwe',
    acceptTerms: false,
    agreeToSMS: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Zimbabwe National ID validation
  const validateNationalId = (id: string): boolean => {
    // Zimbabwe National ID format: 12-345678-A-12
    const regex = /^\d{2}-\d{6}-[A-Z]-\d{2}$/;
    return regex.test(id);
  };

  // Zimbabwe phone number validation
  const validateZimbabwePhone = (phone: string): boolean => {
    // Formats: +263123456789, 0123456789, 263123456789
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    const regex = /^(\+263|263|0)[7-9]\d{8}$/;
    return regex.test(cleanPhone);
  };

  // Format phone number to standard format
  const formatPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    if (cleanPhone.startsWith('0')) {
      return `+263${cleanPhone.slice(1)}`;
    } else if (cleanPhone.startsWith('263')) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.startsWith('+263')) {
      return cleanPhone;
    }
    return phone;
  };

  // Zimbabwe cities for validation
  const zimbabweCities = [
    'Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Epworth', 'Gweru', 'Kwekwe', 
    'Kadoma', 'Masvingo', 'Chinhoyi', 'Norton', 'Marondera', 'Ruwa', 'Chegutu',
    'Zvishavane', 'Bindura', 'Beitbridge', 'Redcliff', 'Victoria Falls', 'Hwange'
  ];

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    // Validate phone number
    if (!formData.phone.trim()) {
      setError('Phone number is required for Zimbabwe users');
      return false;
    }
    
    if (!validateZimbabwePhone(formData.phone)) {
      setError('Please enter a valid Zimbabwe phone number (e.g., +263771234567 or 0771234567)');
      return false;
    }
    
    // Validate National ID for citizens
    if (formData.nationalId && !validateNationalId(formData.nationalId)) {
      setError('Please enter a valid Zimbabwe National ID (format: 12-345678-A-12)');
      return false;
    }
    
    // Address validation for property owners and agents
    if ((formData.role === 'owner' || formData.role === 'agent') && !formData.address.trim()) {
      setError('Address is required for property owners and agents');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!formData.acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      await signUpWithEmail(
        formData.email,
        formData.password,
        formData.role,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formatPhoneNumber(formData.phone),
          nationalId: formData.nationalId,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          agreeToSMS: formData.agreeToSMS,
          registrationDate: new Date().toISOString(),
          verificationStatus: 'pending',
        }
      );
      
      // Redirect based on role
      if (formData.role === 'admin') {
        router.push('/admin');
      } else if (formData.role === 'agent') {
        router.push('/agent');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join MMG Property Management Platform
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="owner">
                    <div>
                      <div className="font-medium">Property Owner</div>
                      <div className="text-xs text-gray-500">Own and manage rental properties</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="agent">
                    <div>
                      <div className="font-medium">Field Agent</div>
                      <div className="text-xs text-gray-500">Property inspections and maintenance</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="tenant">
                    <div>
                      <div className="font-medium">Tenant</div>
                      <div className="text-xs text-gray-500">Rent and manage your unit</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zimbabwe-specific fields */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Phone Number (Zimbabwe)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+263771234567 or 0771234567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Required for SMS notifications and property updates
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId" className="flex items-center gap-1">
                <CreditCard className="w-4 h-4" />
                Zimbabwe National ID (Optional)
              </Label>
              <Input
                id="nationalId"
                type="text"
                placeholder="12-345678-A-12"
                value={formData.nationalId}
                onChange={(e) => handleInputChange('nationalId', e.target.value)}
              />
              <p className="text-xs text-gray-500">
                For identity verification and faster property transactions
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {zimbabweCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  value={formData.country}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            </div>

            {(formData.role === 'owner' || formData.role === 'agent') && (
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Physical Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete physical address in Zimbabwe..."
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Required for property owners and agents for verification purposes
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Terms and SMS Agreement */}
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange('acceptTerms', checked)}
                  required
                />
                <div className="space-y-1">
                  <Label htmlFor="acceptTerms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I accept the Terms of Service and Privacy Policy
                  </Label>
                  <p className="text-xs text-gray-500">
                    By creating an account, you agree to our{' '}
                    <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToSMS"
                  checked={formData.agreeToSMS}
                  onCheckedChange={(checked) => handleInputChange('agreeToSMS', checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="agreeToSMS" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I agree to receive SMS notifications (Optional)
                  </Label>
                  <p className="text-xs text-gray-500">
                    Receive important updates about your properties, maintenance requests, and payments via SMS
                  </p>
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Password Requirements</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${
                    formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {formData.password.length >= 8 ? '✓' : '○'} 8+ characters
                  </div>
                  <div className={`flex items-center gap-1 ${
                    /[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '○'} Uppercase letter
                  </div>
                  <div className={`flex items-center gap-1 ${
                    /[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {/[a-z]/.test(formData.password) ? '✓' : '○'} Lowercase letter
                  </div>
                  <div className={`flex items-center gap-1 ${
                    /\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {/\d/.test(formData.password) ? '✓' : '○'} Number
                  </div>
                  <div className={`flex items-center gap-1 ${
                    /[@$!%*?&]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {/[@$!%*?&]/.test(formData.password) ? '✓' : '○'} Special character
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !formData.acceptTerms}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6">
            <Separator className="my-4" />
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}