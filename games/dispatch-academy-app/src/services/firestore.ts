import { getDb } from './firebase';
import type { ProgressState } from '../types/store';

/** Timeout duration for Firestore operations (5 seconds) */
const FIRESTORE_TIMEOUT_MS = 5000;

/**
 * Creates a promise that rejects after the specified timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Firestore operation timed out after ${ms}ms`));
    }, ms);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Saves progress state to Firestore `users/{userId}` document.
 * Uses merge: true to avoid overwriting fields not included in the partial state.
 * Rejects if Firestore doesn't respond within 5 seconds.
 */
export async function saveProgress(
  userId: string,
  state: Partial<ProgressState>
): Promise<void> {
  // Strip action functions — only persist data fields
  const dataFields = stripActions(state);

  const { doc, setDoc } = await import('firebase/firestore');
  const db = await getDb();
  const userDocRef = doc(db, 'users', userId);
  await withTimeout(
    setDoc(userDocRef, dataFields, { merge: true }),
    FIRESTORE_TIMEOUT_MS
  );
}

/**
 * Loads progress state from Firestore `users/{userId}` document.
 * Returns null if the document does not exist.
 * Rejects if Firestore doesn't respond within 5 seconds.
 */
export async function loadProgress(
  userId: string
): Promise<Partial<ProgressState> | null> {
  const { doc, getDoc } = await import('firebase/firestore');
  const db = await getDb();
  const userDocRef = doc(db, 'users', userId);
  const snapshot = await withTimeout(getDoc(userDocRef), FIRESTORE_TIMEOUT_MS);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as Partial<ProgressState>;
}

/**
 * Creates an initial Firestore document for a first-time user.
 * Sets Level 1, 0 XP, Day 1 unlocked, Streak 0, and basic identity fields.
 * Rejects if Firestore doesn't respond within 5 seconds.
 */
export async function createInitialProgress(
  userId: string,
  email: string,
  displayName: string
): Promise<void> {
  const initialData = {
    // Identity
    displayName,
    email,
    createdAt: new Date().toISOString(),

    // XP & Level
    totalXP: 0,
    level: 1,

    // Streak
    currentStreak: 0,
    lastActivityDate: null,

    // Day progress
    dayStatuses: { 1: 'available' },
    taskScores: {},

    // Exam progress
    miniExamPassed: {},
    finalExamPassed: false,
    finalExamScore: null,
    certificateId: null,

    // Flashcard states
    flashcardStates: {},

    // Cooldowns
    miniExamCooldowns: {},
    finalExamCooldown: null,
  };

  const { doc, setDoc } = await import('firebase/firestore');
  const db = await getDb();
  const userDocRef = doc(db, 'users', userId);
  await withTimeout(
    setDoc(userDocRef, initialData),
    FIRESTORE_TIMEOUT_MS
  );
}

/**
 * Strips action functions from a ProgressState partial,
 * keeping only serializable data fields.
 */
function stripActions(
  state: Partial<ProgressState>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(state)) {
    if (typeof value !== 'function') {
      result[key] = value;
    }
  }

  return result;
}
