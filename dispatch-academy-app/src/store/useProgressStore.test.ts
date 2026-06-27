import { describe, it, expect, beforeEach } from 'vitest';
import { useProgressStore } from './useProgressStore';
import { useUIStore } from './useUIStore';

describe('useProgressStore.unlockNextDay', () => {
  beforeEach(() => {
    useProgressStore.setState({ dayStatuses: { 1: 'available' } });
  });

  it('marks the finished day completed and opens the next', () => {
    useProgressStore.getState().unlockNextDay(1);
    const { dayStatuses } = useProgressStore.getState();
    expect(dayStatuses[1]).toBe('completed');
    expect(dayStatuses[2]).toBe('available');
  });
});

describe('useProgressStore.addXP', () => {
  beforeEach(() => {
    useProgressStore.setState({ totalXP: 0, level: 1 });
    useUIStore.setState({ showLevelUpModal: false, levelUpData: null });
  });

  it('accumulates XP', () => {
    useProgressStore.getState().addXP(30, 'test');
    expect(useProgressStore.getState().totalXP).toBe(30);
  });

  it('keeps the level when no threshold is crossed', () => {
    useProgressStore.getState().addXP(50, 'test');
    expect(useProgressStore.getState().level).toBe(1);
    expect(useUIStore.getState().showLevelUpModal).toBe(false);
  });

  it('updates the level and triggers the level-up modal on threshold crossing', () => {
    // Level 2 requires 100 XP.
    useProgressStore.getState().addXP(120, 'test');
    expect(useProgressStore.getState().level).toBe(2);
    expect(useUIStore.getState().showLevelUpModal).toBe(true);
    expect(useUIStore.getState().levelUpData).toEqual({ level: 2, title: 'Стажёр' });
  });

  it('can jump multiple levels at once and reports the highest reached', () => {
    // 1000 XP reaches level 5 ("Помощник").
    useProgressStore.getState().addXP(1000, 'test');
    expect(useProgressStore.getState().level).toBe(5);
    expect(useUIStore.getState().levelUpData?.level).toBe(5);
  });

  it('does not re-trigger the modal when staying within the same level', () => {
    useProgressStore.getState().addXP(120, 'test'); // -> level 2, modal on
    useUIStore.setState({ showLevelUpModal: false, levelUpData: null });
    useProgressStore.getState().addXP(20, 'test'); // still level 2
    expect(useProgressStore.getState().level).toBe(2);
    expect(useUIStore.getState().showLevelUpModal).toBe(false);
  });
});
