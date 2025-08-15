'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Save, AlertCircle, Check, Loader2 } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';

export default function ProfileForm() {
  const { user, firebaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user || !firebaseUser) throw new Error('User not authenticated');
    
    const avatarRef = ref(storage, `avatars/${user.id}/${file.name}`);
    const snapshot = await uploadBytes(avatarRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firebaseUser) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let avatarUrl = user.profile?.avatar;

      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        'profile.firstName': formData.firstName,
        'profile.lastName': formData.lastName,
        'profile.avatar': avatarUrl,
        phone: formData.phone,
        updatedAt: serverTimestamp(),
      });

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: `${formData.firstName} ${formData.lastName}`,
        photoURL: avatarUrl,
      });

      setSuccess('Profile updated successfully!');
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Refresh the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'owner':
        return 'bg-blue-100 text-blue-800';
      case 'agent':
        return 'bg-green-100 text-green-800';
      case 'tenant':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'owner':
        return 'Property Owner';
      case 'agent':
        return 'Agent';
      case 'tenant':
        return 'Tenant';
      default:
        return role;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Profile Settings</CardTitle>
          <CardDescription>
            Manage your account information and preferences
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6">
              <Check className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={avatarPreview || user.profile?.avatar} 
                    alt="Profile picture" 
                  />
                  <AvatarFallback className="text-xl">
                    {user.profile?.firstName?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                    {user.profile?.lastName?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium">
                  {user.profile?.firstName || 'No name'} {user.profile?.lastName || ''}
                </h3>
                <p className="text-gray-600">{user.email}</p>
                <Badge className={`mt-2 ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
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
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Email cannot be changed from this page
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+263 77 123 4567"
                />
              </div>
            </div>

            <Separator />

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Permissions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}