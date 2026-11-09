import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const envKey = import.meta.env.VITE_FIREBASE_API_KEY || '';

export const isFirebaseConfigured = Boolean(
  envKey &&
  envKey.length > 20 &&
  !envKey.includes('mock') &&
  !envKey.includes('DevEvaluation') &&
  !envKey.includes('Dummy') &&
  !envKey.includes('ReplaceWith')
);

// Firebase configuration loaded from environment or fallback default project
const firebaseConfig = {
  apiKey: envKey || "AIzaSyD-mock-firebase-key-koodi",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "koodi-maatadona.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "koodi-maatadona",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "koodi-maatadona.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "109876543210",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:109876543210:web:abcdef1234567890",
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

// Initialize Storage
export const storage = getStorage(app);
