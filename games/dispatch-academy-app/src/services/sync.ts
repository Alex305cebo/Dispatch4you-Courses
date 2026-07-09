import type { DayStatus } from '../types/progress';

// === Interfaces ===

export interface PendingUpdate {
  id: string;
  timestamp: string; // ISO
  type: 'task-complete' | 'xp-update' | 'flashcard-review' | 'exam-submit';
  payload: Record<string, unknown>;
}

export interface ProgressFields {
  totalXP: number;
  level: number;
  currentStreak: number;
  dayStatuses: Record<number, DayStatus>;
  flashcardNextDates: Record<string, string>;
}

// === Constants ===

const PENDING_SYNC_KEY = 'dispatch-academy-pending-sync';
const MAX_PENDING_UPDATES = 50;

// === Day Status ordering ===

const DAY_STATUS_ORDER: Record<DayStatus, number> = {
  locked: 0,
  available: 1,
  'in-progress': 2,
  completed: 3,
};

// === Queue Management ===

/**
 * Adds a pending update to the offline sync queue in localStorage.
 * Generates a unique id for each update.
 * If the queue exceeds 50 items, removes the oldest (FIFO eviction).
 */
export function addPendingUpdate(update: Omit<PendingUpdate, 'id'>): void {
  const queue = getPendingUpdates();
  const newUpdate: PendingUpdate = {
    ...update,
    id: generateId(),
  };

  queue.push(newUpdate);

  // FIFO eviction: remove oldest if queue exceeds max
  while (queue.length > MAX_PENDING_UPDATES) {
    queue.shift();
  }

  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
}

/**
 * Reads and parses the pending updates queue from localStorage.
 * Returns an empty array if none found or if parsing fails.
 */
export function getPendingUpdates(): PendingUpdate[] {
  const raw = localStorage.getItem(PENDING_SYNC_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as PendingUpdate[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Removes the pending sync localStorage key, clearing all pending updates.
 */
export function clearPendingUpdates(): void {
  localStorage.removeItem(PENDING_SYNC_KEY);
}

// === Merge Strategy ===

/**
 * Compares two DayStatus values and returns the more advanced one.
 * Order: completed > in-progress > available > locked
 */
export function compareDayStatus(a: DayStatus, b: DayStatus): DayStatus {
  return DAY_STATUS_ORDER[a] >= DAY_STATUS_ORDER[b] ? a : b;
}

/**
 * Merges two progress states using per-field maximum value strategy:
 * - totalXP: max(local, remote)
 * - level: max(local, remote)
 * - currentStreak: max(local, remote)
 * - dayStatuses: for each key, use the furthest status
 * - flashcardNextDates: for each key, use the latest date
 */
export function mergeProgressStates(
  local: ProgressFields,
  remote: ProgressFields
): ProgressFields {
  // Merge dayStatuses — use furthest status for each key
  const mergedDayStatuses: Record<number, DayStatus> = { ...local.dayStatuses };
  for (const key of Object.keys(remote.dayStatuses)) {
    const dayId = Number(key);
    const localStatus = mergedDayStatuses[dayId];
    const remoteStatus = remote.dayStatuses[dayId];

    if (remoteStatus !== undefined) {
      if (localStatus === undefined) {
        mergedDayStatuses[dayId] = remoteStatus;
      } else {
        mergedDayStatuses[dayId] = compareDayStatus(localStatus, remoteStatus);
      }
    }
  }

  // Merge flashcardNextDates — use the latest date for each key
  const mergedFlashcardDates: Record<string, string> = { ...local.flashcardNextDates };
  for (const key of Object.keys(remote.flashcardNextDates)) {
    const localDate = mergedFlashcardDates[key];
    const remoteDate = remote.flashcardNextDates[key];

    if (remoteDate !== undefined) {
      if (localDate === undefined) {
        mergedFlashcardDates[key] = remoteDate;
      } else {
        // Compare ISO date strings lexicographically (works for ISO format)
        mergedFlashcardDates[key] = localDate >= remoteDate ? localDate : remoteDate;
      }
    }
  }

  return {
    totalXP: Math.max(local.totalXP, remote.totalXP),
    level: Math.max(local.level, remote.level),
    currentStreak: Math.max(local.currentStreak, remote.currentStreak),
    dayStatuses: mergedDayStatuses,
    flashcardNextDates: mergedFlashcardDates,
  };
}

// === Connectivity Listeners ===

/**
 * Sets up online/offline event listeners.
 * Returns a cleanup function that removes the listeners.
 */
export function setupConnectivityListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

// === Helpers ===

/**
 * Generates a unique id using timestamp + random suffix.
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}
