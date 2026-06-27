import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// Same Firebase project as the main site and map-trainer
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         ||
                       (typeof window !== 'undefined' && window.location.hostname === 'localhost'
                         ? 'dispatch4you-80e0f.firebaseapp.com'
                         : 'dispatch4you.com'),
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'dispatch4you-80e0f',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'dispatch4you-80e0f.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '349235354473',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:349235354473:web:488aeb29211b02bb153bf8',
};

let app: FirebaseApp;
let auth: Auth;

try {
  app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn('[Firebase] Init failed:', e);
  app = {} as FirebaseApp;
  auth = {} as Auth;
}

/**
 * Lazily loads Firestore. The firestore SDK is heavy and only needed for the
 * cross-device sync / leaderboard of signed-in users, so it is split into its
 * own chunk and initialised on first use rather than at app startup.
 */
let dbPromise: Promise<Firestore> | null = null;
export function getDb(): Promise<Firestore> {
  if (!dbPromise) {
    dbPromise = import('firebase/firestore').then(({ getFirestore }) => getFirestore(app));
  }
  return dbPromise;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { auth };
export default app;
