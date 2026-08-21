import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const SECURE_KEYS = ['authToken', 'refreshToken'];

export const storageService = {
  setItem: async (key: string, value: string): Promise<void> => {
    if (Capacitor.isNativePlatform() && SECURE_KEYS.includes(key)) {
      await SecureStoragePlugin.set({ key, value });
    } else if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  },
  
  getItem: async (key: string): Promise<string | null> => {
    if (Capacitor.isNativePlatform() && SECURE_KEYS.includes(key)) {
      try {
        const { value } = await SecureStoragePlugin.get({ key });
        return value;
      } catch (error) {
        // SecureStorage throws if key not found
        return null;
      }
    } else if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key });
      return value;
    } else {
      return localStorage.getItem(key);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    if (Capacitor.isNativePlatform() && SECURE_KEYS.includes(key)) {
      try {
        await SecureStoragePlugin.remove({ key });
      } catch (error) {
        console.error('Error removing secure storage item', error);
      }
    } else if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  },
  
  clear: async (): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      try {
        await SecureStoragePlugin.clear();
      } catch (error) {
        console.error('Error clearing secure storage', error);
      }
      await Preferences.clear();
    }
    localStorage.clear();
  }
};
