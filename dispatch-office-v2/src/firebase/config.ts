// ═══════════════════════════════════════════════════════
//  Firebase Config — same project as main site & map-trainer
//  dispatch4you-80e0f
// ═══════════════════════════════════════════════════════
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI',
  // localhost → стандартный Firebase домен; production → наш домен
  authDomain:
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'dispatch4you-80e0f.firebaseapp.com'
      : 'dispatch4you.com',
  projectId: 'dispatch4you-80e0f',
  storageBucket: 'dispatch4you-80e0f.appspot.com',
  messagingSenderId: '349235354473',
  appId: '1:349235354473:web:488aeb29211b02bb153bf8',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
