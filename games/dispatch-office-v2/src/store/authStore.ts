// ═══════════════════════════════════════════════════════
//  authStore.ts — Firebase Auth + профиль пользователя
// ═══════════════════════════════════════════════════════
import { create } from 'zustand';
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { auth, googleProvider } from '@/firebase/config';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;

  init: () => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  init: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },

  signInWithGoogle: async () => {
    set({ error: null });
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      set({ error: e.message || 'Ошибка входа' });
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));
