import { create } from 'zustand';

export interface Account {
  nickname: string;
  createdAt: number;
  totalEarned: number;
  totalShifts: number;
  bestShift: number;
  truckCount: number;
  lastPlayed: number;
}

interface AccountState {
  currentNickname: string | null;
  accounts: Account[];

  login: (nickname: string) => void;
  logout: () => void;
  updateStats: (earned: number, truckCount: number) => void;
  getAccount: (nickname: string) => Account | null;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = 'dispatch-office-accounts';
const CURRENT_KEY = 'dispatch-office-current';

export const useAccountStore = create<AccountState>((set, get) => ({
  currentNickname: null,
  accounts: [],

  loadFromStorage: () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        set({ accounts: [], currentNickname: null });
        return;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      const accounts: Account[] = raw ? JSON.parse(raw) : [];
      const current = localStorage.getItem(CURRENT_KEY) || null;
      set({ accounts, currentNickname: current });
    } catch {
      set({ accounts: [], currentNickname: null });
    }
  },

  saveToStorage: () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const { accounts, currentNickname } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      if (currentNickname) localStorage.setItem(CURRENT_KEY, currentNickname);
      else localStorage.removeItem(CURRENT_KEY);
    } catch {}
  },

  login: (nickname: string) => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const { accounts } = get();
    const exists = accounts.find(a => a.nickname.toLowerCase() === nickname.toLowerCase());
    if (!exists) {
      const newAccount: Account = {
        nickname,
        createdAt: Date.now(),
        totalEarned: 0,
        totalShifts: 0,
        bestShift: 0,
        truckCount: 3,
        lastPlayed: Date.now(),
      };
      const updated = [...accounts, newAccount];
      set({ accounts: updated, currentNickname: nickname });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } else {
      set({ currentNickname: exists.nickname });
    }
    localStorage.setItem(CURRENT_KEY, nickname);
  },

  logout: () => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    set({ currentNickname: null });
    localStorage.removeItem(CURRENT_KEY);
  },

  updateStats: (earned: number, truckCount: number) => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const { accounts, currentNickname } = get();
    if (!currentNickname) return;
    const updated = accounts.map(a => {
      if (a.nickname !== currentNickname) return a;
      return {
        ...a,
        totalEarned: a.totalEarned + earned,
        totalShifts: a.totalShifts + 1,
        bestShift: Math.max(a.bestShift, earned),
        truckCount,
        lastPlayed: Date.now(),
      };
    });
    set({ accounts: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getAccount: (nickname: string) => {
    return get().accounts.find(a => a.nickname.toLowerCase() === nickname.toLowerCase()) || null;
  },
}));
