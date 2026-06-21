import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { AcademyUser } from '../hooks/useAuth';

interface ProgressData {
  totalXP: number;
  level: number;
  currentStreak: number;
  taskScoresCount: number;
  accuracy: number;
  lastUpdated: unknown;
}

/**
 * Save player progress to Firestore collection "academy-progress"
 * Also updates "academy-leaderboard" for the leaderboard feature.
 */
export async function saveProgressToFirestore(
  user: AcademyUser,
  totalXP: number,
  level: number,
  currentStreak: number,
  taskScores: Record<string, unknown>
): Promise<void> {
  if (!user?.uid) return;

  const scores = Object.values(taskScores);
  const correct = scores.filter((s: any) => s?.correct).length;
  const accuracy = scores.length > 0 ? Math.round((correct / scores.length) * 100) : 0;

  const data: ProgressData = {
    totalXP,
    level,
    currentStreak,
    taskScoresCount: scores.length,
    accuracy,
    lastUpdated: serverTimestamp(),
  };

  try {
    // Save detailed progress
    await setDoc(doc(db, 'academy-progress', user.uid), {
      ...data,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    }, { merge: true });

    // Update leaderboard entry
    await setDoc(doc(db, 'academy-leaderboard', user.uid), {
      displayName: user.displayName,
      firstName: user.firstName,
      photoURL: user.photoURL,
      totalXP,
      level,
      accuracy,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Save progress failed:', err);
  }
}

/**
 * Load player progress from Firestore (for sync between devices)
 */
export async function loadProgressFromFirestore(uid: string) {
  try {
    const snap = await getDoc(doc(db, 'academy-progress', uid));
    if (snap.exists()) return snap.data();
  } catch (err) {
    console.warn('[Firestore] Load progress failed:', err);
  }
  return null;
}

/**
 * Fetch top leaderboard entries
 */
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
    const q = query(
      collection(db, 'academy-leaderboard'),
      orderBy('totalXP', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() } as any));
  } catch (err) {
    console.warn('[Firestore] Fetch leaderboard failed:', err);
    return [];
  }
}
