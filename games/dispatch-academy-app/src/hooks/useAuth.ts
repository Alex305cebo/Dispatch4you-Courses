import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const LS_USER_KEY  = 'da_user';   // dispatch academy user cache
const LS_TOKEN_KEY = 'da_token';
const REDIRECT_KEY = 'da_pending_redirect';

function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent);
}

export interface AcademyUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string | null;
  displayName: string;
}

function getUserFromCache(): AcademyUser | null {
  try { return JSON.parse(localStorage.getItem(LS_USER_KEY) || 'null'); }
  catch { return null; }
}

function makeUserData(fbUser: User): AcademyUser {
  const parts = (fbUser.displayName || '').trim().split(' ');
  return {
    uid:         fbUser.uid,
    firstName:   parts[0] || fbUser.email?.split('@')[0] || 'User',
    lastName:    parts.slice(1).join(' ') || '',
    email:       fbUser.email || '',
    photoURL:    fbUser.photoURL || null,
    displayName: fbUser.displayName || fbUser.email || 'User',
  };
}

function persistUser(fbUser: User): AcademyUser {
  const userData = makeUserData(fbUser);
  localStorage.setItem(LS_USER_KEY, JSON.stringify(userData));
  fbUser.getIdToken().then((t) => localStorage.setItem(LS_TOKEN_KEY, t)).catch(() => {});
  return userData;
}

export function useAuth() {
  const [user, setUser] = useState<AcademyUser | null>(getUserFromCache);
  const [loading, setLoading] = useState(!getUserFromCache());

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try { await setPersistence(auth, browserLocalPersistence); } catch {}

      // Handle redirect result (mobile flow)
      if (sessionStorage.getItem(REDIRECT_KEY)) {
        sessionStorage.removeItem(REDIRECT_KEY);
        try {
          const res = await getRedirectResult(auth);
          if (res?.user) {
            setUser(persistUser(res.user));
            setLoading(false);
          }
        } catch {}
      }

      unsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const userData = persistUser(fbUser);
          setUser((prev) => prev?.uid === userData.uid ? prev : userData);
        } else {
          if (!getUserFromCache()) {
            setUser(null);
          }
        }
        setLoading(false);
      });

      // Safety timeout
      setTimeout(() => setLoading(false), 6000);
    })();
    return () => { try { unsub(); } catch {} };
  }, []);

  const signIn = async () => {
    try {
      if (isMobile()) {
        sessionStorage.setItem(REDIRECT_KEY, '1');
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      try {
        const res = await signInWithPopup(auth, googleProvider);
        if (res?.user) { setUser(persistUser(res.user)); }
      } catch (err: any) {
        const code = err?.code || '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
        if (code === 'auth/popup-blocked' || code === 'auth/web-storage-unsupported') {
          sessionStorage.setItem(REDIRECT_KEY, '1');
          await signInWithRedirect(auth, googleProvider);
        }
      }
    } catch (err: any) {
      console.error('[useAuth] signIn error:', err?.code, err?.message);
    }
  };

  const signOut = async () => {
    try { await firebaseSignOut(auth); } catch {}
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem(LS_TOKEN_KEY);
    setUser(null);
  };

  return { user, loading, signIn, signOut };
}
