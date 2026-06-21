import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useProgressStore } from '../store/useProgressStore';
import LoadingSkeleton from './common/LoadingSkeleton';

/**
 * AuthGuard wraps children and enforces authentication.
 * - Listens to Firebase auth state via onAuthStateChanged
 * - Redirects to /login if user is not authenticated
 * - Shows loading skeleton while checking auth state
 * - Passes user info (userId, displayName) to progress store
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const store = useProgressStore.getState();
      // Update store with user identity info
      useProgressStore.setState({
        userId: user.uid,
        displayName: store.displayName || user.displayName || user.email || '',
      });
    }
  }, [user]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
