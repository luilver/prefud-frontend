import { Capacitor } from '@capacitor/core';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { logWebEvent } from '../firebase';

export const trackEvent = async (
  name: string,
  params?: Record<string, any>,
) => {
  if (Capacitor.isNativePlatform()) {
    await FirebaseAnalytics.logEvent({ name, params });
    console.log('✅ Native event sent:', name);
  } else {
    console.log('it works', name);
    logWebEvent(name, params);
  }
};
