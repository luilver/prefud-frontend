import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD8yOIxvefigdgf9i8YMUUCEn-s1xTpJRY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "prefud.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "prefud",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "prefud.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "507413119491",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:507413119491:web:229e4d0d982c0d4c1ac436",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-C11WFRT11K"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

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
