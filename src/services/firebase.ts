import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

// Placeholder values keep the app bootable (login page shows a setup error) when .env is missing.
const app = initializeApp(
  isFirebaseConfigured ? config : { apiKey: 'unconfigured', authDomain: 'localhost', projectId: 'unconfigured', appId: 'unconfigured' },
);

export const auth = getAuth(app);
