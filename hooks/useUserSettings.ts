import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  getUserSettings, 
  saveUserSettings, 
  defaultSettings,
  type UserSettings 
} from '@/lib/services/settings';

interface UseUserSettingsReturn {
  settings: UserSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  updateNotificationSetting: (key: keyof UserSettings['notifications'], value: boolean) => Promise<void>;
  updatePrivacySetting: (key: keyof UserSettings['privacy'], value: boolean) => Promise<void>;
  updatePreferenceSetting: (key: keyof UserSettings['preferences'], value: string) => Promise<void>;
  updateSecuritySetting: (key: keyof UserSettings['security'], value: boolean | number) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useUserSettings = (): UseUserSettingsReturn => {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    if (!user || authLoading) return;

    setLoading(true);
    setError(null);

    try {
      const userSettings = await getUserSettings(user.id);
      setSettings(userSettings);
    } catch (err: any) {
      console.error('Error loading user settings:', err);
      setError(err.message || 'Failed to load settings');
      // Keep using defaults on error
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    if (!user) return;

    try {
      await saveUserSettings(user.id, newSettings);
      setSettings(newSettings);
    } catch (err: any) {
      console.error('Error saving user settings:', err);
      setError(err.message || 'Failed to save settings');
      throw err;
    }
  };

  // Initial load
  useEffect(() => {
    loadSettings();
  }, [user, authLoading]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = {
      ...settings,
      ...newSettings,
      // Merge nested objects properly
      notifications: {
        ...settings.notifications,
        ...newSettings.notifications,
      },
      privacy: {
        ...settings.privacy,
        ...newSettings.privacy,
      },
      preferences: {
        ...settings.preferences,
        ...newSettings.preferences,
      },
      security: {
        ...settings.security,
        ...newSettings.security,
      },
    };

    await saveSettings(updatedSettings);
  };

  const updateNotificationSetting = async (
    key: keyof UserSettings['notifications'], 
    value: boolean
  ) => {
    await updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const updatePrivacySetting = async (
    key: keyof UserSettings['privacy'], 
    value: boolean
  ) => {
    await updateSettings({
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    });
  };

  const updatePreferenceSetting = async (
    key: keyof UserSettings['preferences'], 
    value: string
  ) => {
    await updateSettings({
      preferences: {
        ...settings.preferences,
        [key]: value,
      },
    });
  };

  const updateSecuritySetting = async (
    key: keyof UserSettings['security'], 
    value: boolean | number
  ) => {
    await updateSettings({
      security: {
        ...settings.security,
        [key]: value,
      },
    });
  };

  const refresh = async () => {
    await loadSettings();
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    updateNotificationSetting,
    updatePrivacySetting,
    updatePreferenceSetting,
    updateSecuritySetting,
    refresh,
  };
};