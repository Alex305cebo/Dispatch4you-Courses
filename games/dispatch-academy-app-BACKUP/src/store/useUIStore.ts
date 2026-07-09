import { create } from 'zustand';
import type { UIState } from '../types/store';

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  soundEnabled: true,
  isOffline: false,
  pendingSyncCount: 0,
  showLevelUpModal: false,
  levelUpData: null,
  toastMessage: null,

  // Actions
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  setOffline: (offline: boolean) => set({ isOffline: offline }),

  showToast: (message: string, duration = 5000) => {
    set({ toastMessage: message });
    setTimeout(() => {
      set({ toastMessage: null });
    }, duration);
  },

  triggerLevelUp: (level: number, title: string) =>
    set({ showLevelUpModal: true, levelUpData: { level, title } }),

  dismissLevelUp: () => set({ showLevelUpModal: false, levelUpData: null }),
}));
