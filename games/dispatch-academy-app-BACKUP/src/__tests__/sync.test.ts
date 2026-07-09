import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addPendingUpdate,
  getPendingUpdates,
  clearPendingUpdates,
  compareDayStatus,
  mergeProgressStates,
  setupConnectivityListeners,
} from '../services/sync';
import type { PendingUpdate, ProgressFields } from '../services/sync';
import type { DayStatus } from '../types/progress';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

describe('getPendingUpdates', () => {
  it('returns empty array when no data in localStorage', () => {
    expect(getPendingUpdates()).toEqual([]);
  });

  it('returns empty array for invalid JSON', () => {
    localStorageMock.setItem('dispatch-academy-pending-sync', 'invalid-json');
    expect(getPendingUpdates()).toEqual([]);
  });

  it('returns empty array for non-array JSON', () => {
    localStorageMock.setItem('dispatch-academy-pending-sync', '{"foo": "bar"}');
    expect(getPendingUpdates()).toEqual([]);
  });

  it('returns stored updates', () => {
    const updates: PendingUpdate[] = [
      { id: 'abc', timestamp: '2024-01-01T00:00:00Z', type: 'task-complete', payload: { taskId: 't1' } },
    ];
    localStorageMock.setItem('dispatch-academy-pending-sync', JSON.stringify(updates));
    expect(getPendingUpdates()).toEqual(updates);
  });
});

describe('addPendingUpdate', () => {
  it('adds an update with a generated id', () => {
    addPendingUpdate({
      timestamp: '2024-01-01T00:00:00Z',
      type: 'task-complete',
      payload: { taskId: 't1' },
    });

    const updates = getPendingUpdates();
    expect(updates).toHaveLength(1);
    expect(updates[0].id).toBeDefined();
    expect(updates[0].id.length).toBeGreaterThan(0);
    expect(updates[0].type).toBe('task-complete');
    expect(updates[0].payload).toEqual({ taskId: 't1' });
  });

  it('appends to existing queue', () => {
    addPendingUpdate({ timestamp: '2024-01-01T00:00:00Z', type: 'task-complete', payload: {} });
    addPendingUpdate({ timestamp: '2024-01-02T00:00:00Z', type: 'xp-update', payload: {} });

    const updates = getPendingUpdates();
    expect(updates).toHaveLength(2);
    expect(updates[0].type).toBe('task-complete');
    expect(updates[1].type).toBe('xp-update');
  });

  it('evicts oldest when queue exceeds 50 items (FIFO)', () => {
    // Add 50 items
    for (let i = 0; i < 50; i++) {
      addPendingUpdate({
        timestamp: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
        type: 'task-complete',
        payload: { index: i },
      });
    }
    expect(getPendingUpdates()).toHaveLength(50);

    // Add one more — should evict the first
    addPendingUpdate({
      timestamp: '2024-03-01T00:00:00Z',
      type: 'exam-submit',
      payload: { index: 50 },
    });

    const updates = getPendingUpdates();
    expect(updates).toHaveLength(50);
    // First item should now be index 1 (index 0 was evicted)
    expect(updates[0].payload).toEqual({ index: 1 });
    // Last item should be the newly added one
    expect(updates[49].payload).toEqual({ index: 50 });
    expect(updates[49].type).toBe('exam-submit');
  });
});

describe('clearPendingUpdates', () => {
  it('removes all pending updates', () => {
    addPendingUpdate({ timestamp: '2024-01-01T00:00:00Z', type: 'task-complete', payload: {} });
    expect(getPendingUpdates()).toHaveLength(1);

    clearPendingUpdates();
    expect(getPendingUpdates()).toEqual([]);
  });

  it('does not throw if no data exists', () => {
    expect(() => clearPendingUpdates()).not.toThrow();
  });
});

describe('compareDayStatus', () => {
  it('returns completed when comparing completed vs any other', () => {
    expect(compareDayStatus('completed', 'locked')).toBe('completed');
    expect(compareDayStatus('completed', 'available')).toBe('completed');
    expect(compareDayStatus('completed', 'in-progress')).toBe('completed');
    expect(compareDayStatus('locked', 'completed')).toBe('completed');
    expect(compareDayStatus('available', 'completed')).toBe('completed');
    expect(compareDayStatus('in-progress', 'completed')).toBe('completed');
  });

  it('returns in-progress when comparing in-progress vs available or locked', () => {
    expect(compareDayStatus('in-progress', 'available')).toBe('in-progress');
    expect(compareDayStatus('in-progress', 'locked')).toBe('in-progress');
    expect(compareDayStatus('available', 'in-progress')).toBe('in-progress');
    expect(compareDayStatus('locked', 'in-progress')).toBe('in-progress');
  });

  it('returns available when comparing available vs locked', () => {
    expect(compareDayStatus('available', 'locked')).toBe('available');
    expect(compareDayStatus('locked', 'available')).toBe('available');
  });

  it('returns the same status when both are equal', () => {
    const statuses: DayStatus[] = ['locked', 'available', 'in-progress', 'completed'];
    for (const s of statuses) {
      expect(compareDayStatus(s, s)).toBe(s);
    }
  });
});

describe('mergeProgressStates', () => {
  const baseState: ProgressFields = {
    totalXP: 100,
    level: 2,
    currentStreak: 3,
    dayStatuses: { 1: 'completed', 2: 'available' },
    flashcardNextDates: { c1: '2024-03-10', c2: '2024-03-12' },
  };

  it('takes max totalXP', () => {
    const local = { ...baseState, totalXP: 200 };
    const remote = { ...baseState, totalXP: 150 };
    expect(mergeProgressStates(local, remote).totalXP).toBe(200);

    const local2 = { ...baseState, totalXP: 100 };
    const remote2 = { ...baseState, totalXP: 300 };
    expect(mergeProgressStates(local2, remote2).totalXP).toBe(300);
  });

  it('takes max level', () => {
    const local = { ...baseState, level: 5 };
    const remote = { ...baseState, level: 3 };
    expect(mergeProgressStates(local, remote).level).toBe(5);
  });

  it('takes max currentStreak', () => {
    const local = { ...baseState, currentStreak: 7 };
    const remote = { ...baseState, currentStreak: 14 };
    expect(mergeProgressStates(local, remote).currentStreak).toBe(14);
  });

  it('merges dayStatuses using furthest status per key', () => {
    const local: ProgressFields = {
      ...baseState,
      dayStatuses: { 1: 'completed', 2: 'in-progress', 3: 'locked' },
    };
    const remote: ProgressFields = {
      ...baseState,
      dayStatuses: { 1: 'in-progress', 2: 'completed', 3: 'available', 4: 'locked' },
    };

    const result = mergeProgressStates(local, remote);
    expect(result.dayStatuses[1]).toBe('completed');
    expect(result.dayStatuses[2]).toBe('completed');
    expect(result.dayStatuses[3]).toBe('available');
    expect(result.dayStatuses[4]).toBe('locked');
  });

  it('merges flashcardNextDates using latest date per key', () => {
    const local: ProgressFields = {
      ...baseState,
      flashcardNextDates: { c1: '2024-03-15', c2: '2024-03-10' },
    };
    const remote: ProgressFields = {
      ...baseState,
      flashcardNextDates: { c1: '2024-03-12', c2: '2024-03-20', c3: '2024-04-01' },
    };

    const result = mergeProgressStates(local, remote);
    expect(result.flashcardNextDates.c1).toBe('2024-03-15'); // local is later
    expect(result.flashcardNextDates.c2).toBe('2024-03-20'); // remote is later
    expect(result.flashcardNextDates.c3).toBe('2024-04-01'); // only in remote
  });

  it('preserves keys only in local', () => {
    const local: ProgressFields = {
      ...baseState,
      dayStatuses: { 1: 'completed', 5: 'available' },
      flashcardNextDates: { c1: '2024-03-10', c5: '2024-04-01' },
    };
    const remote: ProgressFields = {
      ...baseState,
      dayStatuses: { 1: 'in-progress' },
      flashcardNextDates: { c1: '2024-03-08' },
    };

    const result = mergeProgressStates(local, remote);
    expect(result.dayStatuses[5]).toBe('available');
    expect(result.flashcardNextDates.c5).toBe('2024-04-01');
  });
});

describe('setupConnectivityListeners', () => {
  it('adds event listeners and returns a cleanup function', () => {
    const onOnline = vi.fn();
    const onOffline = vi.fn();

    const cleanup = setupConnectivityListeners(onOnline, onOffline);

    // Simulate going online
    window.dispatchEvent(new Event('online'));
    expect(onOnline).toHaveBeenCalledTimes(1);

    // Simulate going offline
    window.dispatchEvent(new Event('offline'));
    expect(onOffline).toHaveBeenCalledTimes(1);

    // Clean up
    cleanup();

    // After cleanup, events should not trigger callbacks
    window.dispatchEvent(new Event('online'));
    window.dispatchEvent(new Event('offline'));
    expect(onOnline).toHaveBeenCalledTimes(1);
    expect(onOffline).toHaveBeenCalledTimes(1);
  });
});
