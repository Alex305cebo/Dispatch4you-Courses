import { getDb } from './firebase';
import type { AcademyUser } from '../hooks/useAuth';

// Full progress snapshot saved/loaded per user
export interface ProgressSnapshot {
  totalXP: number;
  level: number;
  currentStreak: number;
  lastActivityDate: string | null;
  dailyGoal: number;
  xpToday: number;
  xpTodayDate: string | null;
  dayStatuses: Record<string, string>;
  taskScores: Record<string, unknown>;
  miniExamPassed: Record<string, boolean>;
  finalExamPassed: boolean;
  finalExamScore: number | null;
  certificateId: string | null;
  flashcardStates: Record<string, unknown>;
  unlockedAchievements: string[];
  miniExamCooldowns: Record<string, string>;
  finalExamCooldown: string | null;
  // meta
  displayName: string;
  email: string;
  photoURL: string | null;
  lastUpdated: unknown;
}

export async function saveProgressToFirestore(
  user: AcademyUser,
  snapshot: Omit<ProgressSnapshot, 'displayName' | 'email' | 'photoURL' | 'lastUpdated'>
): Promise<void> {
  if (!user?.uid) return;
  try {
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const db = await getDb();

    const data: ProgressSnapshot = {
      ...snapshot,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      lastUpdated: serverTimestamp(),
    };

    await setDoc(doc(db, 'academy-progress', user.uid), data, { merge: false });

    // Leaderboard summary (lightweight)
    const scores = Object.values(snapshot.taskScores);
    const correct = scores.filter((s: any) => s?.correct).length;
    const accuracy = scores.length > 0 ? Math.round((correct / scores.length) * 100) : 0;
    await setDoc(doc(db, 'academy-leaderboard', user.uid), {
      displayName: user.displayName,
      firstName: user.displayName.split(' ')[0] || user.displayName,
      photoURL: user.photoURL,
      totalXP: snapshot.totalXP,
      level: snapshot.level,
      accuracy,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Save failed:', err);
  }
}

export async function loadProgressFromFirestore(uid: string): Promise<ProgressSnapshot | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const db = await getDb();
    const snap = await getDoc(doc(db, 'academy-progress', uid));
    if (snap.exists()) return snap.data() as ProgressSnapshot;
  } catch (err) {
    console.warn('[Firestore] Load failed:', err);
  }
  return null;
}

export async function fetchLeaderboard(): Promise<Array<{
  uid: string;
  displayName: string;
  firstName: string;
  photoURL: string | null;
  totalXP: number;
  level: number;
  accuracy: number;
}>> {
  try {
    const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore');
    const db = await getDb();
    const q = query(collection(db, 'academy-leaderboard'), orderBy('totalXP', 'desc'), limit(20));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() } as any));
  } catch (err) {
    console.warn('[Firestore] Leaderboard failed:', err);
    return [];
  }
}
