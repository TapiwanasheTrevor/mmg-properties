import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    maintenanceUpdates: boolean;
    paymentReminders: boolean;
    systemAlerts: boolean;
  };
  privacy: {
    shareData: boolean;
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordChangeRequired: boolean;
  };
}

// Default settings for new users
export const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    sms: true,
    push: true,
    maintenanceUpdates: true,
    paymentReminders: true,
    systemAlerts: true,
  },
  privacy: {
    shareData: false,
    showOnlineStatus: true,
    allowDirectMessages: true,
  },
  preferences: {
    theme: 'system',
    language: 'en',
    timezone: 'Africa/Harare',
    dateFormat: 'DD/MM/YYYY',
    currency: 'USD',
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordChangeRequired: false,
  },
};

// Get user settings from Firestore
export const getUserSettings = async (userId: string): Promise<UserSettings> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      if (userData.settings) {
        // Merge with defaults to ensure all properties exist
        return {
          notifications: {
            ...defaultSettings.notifications,
            ...userData.settings.notifications,
          },
          privacy: {
            ...defaultSettings.privacy,
            ...userData.settings.privacy,
          },
          preferences: {
            ...defaultSettings.preferences,
            ...userData.settings.preferences,
          },
          security: {
            ...defaultSettings.security,
            ...userData.settings.security,
          },
        };
      }
    }
    
    // Return defaults if no settings found
    return defaultSettings;
  } catch (error) {
    console.error('Error getting user settings:', error);
    throw error;
  }
};

// Save user settings to Firestore
export const saveUserSettings = async (
  userId: string,
  settings: UserSettings
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      settings: settings,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

// Update specific notification setting
export const updateNotificationSetting = async (
  userId: string,
  setting: keyof UserSettings['notifications'],
  value: boolean
): Promise<void> => {
  try {
    const currentSettings = await getUserSettings(userId);
    const updatedSettings = {
      ...currentSettings,
      notifications: {
        ...currentSettings.notifications,
        [setting]: value,
      },
    };
    
    await saveUserSettings(userId, updatedSettings);
  } catch (error) {
    console.error('Error updating notification setting:', error);
    throw error;
  }
};

// Update specific privacy setting
export const updatePrivacySetting = async (
  userId: string,
  setting: keyof UserSettings['privacy'],
  value: boolean
): Promise<void> => {
  try {
    const currentSettings = await getUserSettings(userId);
    const updatedSettings = {
      ...currentSettings,
      privacy: {
        ...currentSettings.privacy,
        [setting]: value,
      },
    };
    
    await saveUserSettings(userId, updatedSettings);
  } catch (error) {
    console.error('Error updating privacy setting:', error);
    throw error;
  }
};

// Update specific preference setting
export const updatePreferenceSetting = async (
  userId: string,
  setting: keyof UserSettings['preferences'],
  value: string
): Promise<void> => {
  try {
    const currentSettings = await getUserSettings(userId);
    const updatedSettings = {
      ...currentSettings,
      preferences: {
        ...currentSettings.preferences,
        [setting]: value,
      },
    };
    
    await saveUserSettings(userId, updatedSettings);
  } catch (error) {
    console.error('Error updating preference setting:', error);
    throw error;
  }
};

// Update specific security setting
export const updateSecuritySetting = async (
  userId: string,
  setting: keyof UserSettings['security'],
  value: boolean | number
): Promise<void> => {
  try {
    const currentSettings = await getUserSettings(userId);
    const updatedSettings = {
      ...currentSettings,
      security: {
        ...currentSettings.security,
        [setting]: value,
      },
    };
    
    await saveUserSettings(userId, updatedSettings);
  } catch (error) {
    console.error('Error updating security setting:', error);
    throw error;
  }
};

// Initialize default settings for a new user
export const initializeUserSettings = async (userId: string): Promise<void> => {
  try {
    await saveUserSettings(userId, defaultSettings);
  } catch (error) {
    console.error('Error initializing user settings:', error);
    throw error;
  }
};

// Check if user has specific notification enabled
export const hasNotificationEnabled = (
  settings: UserSettings,
  notificationType: keyof UserSettings['notifications']
): boolean => {
  return settings.notifications[notificationType];
};

// Get user's preferred theme
export const getUserTheme = (settings: UserSettings): 'light' | 'dark' | 'system' => {
  return settings.preferences.theme;
};

// Get user's timezone
export const getUserTimezone = (settings: UserSettings): string => {
  return settings.preferences.timezone;
};

// Check if user has two-factor authentication enabled
export const hasTwoFactorEnabled = (settings: UserSettings): boolean => {
  return settings.security.twoFactorEnabled;
};

// Get user's session timeout in minutes
export const getSessionTimeout = (settings: UserSettings): number => {
  return settings.security.sessionTimeout;
};