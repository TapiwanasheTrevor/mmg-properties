'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Shield, 
  Smartphone, 
  Mail, 
  Globe, 
  Palette,
  Database,
  UserCheck,
  Lock,
  Activity,
  Save,
  AlertCircle,
  Check
} from 'lucide-react';
import { 
  getUserSettings, 
  saveUserSettings, 
  defaultSettings,
  type UserSettings 
} from '@/lib/services/settings';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load user settings from Firebase
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!user || authLoading) return;

      setInitialLoading(true);
      setError('');

      try {
        const userSettings = await getUserSettings(user.id);
        setSettings(userSettings);
      } catch (error: any) {
        console.error('Error loading user settings:', error);
        setError('Failed to load settings. Using defaults.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserSettings();
  }, [user, authLoading]);

  const handleSaveSettings = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await saveUserSettings(user.id, settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacySetting = (key: keyof UserSettings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const updatePreferenceSetting = (key: keyof UserSettings['preferences'], value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  const updateSecuritySetting = (key: keyof UserSettings['security'], value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value,
      },
    }));
  };

  if (authLoading || initialLoading) {
    return (
      <AppLayout title="Settings">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <AppLayout title="Settings">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Settings className="mr-3 h-8 w-8" />
              Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your account settings and preferences
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center">
              <UserCheck className="w-4 h-4 mr-1" />
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Delivery Methods</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                      </div>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Smartphone className="w-4 h-4 mr-2 text-gray-500" />
                        <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      </div>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) => updateNotificationSetting('sms', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-gray-500" />
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                      </div>
                      <p className="text-sm text-gray-500">Receive browser push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Types</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance-updates">Maintenance Updates</Label>
                      <p className="text-sm text-gray-500">Work order and maintenance notifications</p>
                    </div>
                    <Switch
                      id="maintenance-updates"
                      checked={settings.notifications.maintenanceUpdates}
                      onCheckedChange={(checked) => updateNotificationSetting('maintenanceUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="payment-reminders">Payment Reminders</Label>
                      <p className="text-sm text-gray-500">Rent and payment due notifications</p>
                    </div>
                    <Switch
                      id="payment-reminders"
                      checked={settings.notifications.paymentReminders}
                      onCheckedChange={(checked) => updateNotificationSetting('paymentReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="system-alerts">System Alerts</Label>
                      <p className="text-sm text-gray-500">Important system and security alerts</p>
                    </div>
                    <Switch
                      id="system-alerts"
                      checked={settings.notifications.systemAlerts}
                      onCheckedChange={(checked) => updateNotificationSetting('systemAlerts', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="share-data">Share Anonymous Usage Data</Label>
                    <p className="text-sm text-gray-500">Help improve our services by sharing anonymous usage data</p>
                  </div>
                  <Switch
                    id="share-data"
                    checked={settings.privacy.shareData}
                    onCheckedChange={(checked) => updatePrivacySetting('shareData', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="online-status">Show Online Status</Label>
                    <p className="text-sm text-gray-500">Let others see when you're online</p>
                  </div>
                  <Switch
                    id="online-status"
                    checked={settings.privacy.showOnlineStatus}
                    onCheckedChange={(checked) => updatePrivacySetting('showOnlineStatus', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="direct-messages">Allow Direct Messages</Label>
                    <p className="text-sm text-gray-500">Allow other users to send you direct messages</p>
                  </div>
                  <Switch
                    id="direct-messages"
                    checked={settings.privacy.allowDirectMessages}
                    onCheckedChange={(checked) => updatePrivacySetting('allowDirectMessages', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Display & Regional Preferences
                </CardTitle>
                <CardDescription>
                  Customize your display and regional settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={settings.preferences.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => updatePreferenceSetting('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.preferences.language}
                      onValueChange={(value) => updatePreferenceSetting('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.preferences.timezone}
                      onValueChange={(value) => updatePreferenceSetting('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Harare">Africa/Harare (UTC+2)</SelectItem>
                        <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select
                      value={settings.preferences.dateFormat}
                      onValueChange={(value) => updatePreferenceSetting('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.preferences.currency}
                      onValueChange={(value) => updatePreferenceSetting('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="ZWL">ZWL (Z$)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) => updateSecuritySetting('twoFactorEnabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Select
                    value={settings.security.sessionTimeout.toString()}
                    onValueChange={(value) => updateSecuritySetting('sessionTimeout', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="password-change">Require Password Change</Label>
                    <p className="text-sm text-gray-500">Force password change on next login</p>
                  </div>
                  <Switch
                    id="password-change"
                    checked={settings.security.passwordChangeRequired}
                    onCheckedChange={(checked) => updateSecuritySetting('passwordChangeRequired', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Actions</h3>
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => router.push('/profile')}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? (
              <>
                <Database className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}