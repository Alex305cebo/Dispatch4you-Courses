import { create } from 'zustand';
import { ThemeColors, lightTheme, darkTheme } from '../constants/themes';

type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

function getSavedMode(): ThemeMode {
  try {
    const saved = localStorage.getItem('dispatch-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return 'dark'; // Тёмная тема по умолчанию
}

function applyTheme(mode: ThemeMode) {
  try {
    document.documentElement.setAttribute('data-theme', mode);
    // Применяем цвет фона сразу чтобы не было вспышки светлой темы
    document.body.style.backgroundColor = mode === 'dark' ? '#0f172a' : '#ffffff';
  } catch {}
}

const initialMode = getSavedMode();
applyTheme(initialMode);

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: initialMode,
  colors: initialMode === 'dark' ? darkTheme : lightTheme,

  toggle: () => set((state) => {
    const next: ThemeMode = state.mode === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('dispatch-theme', next); } catch {}
    applyTheme(next);
    return { mode: next, colors: next === 'dark' ? darkTheme : lightTheme };
  }),

  setMode: (mode: ThemeMode) => set(() => {
    try { localStorage.setItem('dispatch-theme', mode); } catch {}
    applyTheme(mode);
    return { mode, colors: mode === 'dark' ? darkTheme : lightTheme };
  }),
}));
