import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyBNqa9Zd0z_oreQj9dBI-eE1YjgcY7WAH4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'icodetech-c2c1b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'icodetech-c2c1b',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:1065578643515:web:12ae8c97ae9d3672071c1e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-JP7JXZ8F8D',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let analytics: ReturnType<typeof getAnalytics> | null = null;

export const initAnalytics = async () => {
  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase Analytics not supported in this browser');
    return;
  }
  analytics = getAnalytics(app);
  console.log('🔥 Firebase Analytics initialized (web)');
};

export const logWebEvent = (name: string, params?: Record<string, any>) => {
  if (!analytics) {
    console.warn('⚠️ Analytics not ready, event skipped:', name);
    return;
  }

  logEvent(analytics, name, params);
  console.log('✅ Web event sent:', name, params.button_name ? `- ${params.button_name}` : '');
};
