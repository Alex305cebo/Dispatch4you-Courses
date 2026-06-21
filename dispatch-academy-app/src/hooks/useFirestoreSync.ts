import { useEffect, useRef } from 'react';
import { useProgressStore } from '../store/useProgressStore';
import { useAuth } from './useAuth';
import { saveProgressToFirestore } from '../services/firestore-progress';

/**
 * Automatically syncs progress to Firestore when user is logged in.
 * Debounced — saves 3 seconds after the last change to avoid excessive writes.
 */
export function useFirestoreSync() {
  const { user } = useAuth();
  const { totalXP, level, currentStreak, taskScores } = useProgressStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user?.uid) return; // not logged in — skip

    // Debounce: wait 3s after last change before saving
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveProgressToFirestore(user, totalXP, level, currentStreak, taskScores);
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, totalXP, level, currentStreak, taskScores]);
}
