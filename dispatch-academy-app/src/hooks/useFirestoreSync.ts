import { useEffect, useRef } from 'react';
import { useProgressStore } from '../store/useProgressStore';
import { useAuth } from './useAuth';
import {
  saveProgressToFirestore,
  loadProgressFromFirestore,
} from '../services/firestore-progress';
import { getLevelForXP } from '../logic/levels';
import { track } from '../services/analytics';

/**
 * Automatically syncs progress with Firestore for signed-in users.
 *
 * - On sign-in, restores summary progress from the cloud, merging with the
 *   local state monotonically (takes the higher value) so switching devices
 *   never loses or lowers existing progress.
 * - On change, saves progress (debounced 3s) to avoid excessive writes.
 */
export function useFirestoreSync() {
  const { user } = useAuth();
  const { totalXP, level, currentStreak, taskScores } = useProgressStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedForUser = useRef<string | null>(null);

  // One-time restore from the cloud per signed-in user.
  useEffect(() => {
    const uid = user?.uid;
    if (!uid || loadedForUser.current === uid) return;
    loadedForUser.current = uid;

    loadProgressFromFirestore(uid)
      .then((remote) => {
        if (!remote) return;
        const remoteXP = typeof remote.totalXP === 'number' ? remote.totalXP : 0;
        const remoteStreak =
          typeof remote.currentStreak === 'number' ? remote.currentStreak : 0;

        useProgressStore.setState((state) => {
          const mergedXP = Math.max(state.totalXP, remoteXP);
          const mergedStreak = Math.max(state.currentStreak, remoteStreak);
          if (mergedXP === state.totalXP && mergedStreak === state.currentStreak) {
            return {}; // nothing newer in the cloud
          }
          track('progress_restored', { remoteXP, mergedXP });
          return {
            totalXP: mergedXP,
            level: getLevelForXP(mergedXP).level,
            currentStreak: mergedStreak,
          };
        });
      })
      .catch(() => {
        /* offline or unconfigured — keep local progress */
      });
  }, [user]);

  // Debounced save on change.
  useEffect(() => {
    if (!user?.uid) return; // not logged in — skip

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveProgressToFirestore(user, totalXP, level, currentStreak, taskScores);
    }, 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, totalXP, level, currentStreak, taskScores]);
}
