import { useEffect, useRef } from 'react';
import { useProgressStore } from '../store/useProgressStore';
import { useAuth } from './useAuth';
import { saveProgressToFirestore, loadProgressFromFirestore } from '../services/firestore-progress';
import { getLevelForXP } from '../logic/levels';
import { track } from '../services/analytics';

/**
 * Full progress sync with Firestore.
 * - On sign-in: loads cloud snapshot and merges monotonically (never loses progress)
 * - On any change: debounced 3s save of the complete state
 */
export function useFirestoreSync() {
  const { user } = useAuth();
  const store = useProgressStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedForUser = useRef<string | null>(null);

  // One-time full restore per signed-in user
  useEffect(() => {
    const uid = user?.uid;
    if (!uid || loadedForUser.current === uid) return;
    loadedForUser.current = uid;

    loadProgressFromFirestore(uid).then((remote) => {
      if (!remote) return;

      useProgressStore.setState((local) => {
        const mergedXP = Math.max(local.totalXP, remote.totalXP ?? 0);
        const mergedStreak = Math.max(local.currentStreak, remote.currentStreak ?? 0);

        // Merge dayStatuses: completed > available > undefined
        const rankStatus = (s: string) => s === 'completed' ? 2 : s === 'available' ? 1 : 0;
        const mergedDayStatuses = { ...local.dayStatuses };
        for (const [k, v] of Object.entries(remote.dayStatuses ?? {})) {
          const cur = mergedDayStatuses[Number(k)];
          if (!cur || rankStatus(v) > rankStatus(cur)) {
            mergedDayStatuses[Number(k)] = v as any;
          }
        }

        // Merge taskScores: keep all, prefer correct
        const mergedTaskScores = { ...remote.taskScores, ...local.taskScores };
        for (const [k, rv] of Object.entries(remote.taskScores ?? {})) {
          const lv = local.taskScores[k];
          if (!lv || (!(lv as any).correct && (rv as any)?.correct)) {
            mergedTaskScores[k] = rv as any;
          }
        }

        // Merge miniExamPassed: true wins
        const mergedMiniExam: Record<number, boolean> = { ...local.miniExamPassed };
        for (const [k, v] of Object.entries(remote.miniExamPassed ?? {})) {
          if (v) mergedMiniExam[Number(k)] = true;
        }

        // Merge achievements: union
        const mergedAchievements = Array.from(
          new Set([...local.unlockedAchievements, ...(remote.unlockedAchievements ?? [])])
        );

        // Merge flashcardStates: keep remote ones not yet in local
        const mergedFlashcards = { ...remote.flashcardStates, ...local.flashcardStates };

        track('progress_restored', { remoteXP: remote.totalXP, mergedXP });

        return {
          totalXP: mergedXP,
          level: getLevelForXP(mergedXP).level,
          currentStreak: mergedStreak,
          lastActivityDate: local.lastActivityDate ?? remote.lastActivityDate ?? null,
          dayStatuses: mergedDayStatuses,
          taskScores: mergedTaskScores as any,
          miniExamPassed: mergedMiniExam,
          finalExamPassed: local.finalExamPassed || remote.finalExamPassed,
          finalExamScore: Math.max(local.finalExamScore ?? 0, remote.finalExamScore ?? 0) || null,
          certificateId: local.certificateId ?? remote.certificateId ?? null,
          unlockedAchievements: mergedAchievements,
          flashcardStates: mergedFlashcards as any,
        };
      });
    }).catch(() => { /* offline — keep local */ });
  }, [user]);

  // Debounced full save on any change
  useEffect(() => {
    if (!user?.uid) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveProgressToFirestore(user, {
        totalXP: store.totalXP,
        level: store.level,
        currentStreak: store.currentStreak,
        lastActivityDate: store.lastActivityDate,
        dailyGoal: store.dailyGoal,
        xpToday: store.xpToday,
        xpTodayDate: store.xpTodayDate,
        dayStatuses: store.dayStatuses as any,
        taskScores: store.taskScores,
        miniExamPassed: store.miniExamPassed as any,
        finalExamPassed: store.finalExamPassed,
        finalExamScore: store.finalExamScore,
        certificateId: store.certificateId,
        flashcardStates: store.flashcardStates,
        unlockedAchievements: store.unlockedAchievements,
        miniExamCooldowns: store.miniExamCooldowns as any,
        finalExamCooldown: store.finalExamCooldown,
      });
    }, 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [
    user,
    store.totalXP,
    store.level,
    store.currentStreak,
    store.finalExamPassed,
    store.finalExamScore,
    store.certificateId,
    Object.keys(store.taskScores).length,
    Object.keys(store.dayStatuses).length,
    Object.values(store.miniExamPassed).filter(Boolean).length,
    store.unlockedAchievements.length,
    Object.keys(store.flashcardStates).length,
  ]);
}
