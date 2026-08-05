import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

const activeConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || appletConfig.measurementId,
};

if (typeof window !== 'undefined') {
  console.log("Firebase configuration loaded:", {
    projectId: activeConfig.projectId,
    authDomain: activeConfig.authDomain,
    hostname: window.location.hostname,
  });
}

const app = getApps().length === 0 ? initializeApp(activeConfig) : getApps()[0];

export const auth = getAuth(app);

const isAppletProject = activeConfig.projectId === appletConfig.projectId;
export const db = getFirestore(
  app,
  isAppletProject ? (appletConfig.firestoreDatabaseId || undefined) : undefined
);



