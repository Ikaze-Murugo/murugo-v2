// Expo injects EXPO_PUBLIC_* at build time; fallback for dev/local
const getEnv = (key: string, fallback: string) => {
  const val = (process.env as Record<string, string>)[key] ?? fallback;
  return val;
};

export const API_BASE_URL =
  getEnv('EXPO_PUBLIC_API_URL', getEnv('API_URL', 'https://api.murugohomes.com/api/v1'));
export const SOCKET_URL =
  getEnv('EXPO_PUBLIC_SOCKET_URL', getEnv('SOCKET_URL', 'https://api.murugohomes.com'));
/** Web app URL for opening lister profile / property pages in browser */
export const WEB_APP_URL =
  getEnv('EXPO_PUBLIC_WEB_APP_URL', getEnv('WEB_APP_URL', 'https://murugohomes.com'));
export const GOOGLE_MAPS_API_KEY = getEnv('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY', getEnv('GOOGLE_MAPS_API_KEY', ''));
export const APP_ENV = getEnv('APP_ENV', 'development');

export const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
